import json
from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from google.genai.errors import ServerError

# Automatically picks up GEMINI_API_KEY from your environment variables
client = genai.Client()

VISION_PROMPT = """
You are a kitchen assistant. Carefully examine this fridge photo and identify every
food item you can see. Be specific (e.g. "cherry tomatoes" not just "tomatoes").
Ignore condiment sachets, very small unlabelled items, or anything you are unsure about.

Respond with ONLY a valid JSON object in this exact shape:
{"ingredients": ["item one", "item two", "item three"]}

No extra text, no markdown fences — only the JSON object.
""".strip()

# This decorator will automatically retry the function if Google throws a 503 ServerError
@retry(
    stop=stop_after_attempt(3), # Retry up to 3 times
    wait=wait_exponential(multiplier=1, min=2, max=10), # Wait 2s, then 4s...
    retry=retry_if_exception_type(ServerError), # Only retry on server overloads
    reraise=True
)
async def extract_ingredients(image_bytes: bytes, media_type: str) -> list[str]:
    """
    Send a fridge photo to Gemini Vision and return a list of ingredient strings.

    The modern SDK uses types.Part.from_bytes to beautifully handle raw images.
    """
    # Use the clean, structured Part helper for inline binary data
    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type=media_type
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[image_part, VISION_PROMPT],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        ),
    )

    data = json.loads(response.text)
    return data.get("ingredients", [])