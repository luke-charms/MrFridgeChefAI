import json
import re
import asyncio
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

# Automatically picks up GEMINI_API_KEY from your environment variables
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

# Flash-lite model is best for speed and cost
MODEL = "gemini-2.5-flash-lite"

# Constants for retry logic
MAX_RETRIES = 4
BASE_DELAY_SECONDS = 5

# Prompt template for recipe generation (strict JSON output) with placeholders for ingredients and count
RECIPE_PROMPT_TEMPLATE = """
You are a creative but practical home chef. Given the following ingredients that
someone has in their fridge, suggest {count} recipes they can make right now.

Ingredients available:
{ingredients}

Rules:
- Only use ingredients from the list above. You may assume the user has basic
  pantry staples (salt, pepper, oil, butter, garlic, onion, flour, eggs).
- Keep recipes achievable for a home cook (no specialist equipment).
- Vary the cuisine and style across suggestions.

Respond with ONLY a valid JSON object in this exact shape:
{{
  "recipes": [
    {{
      "title": "Recipe name",
      "cuisine": "e.g. Italian",
      "prep_time_minutes": 10,
      "cook_time_minutes": 20,
      "servings": 2,
      "ingredients_used": ["item from fridge list"],
      "steps": ["Step 1 instruction", "Step 2 instruction"],
      "tip": "One optional serving or substitution tip"
    }}
  ]
}}

No extra text, no markdown fences — only the JSON object.
""".strip()


def _parse_retry_delay(error_str: str) -> float:
    """
    Gemini 429 (Rate Limit) responses include a suggested retryDelay.
    Parse it so we wait exactly as long as Google asks, instead of trying 
    the API again too soon.
    """
    match = re.search(r"retryDelay['\"]:\s*['\"](\d+)s", error_str)
    if match:
        return float(match.group(1))
    return BASE_DELAY_SECONDS


async def generate_recipes(ingredients: list[str], count: int = 3) -> list[dict]:
    # Format the ingredients into a bullet-point list for the prompt
    ingredient_list = "\n".join(f"- {item}" for item in ingredients)

    # Inject the ingredient list and count into the recipe prompt template
    prompt = RECIPE_PROMPT_TEMPLATE.format(count=count, ingredients=ingredient_list)

    last_error = None

    # Retry loop for handling rate limits
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            # Force response to be JSON for easier parsing
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                ),
            )
            # Parse the JSON response to extract recipes
            data = json.loads(response.text)
            return data.get("recipes", [])

        except Exception as e:
            last_error = e
            error_str = str(e)

            # Determine if the error is retryable (rate limit or server error)
            is_retryable = "503" in error_str or "429" in error_str

            if is_retryable and attempt < MAX_RETRIES:
                delay = _parse_retry_delay(error_str)
                print(
                    f"[recipes] Gemini rate limit on attempt {attempt}/{MAX_RETRIES}. "
                    f"Waiting {delay:.0f}s before retry..."
                )
                await asyncio.sleep(delay)
            else:
                break
    
    # If we exhausted retries or encountered a non-retryable error, raise an exception
    raise RuntimeError(
        f"Gemini recipe generation failed after {MAX_RETRIES} attempts: {last_error}"
    )