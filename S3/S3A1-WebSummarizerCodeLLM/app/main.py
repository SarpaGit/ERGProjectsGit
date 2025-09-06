from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import io
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader
import yt_dlp
import google.generativeai as genai
from dotenv import load_dotenv
import logging

load_dotenv()

app = FastAPI()

logger = logging.getLogger(__name__)

# Configure the Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY environment variable not set")
    raise EnvironmentError("GEMINI_API_KEY environment variable not set")
genai.configure(api_key=GEMINI_API_KEY)

class SummaryRequest(BaseModel):
    url: Optional[str] = None
    summary_length: str = "medium"

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        logger.info("Successfully extracted text from PDF.")
        return text
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF file: {e}")

def extract_text_from_url(url: str) -> str:
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        for script in soup(["script", "style"]):
            script.decompose()
        text = soup.get_text(separator="\n")
        lines = [line.strip() for line in text.splitlines()]
        text = "\n".join(line for line in lines if line)
        logger.info(f"Successfully extracted text from URL: {url}")
        return text
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch URL: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {e}")
    except Exception as e:
        logger.error(f"Failed to parse URL content: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse URL content: {e}")

def extract_text_from_youtube(youtube_url: str) -> str:
    logger.info(f"Extracting transcript from YouTube URL: {youtube_url}")
    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['en'],
        'outtmpl': '%(id)s.%(ext)s',
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            video_id = info.get("id")
            subtitle_file = f"{video_id}.en.vtt"
            if not os.path.exists(subtitle_file):
                logger.info("No pre-existing subtitle file found. Attempting to download.")
                ydl_opts['writeautomaticsub'] = True
                info = ydl.extract_info(youtube_url, download=True)
                subtitle_file = f"{video_id}.en.vtt"
                if not os.path.exists(subtitle_file):
                    logger.error("No English subtitles found for this video after download attempt.")
                    raise HTTPException(status_code=404, detail="No English subtitles found for this video")

            with open(subtitle_file, 'r') as f:
                lines = f.readlines()
            os.remove(subtitle_file)
            logger.info(f"Successfully extracted and cleaned up subtitles for video ID: {video_id}")

            text_lines = []
            for line in lines:
                if line.strip() and not line.startswith(('WEBVTT', 'NOTE', 'STYLE', 'REGION')) and '-->' not in line:
                    text_lines.append(line.strip())
            return "\n".join(text_lines)
    except yt_dlp.utils.DownloadError as e:
        logger.error(f"yt-dlp download error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid YouTube URL or video not found: {e}")
    except Exception as e:
        logger.error(f"Failed to extract subtitles: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to extract subtitles: {e}")

def call_gemini_api(text: str, summary_length: str) -> str:
    logger.info(f"Calling Gemini API for summary (length: {summary_length})")
    length_prompts = {
        "short": "Provide a very short, one-sentence summary.",
        "medium": "Provide a medium-length, one-paragraph summary.",
        "long": "Provide a comprehensive, multi-paragraph summary."
    }
    prompt = length_prompts.get(summary_length, "Provide a medium-length, one-paragraph summary.")
    
    model = genai.GenerativeModel('gemini-pro')
    
    try:
        response = model.generate_content(f"{prompt}\n\n{text}")
        logger.info("Successfully received summary from Gemini API.")
        return response.text
    except Exception as e:
        logger.error(f"Gemini API request failed: {e}")
        raise HTTPException(status_code=500, detail=f"Gemini API request failed: {e}")

@app.post("/summarize")
async def summarize(
    summary_length: str = Form("medium"),
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    logger.info(f"Received request to /summarize with length: {summary_length}, url: {url}, file: {file.filename if file else 'None'}")
    if not url and not file:
        logger.warning("Summarize request with no URL or file.")
        raise HTTPException(status_code=400, detail="Either a URL or a file must be provided.")

    text = ""
    source = ""
    if file:
        source = f"file: {file.filename}"
        if file.content_type != "application/pdf":
            logger.warning(f"Invalid file type uploaded: {file.content_type}")
            raise HTTPException(status_code=400, detail="File must be a PDF.")
        file_bytes = await file.read()
        text = extract_text_from_pdf(file_bytes)
    elif url:
        source = f"url: {url}"
        if "youtube.com" in url or "youtu.be" in url:
            text = extract_text_from_youtube(url)
        else:
            text = extract_text_from_url(url)

    if not text.strip():
        logger.warning(f"No text could be extracted from source: {source}")
        raise HTTPException(status_code=400, detail="Could not extract any text from the provided source.")

    summary = call_gemini_api(text, summary_length)
    return JSONResponse(content={"summary": summary})

@app.get("/")
def read_root():
    return {"message": "Welcome to the Content Summarizer API"}