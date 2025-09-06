
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import google.generativeai as genai
import youtube_transcript_api
import requests
from bs4 import BeautifulSoup
import pypdf
import io
import logging

# Configure logging
logging.basicConfig(filename='app.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# print(f"youtube_transcript_api loaded from: {youtube_transcript_api.__file__}")

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

class ContentRequest(BaseModel):
    source: str
    summary_type: str

def get_youtube_transcript(video_id: str):
    try:
        transcript = youtube_transcript_api.get_transcript(video_id)
        return " ".join([item['text'] for item in transcript])
    except Exception as e:
        logging.error(f"Could not retrieve transcript: {e}")
        raise HTTPException(status_code=400, detail=f"Could not retrieve transcript: {e}")

def get_webpage_content(url: str):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        return soup.get_text()
    except Exception as e:
        logging.error(f"Could not retrieve webpage content: {e}")
        raise HTTPException(status_code=400, detail=f"Could not retrieve webpage content: {e}")

def extract_text_from_pdf_bytes(pdf_bytes: bytes):
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = pypdf.PdfReader(pdf_file)
        return "".join([page.extract_text() for page in reader.pages])
    except Exception as e:
        logging.error(f"Could not extract text from PDF bytes: {e}")
        raise HTTPException(status_code=400, detail=f"Could not extract text from PDF bytes: {e}")

def get_pdf_content(url: str):
    try:
        response = requests.get(url)
        return extract_text_from_pdf_bytes(response.content)
    except Exception as e:
        logging.error(f"Could not retrieve PDF content from URL: {e}")
        raise HTTPException(status_code=400, detail=f"Could not retrieve PDF content from URL: {e}")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/summarize")
def summarize_content(request: ContentRequest):
    logging.info(f"Received request: {request}")
    source = request.source
    summary_type = request.summary_type

    if "youtube.com" in source or "youtu.be" in source:
        video_id = source.split("v=")[-1].split("&")[0]
        content = get_youtube_transcript(video_id)
    elif source.endswith(".pdf"):
        content = get_pdf_content(source)
    else:
        content = get_webpage_content(source)

    if not content:
        logging.error("Could not extract content from the source.")
        raise HTTPException(status_code=400, detail="Could not extract content from the source.")

    logging.info(f"Extracted content: {content[:200]}...")

    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash-latest")
    model = genai.GenerativeModel(model_name)

    summary_prompts = {
        "tldr": "Provide a very short, one-sentence summary of the following content:",
        "medium": "Provide a medium-length summary (2-3 paragraphs) of the following content:",
        "long": "Provide a detailed, long-form summary of the following content, covering all the key points:"
    }

    prompt = summary_prompts.get(summary_type, "Provide a summary of the following content:")
    
    try:
        response = model.generate_content(prompt + "\n\n" + content)
        summary = response.text
        logging.info(f"Generated summary: {summary}")
        return {"summary": summary}
    except Exception as e:
        logging.error(f"Failed to generate summary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {e}")

@app.post("/upload_pdf_and_summarize")
async def upload_pdf_and_summarize(summary_type: str, pdf_file: UploadFile = File(...)):
    logging.info(f"Received PDF upload request for summary type: {summary_type}")
    if not pdf_file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    try:
        pdf_bytes = await pdf_file.read()
        content = extract_text_from_pdf_bytes(pdf_bytes)
    except Exception as e:
        logging.error(f"Error processing uploaded PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing uploaded PDF: {e}")

    if not content:
        logging.error("Could not extract content from the uploaded PDF.")
        raise HTTPException(status_code=400, detail="Could not extract content from the uploaded PDF.")

    logging.info(f"Extracted content from uploaded PDF: {content[:200]}...")

    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash-latest")
    model = genai.GenerativeModel(model_name)

    summary_prompts = {
        "tldr": "Provide a very short, one-sentence summary of the following content:",
        "medium": "Provide a medium-length summary (2-3 paragraphs) of the following content:",
        "long": "Provide a detailed, long-form summary of the following content, covering all the key points:"
    }

    prompt = summary_prompts.get(summary_type, "Provide a summary of the following content:")
    
    try:
        response = model.generate_content(prompt + "\n\n" + content)
        summary = response.text
        logging.info(f"Generated summary from uploaded PDF: {summary}")
        return {"summary": summary}
    except Exception as e:
        logging.error(f"Failed to generate summary from uploaded PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary from uploaded PDF: {e}")
