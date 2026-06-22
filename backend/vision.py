import json
import os
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")

VISION_PROMPT = """
You are a kitchen assistant. Carefully examine this fridge photo and identify every
food item you can see. Be specific (e.g. "cherry tomatoes" not just "tomatoes").
Ignore condiment sachets, very small unlabelled items, or anything you are unsure about.

Respond with ONLY a valid JSON object in this exact shape:
{"ingredients": ["item one", "item two", "item three"]}

No extra text, no markdown fences — only the JSON object.
""".strip()


async def extract_ingredients(image_bytes: bytes, media_type: str) -> list[str]:
    """
    Send a fridge photo to Gemini Vision and return a list of ingredient strings.

    Gemini accepts raw bytes directly via the inline_data format, so no
    base64 encoding is needed on our side — the SDK handles it.
    """
    image_part = {"mime_type": media_type, "data": image_bytes}

    response = model.generate_content(
        [image_part, VISION_PROMPT],
        generation_config={"response_mime_type": "application/json"},
    )

    data = json.loads(response.text)
    return data.get("ingredients", [])
