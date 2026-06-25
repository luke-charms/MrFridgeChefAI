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

# Prompt template for recipe generation (strict JSON output)
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
    Gemini 429 (Rate Limit) responses include a suggested retryDelay.
    Parse it so we wait exactly as long as Google asks, instead of trying 
    the API again too soon.
    """
    match = re.search(r"retryDelay['\"]:\s*['\"](\d+)s", error_str)
    if match:
        return float(match.group(1))
    return BASE_DELAY_SECONDS


async def extract_ingredients(image_bytes: bytes, media_type: str) -> list[str]:
    # Create a Part object for the image to send to Gemini Vision
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=media_type)

    last_error = None

    # Retry loop for handling rate limits
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            # Force response to be JSON for easier parsing
            response = client.models.generate_content(
                model=MODEL,
                contents=[image_part, VISION_PROMPT],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                ),
            )
            # Parse the JSON response to extract ingredients
            data = json.loads(response.text)
            return data.get("ingredients", [])

        except Exception as e:
            last_error = e
            error_str = str(e)

            # Determine if the error is retryable (rate limit or server error)
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

    # If we exhausted retries or encountered a non-retryable error, raise an exception
    raise RuntimeError(
        f"Gemini Vision failed after {MAX_RETRIES} attempts: {last_error}"
    )