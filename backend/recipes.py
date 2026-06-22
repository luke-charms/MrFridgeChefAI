import json
import os
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")

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


async def generate_recipes(ingredients: list[str], count: int = 3) -> list[dict]:
    """
    Take a list of ingredient strings and return a list of recipe dicts.

    Gemini's response_mime_type forces valid JSON output every time,
    so we never need to strip markdown fences or handle malformed prose.
    """
    ingredient_list = "\n".join(f"- {item}" for item in ingredients)
    prompt = RECIPE_PROMPT_TEMPLATE.format(count=count, ingredients=ingredient_list)

    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"},
    )

    data = json.loads(response.text)
    return data.get("recipes", [])
