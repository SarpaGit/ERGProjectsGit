# Content Summarization Service

This is a content summarization service built with Python, FastAPI, and Gemini. It can summarize content from PDFs, web pages, and YouTube videos.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Set up your environment variables:**
    - Create a `.env` file in the root of the project.
    - Add your Gemini API key to the `.env` file:
      ```
      GEMINI_API_KEY=YOUR_API_KEY
      ```

## Running the Service

1.  **Start the FastAPI server:**
    ```bash
    uvicorn main:app --reload
    ```

2.  **Access the API documentation:**
    - Open your browser and go to `http://127.0.0.1:8000/docs` to see the interactive API documentation.

## API Usage

- **Endpoint:** `/summarize`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "source": "<url-to-content>",
    "summary_type": "<tldr|medium|long>"
  }
  ```

### Example Request

```bash
cURL -X POST "http://127.0.0.1:8000/summarize" -H "Content-Type: application/json" -d '{
  "source": "https://www.youtube.com/watch?v=your-video-id",
  "summary_type": "medium"
}'
```

## Deployment to AWS EC2

1.  **Launch an EC2 instance:**
    - Choose an Amazon Machine Image (AMI), such as Amazon Linux 2 or Ubuntu.
    - Select an instance type (e.g., `t2.micro` for testing).
    - Configure security groups to allow inbound traffic on port 80 (HTTP) and 22 (SSH).

2.  **Connect to your EC2 instance:**
    ```bash
    ssh -i /path/to/your-key.pem ec2-user@your-ec2-public-dns
    ```

3.  **Install dependencies on the EC2 instance:**
    ```bash
    sudo yum update -y
    sudo yum install -y python3-pip git
    git clone <repository-url>
    cd <repository-folder>
    pip3 install -r requirements.txt
    ```

4.  **Set up environment variables on the EC2 instance:**
    - Create a `.env` file and add your `GEMINI_API_KEY`.

5.  **Run the application using a process manager (like Gunicorn):**
    ```bash
    pip3 install gunicorn
    gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app -b 0.0.0.0:80
    ```

6.  **Access your service:**
    - You can now access your summarization service using the public DNS of your EC2 instance.
