#!/usr/bin/env python3
"""
Test script for the AI Assistant server
This script demonstrates how to interact with the server endpoints
"""

import requests
import json

# Server base URL
BASE_URL = "http://localhost:5000/api"

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")

def test_summarize():
    """Test the summarize endpoint"""
    print("\nTesting summarize...")
    try:
        text = """
        Artificial intelligence (AI) has become one of the most transformative technologies of the 21st century. 
        From virtual assistants like Siri and Alexa to recommendation systems on Netflix and Amazon, 
        AI is increasingly integrated into our daily lives.
        
        In the business world, AI is revolutionizing industries through automation, predictive analytics, 
        and intelligent decision-making systems. Companies are leveraging machine learning algorithms 
        to optimize supply chains, personalize customer experiences, and detect fraud.
        
        Healthcare is another field where AI is making significant strides. Medical imaging systems powered 
        by deep learning can detect diseases with accuracy comparable to human experts. AI-driven drug 
        discovery is accelerating the development of new treatments, and personalized medicine is becoming 
        more accessible through genetic analysis.
        """
        
        payload = {
            "text": text
        }
        
        response = requests.post(f"{BASE_URL}/llm/summarize", json=payload)
        print(f"Summarize status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Summarize test failed: {e}")

def test_chat():
    """Test the chat endpoint"""
    print("\nTesting chat...")
    try:
        messages = [
            {"role": "user", "content": "What are the main applications of AI in healthcare?"}
        ]
        
        payload = {
            "messages": messages
        }
        
        response = requests.post(f"{BASE_URL}/llm/chat", json=payload)
        print(f"Chat status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Chat test failed: {e}")

def test_detect_language():
    """Test the language detection endpoint"""
    print("\nTesting language detection...")
    try:
        payload = {
            "text": "This is a sample text in English."
        }
        
        response = requests.post(f"{BASE_URL}/llm/detect-language", json=payload)
        print(f"Language detection status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Language detection test failed: {e}")

if __name__ == "__main__":
    print("AI Assistant Server Test Script")
    print("=" * 40)
    
    # Test health check
    test_health_check()
    
    # Test summarize
    test_summarize()
    
    # Test chat
    test_chat()
    
    # Test language detection
    test_detect_language()
    
    print("\nTest script completed.")