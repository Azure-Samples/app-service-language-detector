import os

from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from flask import Flask, render_template, request
from werkzeug.exceptions import HTTPException

app = Flask(__name__)

def create_text_analytics_client():
    key = os.getenv('CS_ACCOUNT_KEY')
    endpoint = f"https://{os.getenv('CS_ACCOUNT_NAME')}.cognitiveservices.azure.com/"
    return TextAnalyticsClient(endpoint=endpoint, credential=AzureKeyCredential(key))

def language_detection(text):
    if not text:
        return {}

    client = create_text_analytics_client()
    response = client.detect_language(documents=[text])
    if response and response[0].primary_language:
        return response[0]

    return {}

@app.route('/')
def index():
 
    text = request.args.get('text', '')
    if not text:
        return render_template('index.html', text="", language=None, error=None)

    result = language_detection(text)
    if result:
        language = result.primary_language.name
        confidence_score = result.primary_language.confidence_score
        score_text = "--"
        if confidence_score > 0.9:
            score_text = "very confident"
        elif confidence_score > 0.3:
            score_text = "somewhat confident - need more text in this language"
        elif confidence_score > 0:
            score_text = "not confident"
        elif confidence_score == 0:
            score_text = "no confidence"

        return render_template('index.html', language=language, score=confidence_score, score_text=score_text, text=text, error=None, cs_result=str(result))
    
    return render_template('index.html', error="Error processing your request")

@app.errorhandler(Exception)
def handle_exception(e):
    # Pass through HTTP errors
    if isinstance(e, HTTPException):
        return e

    # Handle non-HTTP exceptions
    return render_template("error.html", error_type=str(type(e))), 500

if __name__ == '__main__':
    app.run(debug=True)
