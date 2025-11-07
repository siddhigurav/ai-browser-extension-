import pyttsx3

def text_to_speech(text, lang='en', voice='default'):
    """
    Converts text to speech using pyttsx3.
    """
    engine = pyttsx3.init()
    
    # Set properties (optional)
    # engine.setProperty('rate', 150)  # Speed percent (can go over 100)
    # engine.setProperty('volume', 0.9) # Volume 0-1

    # Get available voices
    voices = engine.getProperty('voices')
    
    # for v in voices:
    #     print("id: %s" % v.id)
    #     print("name: %s" % v.name)
    #     print("languages: %s" % v.languages)
    #     print("gender: %s" % v.gender)
    #     print("age: %s" % v.age)

    # Set voice (optional)
    # engine.setProperty('voice', voices[0].id)  # 0 for male, 1 for female

    # Synthesize speech
    engine.say(text)
    
    # Wait for speech to finish
    engine.runAndWait()
    
    # For now, we don't have a way to return the audio file directly.
    # In a real application, you would save the audio to a file and return the URL.
    return "dummy_audio_url_pyttsx3.mp3"
