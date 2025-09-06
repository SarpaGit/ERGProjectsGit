from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # We do not save the file, just respond with info
    file_info = {
        'name': file.filename,
        'size': len(file.read()),  # read file content to get size in bytes
        'type': file.content_type
    }
    return jsonify(file_info)

if __name__ == '__main__':
    app.run(debug=True)