from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from vision import extract_ingredients
from recipes import generate_recipes

# Initialise FastAPI application
app = FastAPI(title="FridgeChef API", version="0.1.0")

# Configure CORS to allow frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Restrictions for uploaded files to prevent invalid inputs
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_MB = 10


# ----- Schemas -----

class AnalyseResponse(BaseModel):
    ingredients: list[str]


class RecipesRequest(BaseModel):
    ingredients: list[str]
    count: int = 3


class RecipesResponse(BaseModel):
    recipes: list[dict]


# ----- Routes -----

@app.post("/analyse", response_model=AnalyseResponse)
async def analyse_fridge(file: UploadFile = File(...)):
    """
    Accept a fridge photo and return a list of detected ingredients.
    Keeps vision and recipe generation separate for modularity and clarity.
    """
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Use JPEG, PNG, or WebP.",
        )

    image_bytes = await file.read()

    # Check file size to prevent processing large images
    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB} MB.",
        )

    # Attempt to extract ingredients from image using vision module
    try:
        ingredients = await extract_ingredients(image_bytes, file.content_type)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not ingredients:
        raise HTTPException(
            status_code=422,
            detail="No ingredients detected. Try a clearer or better-lit photo.",
        )

    return AnalyseResponse(ingredients=ingredients)


@app.post("/recipes", response_model=RecipesResponse)
async def get_recipes(body: RecipesRequest):
    """
    Accept a list of ingredients and return generated recipes.
    """
    # Validate ingredient list isn't empty
    if not body.ingredients:
        raise HTTPException(status_code=400, detail="Ingredient list cannot be empty.")

    # Validate count is within allowed range (1-6)
    if body.count < 1 or body.count > 6:
        raise HTTPException(status_code=400, detail="count must be between 1 and 6.")

    # Attempt to generate recipes using the recipes module
    try:
        recipes = await generate_recipes(body.ingredients, body.count)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    
    return RecipesResponse(recipes=recipes)


# Health check endpoint to verify the API is running
@app.get("/health")
def health():
    return {"status": "ok"}
