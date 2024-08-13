from flask import Flask, render_template, request, abort
import os
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from azure.core.exceptions import ClientAuthenticationError, ServiceRequestError


app = Flask(__name__)

def create_text_analytics_client():
    # Set a default key if missing to avoid TypeError on use
    key = os.getenv('CS_ACCOUNT_KEY', '')
    endpoint = f"https://{os.getenv('CS_ACCOUNT_NAME')}.cognitiveservices.azure.com/"
    return TextAnalyticsClient(endpoint=endpoint, credential=AzureKeyCredential(key))

def language_detection(text):
    if not text:
        return {}

    try:        
        client = create_text_analytics_client()
        response = client.detect_language(documents=[text])
        if response and response[0].primary_language:
            return response[0]
    except ClientAuthenticationError as e:
        # CS_ACCOUNT_NAME environmnet variable missing or CS_ACCOUNT_KEY is invalid
        abort(401, description=e.message)
    except ServiceRequestError as e:
        # CS_ACCOUNT_NAME doesn't exist in Azure
        abort(404, description=e.message)

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
        elif 0.3 < confidence_score < 0.9:
            score_text = "somewhat confident - need more text in this language"
        elif 0 > confidence_score < 0.3:
            score_text = "not confident"
        elif confidence_score == 0:
            score_text = "no confidence"

        return render_template('index.html', language=language, score=confidence_score, scoreText=score_text, text=text, error=None, cs_result=str(result))
    
    return render_template('index.html', text="", language=None, error="Error processing your request")


if __name__ == '__main__':
    app.run(debug=True)
