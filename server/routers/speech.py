from flask import Blueprint, jsonify, request
# Use absolute import instead of relative import
from speech.tts_pyttsx3 import text_to_speech as tts

speech_bp = Blueprint('speech', __name__)

@speech_bp.route('/stt', methods=['POST'])
def speech_to_text():
    # Placeholder for Speech-to-Text
    # Expects form-data file
    return jsonify({'message': 'STT request received', 'text': 'Dummy speech to text output.'}), 200

@speech_bp.route('/tts', methods=['POST'])
def text_to_speech_route():
    data = request.json
    text = data.get('text') if data else None
    lang = data.get('lang', 'en') if data else 'en'
    voice = data.get('voice', 'default') if data else 'default'
    
    audio_url = tts(text, lang, voice)
    
    return jsonify({'message': 'TTS request received', 'audio_url': audio_url}), 200