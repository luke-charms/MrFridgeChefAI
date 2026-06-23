import json
from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from google.genai.errors import ServerError

# Automatically picks up GEMINI_API_KEY from your environment variables
client = genai.Client()

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

# This decorator will automatically retry the function if Google throws a 503 ServerError
@retry(
    stop=stop_after_attempt(3), # Retry up to 3 times
    wait=wait_exponential(multiplier=1, min=2, max=10), # Wait 2s, then 4s...
    retry=retry_if_exception_type(ServerError), # Only retry on server overloads
    reraise=True
)
async def generate_recipes(ingredients: list[str], count: int = 3) -> list[dict]:
    """
    Take a list of ingredient strings and return a list of recipe dicts.

    Gemini's response_mime_type forces valid JSON output every time,
    so we never need to strip markdown fences or handle malformed prose.
    """
    ingredient_list = "\n".join(f"- {item}" for item in ingredients)
    prompt = RECIPE_PROMPT_TEMPLATE.format(count=count, ingredients=ingredient_list)

    # Migrated to client.models.generate_content using standard gemini-1.5-flash
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        ),
    )

    data = json.loads(response.text)
    return data.get("recipes", [])