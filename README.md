# FridgeChef

A full-stack web application that turns a photo of your fridge into a homemade list of recipes you can make. 

Built with a Next.js frontend and a FastAPI Python backend, the app uses a two-step AI pipeline with Google Gemini. It first performs image analysis on a picture to extract available ingredients, allows the user to review and edit that list, and then generates structured recipes directly from the verified ingredients.

## Features

* **AI Vision Analysis:** Upload a photo of your fridge or pantry. The backend uses Gemini 2.5 Flash Lite to identify and extract specific food items, ignoring irrelevant background clutter.
* **Smart Recipe Generation:** Generates localised recipes using only the items you have (plus basic pantry staples). Output is strictly structured via JSON schema for reliable frontend rendering.
* **Modern UI/UX:** Built with React, Tailwind CSS v4, and custom error boundaries to ensure the application degrades gracefully and never leaves the user staring at a broken screen.

## Architecture

The application separates the AI pipeline into two distinct endpoints to improve perceived performance and user control:

1. `POST /analyse`: Accepts a `multipart/form-data` image upload. Runs a multimodal vision prompt and returns a list of strings (`ingredients`).
2. `POST /recipes`: Accepts a JSON list of ingredients. Runs a highly constrained text generation prompt and returns a structured list of recipe objects (title, prep time, steps, etc.).

## Getting Started

Prerequisites
- Node.js 18+
- Python 3.10+
- A Google Gemini API Key

### Setup backend

1. Install requirements
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt

2. Create a .env file in the backend directory and add your Gemini API key:
GEMINI_API_KEY="your_api_key_here"

3. Start the FastAPI server:
uvicorn main:app --reload --port 8000

### Setup frontend

1. Install dependencies
cd frontend
npm install

2. Create a .env.local file in the frontend directory to point to your backend:
NEXT_PUBLIC_API_URL="http://localhost:8000"

3. Start the Next.js development server:
npm run dev

## License

This project is open-source and available under the MIT License.