import json
import re
import asyncio
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

# Automatically picks up GEMINI_API_KEY from your environment variables
client = genai.Client(api_key=api_key)

MODEL = "gemini-2.5-flash-lite"

MAX_RETRIES = 4
BASE_DELAY_SECONDS = 5

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
    Parse the retryDelay Google embeds in 429 responses (e.g. '54s').
    Respecting this avoids wasting retries by hitting the API too early.
    """
    match = re.search(r"retryDelay['\"]:\s*['\"](\d+)s", error_str)
    if match:
        return float(match.group(1))
    return BASE_DELAY_SECONDS


async def generate_recipes(ingredients: list[str], count: int = 3) -> list[dict]:
    ingredient_list = "\n".join(f"- {item}" for item in ingredients)
    prompt = RECIPE_PROMPT_TEMPLATE.format(count=count, ingredients=ingredient_list)

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                ),
            )
            data = json.loads(response.text)
            return data.get("recipes", [])

        except Exception as e:
            last_error = e
            error_str = str(e)
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

    raise RuntimeError(
        f"Gemini recipe generation failed after {MAX_RETRIES} attempts: {last_error}"
    )