document.addEventListener('DOMContentLoaded', function() {
    const summarizeForm = document.getElementById('summarize-form');
    const sourceTypeRadios = document.querySelectorAll('input[name="content_type"]');
    const urlInputDiv = document.getElementById('url-input');
    const fileInputDiv = document.getElementById('file-input');
    const sourceInput = document.getElementById('source');
    const pdfFileInput = document.getElementById('pdf_file');
    const summaryTypeText = document.getElementById('summary_type');
    const summaryText = document.getElementById('summary-text');

    function toggleInputFields() {
        if (document.getElementById('type-pdf').checked) {
            urlInputDiv.style.display = 'none';
            fileInputDiv.style.display = 'block';
            sourceInput.removeAttribute('required');
            pdfFileInput.setAttribute('required', 'required');
        } else {
            urlInputDiv.style.display = 'block';
            fileInputDiv.style.display = 'none';
            sourceInput.setAttribute('required', 'required');
            pdfFileInput.removeAttribute('required');
        }
    }

    sourceTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleInputFields);
    });

    // Initial call to set correct visibility on page load
    toggleInputFields();

    summarizeForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        summaryText.innerText = 'Summarizing...';

        let response;
        const summaryType = summaryTypeText.value;

        if (document.getElementById('type-pdf').checked) {
            const pdfFile = pdfFileInput.files[0];
            if (!pdfFile) {
                summaryText.innerText = 'Please select a PDF file.';
                return;
            }

            const formData = new FormData();
            formData.append('pdf_file', pdfFile);
            formData.append('summary_type', summaryType);

            try {
                response = await fetch('/upload_pdf_and_summarize', {
                    method: 'POST',
                    body: formData
                });
            } catch (error) {
                summaryText.innerText = `Error: ${error.message}`;
                return;
            }

        } else {
            const source = sourceInput.value;
            if (!source) {
                summaryText.innerText = 'Please enter a URL.';
                return;
            }

            try {
                response = await fetch('/summarize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ source, summary_type: summaryType })
                });
            } catch (error) {
                summaryText.innerText = `Error: ${error.message}`;
                return;
            }
        }

        const data = await response.json();

        if (response.ok) {
            summaryText.innerText = data.summary;
        } else {
            summaryText.innerText = `Error: ${data.detail || 'An unknown error occurred.'}`;
        }
    });
});