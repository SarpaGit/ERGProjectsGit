import os
import requests
import logging
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
from pytube import YouTube
from pytube.exceptions import PytubeError, VideoUnavailable, RegexMatchError, LiveStreamError, AgeRestrictedError
import PyPDF2
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()

# --- Configuration ---
# Configure logging to write to a file and the console.
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    handlers=[
                        logging.FileHandler("app.log"),
                        logging.StreamHandler()
                    ])

# Set a placeholder for the Gemini API key.
# This is now read from the .env file
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# --- Gemini API Helper Function ---
def summarize_with_gemini(text_to_summarize, is_grounded=False):
    """
    Sends text to the Gemini API for summarization.
    """
    if not GEMINI_API_KEY:
        logging.error("GEMINI_API_KEY is not set. Please ensure it is in your .env file.")
        return None, "API key not found. Please set the GEMINI_API_KEY environment variable in your .env file."

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={GEMINI_API_KEY}"
    
    # User prompt to the LLM
    user_query = f"Provide a detailed summary of the following content: {text_to_summarize}"
    
    # Construct the payload
    payload = {
        "contents": [{"parts": [{"text": user_query}]}]
    }
    
    # If the summary is from a webpage, enable Google Search grounding
    if is_grounded:
        payload["tools"] = [{"google_search": {}}]

    try:
        response = requests.post(api_url, json=payload)
        response.raise_for_status()
        
        result = response.json()
        
        # Check for candidates and content parts
        if 'candidates' in result and result['candidates'] and \
           'content' in result['candidates'][0] and \
           'parts' in result['candidates'][0]['content'] and \
           result['candidates'][0]['content']['parts']:
            summary = result['candidates'][0]['content']['parts'][0]['text']
            logging.info("Summary generated successfully.")
            return summary, None
        else:
            error_message = f"API response was successful but no content was returned. Response: {result}"
            logging.error(error_message)
            return None, "Failed to generate summary: The API did not return a valid response."

    except requests.exceptions.HTTPError as http_err:
        error_message = f"HTTP error occurred: {http_err} - Response: {response.text}"
        logging.error(error_message)
        return None, f"HTTP Error: {response.text}"
    except Exception as e:
        error_message = f"An unexpected error occurred: {e}"
        logging.error(error_message)
        return None, f"An unexpected error occurred: {e}"

# --- API Endpoints ---
@app.route('/')
def home():
    """Renders the HTML file for the web client."""
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize_content():
    """
    Main endpoint to handle summarization requests from the frontend.
    """
    data_type = request.form.get('data_type')
    log_messages = []
    content = ""
    is_grounded = False

    try:
        if data_type == 'url':
            url = request.form.get('url')
            if not url:
                log_messages.append("No URL provided.")
                return jsonify({'summary': '', 'logs': log_messages, 'error': 'No URL provided.'}), 400
            
            logging.info(f"Attempting to summarize content from URL: {url}")
            log_messages.append(f"Fetching content from URL: {url}")
            
            # Use Google Search grounding for web content
            is_grounded = True
            content = url
            
        elif data_type == 'youtube':
            video_url = request.form.get('video_url')
            if not video_url:
                log_messages.append("No YouTube URL provided.")
                return jsonify({'summary': '', 'logs': log_messages, 'error': 'No YouTube URL provided.'}), 400
                
            logging.info(f"Attempting to summarize YouTube video: {video_url}")
            log_messages.append(f"Fetching transcript for YouTube video: {video_url}")
            
            try:
                yt = YouTube(video_url)
                if not yt.captions.get('a.en'):
                    raise ValueError("No English captions available for this video.")
                transcript = yt.captions['a.en']
                content = transcript.generate_transcript_xml()
            except PytubeError as e:
                # Catches a wide range of Pytube-related errors, including unavailable videos.
                error_message = f"Could not fetch YouTube video transcript: {e}"
                logging.error(error_message)
                return jsonify({'summary': '', 'logs': log_messages, 'error': f'Failed to get YouTube video transcript. Please check the URL or try a different video. Error: {e}'}), 400
            except ValueError as e:
                error_message = f"Failed to get summary: {e}"
                logging.error(error_message)
                return jsonify({'summary': '', 'logs': log_messages, 'error': str(e)}), 400

        elif data_type == 'file':
            file = request.files.get('file')
            if not file:
                log_messages.append("No file provided.")
                return jsonify({'summary': '', 'logs': log_messages, 'error': 'No file provided.'}), 400
            
            filename = secure_filename(file.filename)
            logging.info(f"Attempting to summarize file: {filename}")
            log_messages.append(f"Processing file: {filename}")
            
            if filename.lower().endswith('.txt'):
                content = file.read().decode('utf-8')
            elif filename.lower().endswith('.pdf'):
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    content += page.extract_text()
            else:
                log_messages.append(f"Unsupported file type: {filename}")
                return jsonify({'summary': '', 'logs': log_messages, 'error': 'Unsupported file type. Please upload a .txt or .pdf file.'}), 400
        else:
            log_messages.append("Invalid data type specified.")
            return jsonify({'summary': '', 'logs': log_messages, 'error': 'Invalid data type.'}), 400

        # Pass content to the Gemini summarizer
        summary, error = summarize_with_gemini(content, is_grounded)
        log_messages.append("Sending content to Gemini API...")

        if error:
            log_messages.append(f"Error from Gemini API: {error}")
            return jsonify({'summary': '', 'logs': log_messages, 'error': f'Failed to summarize: {error}'}), 500
        
        log_messages.append("Summary generated successfully!")
        return jsonify({'summary': summary, 'logs': log_messages, 'error': ''}), 200

    except Exception as e:
        error_message = f"An error occurred during summarization: {e}"
        logging.error(error_message, exc_info=True)
        log_messages.append(error_message)
        return jsonify({'summary': '', 'logs': log_messages, 'error': error_message}), 500

if __name__ == '__main__':
    # When testing locally, run with debug mode.
    # In production on AWS, a WSGI server like Gunicorn should be used.
    app.run(debug=True)
