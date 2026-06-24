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

VISION_PROMPT = """
You are a kitchen assistant. Carefully examine this fridge photo and identify every
food item you can see. Only identify food items. Be specific (e.g. "cherry tomatoes" not just "tomatoes").
Ignore condiment sachets, very small unlabelled items, or anything you are unsure about.

Respond with ONLY a valid JSON object in this exact shape:
{"ingredients": ["item one", "item two", "item three"]}

No extra text, no markdown fences — only the JSON object.
""".strip()


def _parse_retry_delay(error_str: str) -> float:
    """
    Gemini 429 responses include a suggested retryDelay (e.g. '54s').
    Parse it out so we wait exactly as long as Google asks, rather than
    hammering the API again too soon and burning through retries.
    """
    match = re.search(r"retryDelay['\"]:\s*['\"](\d+)s", error_str)
    if match:
        return float(match.group(1))
    return BASE_DELAY_SECONDS


async def extract_ingredients(image_bytes: bytes, media_type: str) -> list[str]:
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=media_type)

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=[image_part, VISION_PROMPT],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                ),
            )
            data = json.loads(response.text)
            return data.get("ingredients", [])

        except Exception as e:
            last_error = e
            error_str = str(e)
            is_retryable = "503" in error_str or "429" in error_str

            if is_retryable and attempt < MAX_RETRIES:
                delay = _parse_retry_delay(error_str)
                print(
                    f"[vision] Gemini rate limit on attempt {attempt}/{MAX_RETRIES}. "
                    f"Waiting {delay:.0f}s before retry..."
                )
                await asyncio.sleep(delay)
            else:
                break

    raise RuntimeError(
        f"Gemini Vision failed after {MAX_RETRIES} attempts: {last_error}"
    )