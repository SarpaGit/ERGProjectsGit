AI Content Summarizer
This project is a full-stack web application for summarizing content from various sources (web pages, YouTube videos, and local files) using the Gemini Flash model. It is built with a Python Flask backend and a modern HTML/CSS/JS frontend.

Table of Contents
Prerequisites

Local Setup and Testing

Hosting on AWS EC2

Troubleshooting

1. Prerequisites
Before you begin, ensure you have the following installed on your system:

Python 3.8+: The backend is built with Python.

pip: Python's package installer.

A Gemini API Key: You need a valid API key to use the summarization model. You can obtain one from the Google AI Studio.

2. Local Setup and Testing
Follow these steps to set up and run the application on your local machine.

Step 1: Clone the Repository (if applicable) and Navigate to the Project Folder

If your code is in a repository, clone it. Otherwise, place the app.py, index.html, and README.md files in a single directory.

cd content-summarizer-app


Step 2: Create a requirements.txt file

Create a requirements.txt file to manage all project dependencies.

Flask
requests
PyPDF2
pytube
python-dotenv

Step 3: Set up a Python Virtual Environment

It's a best practice to use a virtual environment to manage project dependencies. This isolates the project's packages from your global Python environment.

python3 -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`


Step 4: Install Required Packages

Install all the necessary Python libraries using the requirements.txt file you created.

pip install -r requirements.txt


Step 5: Configure Your Gemini API Key

Create a file named .env in the root of your project directory and add your API key to it. This is a secure way to manage your credentials.

GEMINI_API_KEY="your-gemini-api-key-here"

Step 6: Run the Flask Application

Now you can start the development server.

python3 app.py


The server will be running on http://127.0.0.1:5000 (or http://localhost:5000). Open this URL in your web browser to access the application.

3. Hosting on AWS EC2
This guide provides a general overview for hosting the application on an AWS EC2 instance. We will use a basic Ubuntu server for this example.

Step 1: Launch an EC2 Instance

Log in to your AWS Management Console.

Navigate to the EC2 dashboard and click on "Launch Instance".

Choose a Linux AMI, such as Ubuntu Server 22.04 LTS.

Select an instance type (e.g., t2.micro is in the free tier).

Create a new key pair and download it. Store this .pem file securely.

Configure Security Groups: Add inbound rules for:

SSH: Port 22 (Source My IP for security)

Custom TCP Rule: Port 5000 (Source Anywhere 0.0.0.0/0)

Launch the instance.

Step 2: Connect to the EC2 Instance

Open your terminal.

Change the permissions of your key pair file:

chmod 400 your-key-pair.pem


Connect to your instance using its Public IPv4 DNS:

ssh -i "your-key-pair.pem" ubuntu@<ec2-public-dns-name>


Step 3: Install Dependencies on the EC2 Instance

Once connected, update the package list and install Python and pip.

sudo apt update
sudo apt install python3 python3-pip -y


Step 4: Transfer Your Application Files

You can use scp to copy your files from your local machine to the EC2 instance.

scp -i "your-key-pair.pem" -r ./*.py ./*.html ./requirements.txt ./.env ubuntu@<ec2-public-dns-name>:/home/ubuntu/


Step 5: Set up the Server Environment

Navigate to your project directory on the EC2 instance.

Create a virtual environment and install the dependencies.

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt


The application will now read the API key from the .env file automatically.

Step 6: Run the Flask Application

You can run the application using Flask's built-in server. This is sufficient for simple deployments.

# To make it accessible from outside, run on host 0.0.0.0
flask run --host=0.0.0.0 --port=5000


4. Troubleshooting
Connection Refused: Ensure your Security Group rules are correctly configured to allow inbound traffic on port 5000. Also, check that the Flask app is running on 0.0.0.0 and not 127.0.0.1.

"API Key not found" Error: Double-check that you have correctly set the GEMINI_API_KEY in the .env file.

"Unsupported file type" Error: The application currently only supports .txt and .pdf files.

Failed to get summary: Check the app.log file on the server for detailed error messages. This can provide clues about network issues, API errors, or problems with content parsing.

CORS Errors: If you encounter Cross-Origin Resource Sharing errors, you may need to install and configure Flask-CORS on the server. To do this, run pip install Flask-CORS and add CORS(app) to your app.py file.