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
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_summarize():
    """Test the summarize endpoint"""
    print("\nTesting summarize...")
    try:
        text = "Artificial intelligence is transforming industries. From healthcare to finance, AI is revolutionizing how we work and live. Machine learning algorithms can process vast amounts of data to identify patterns and make predictions."
        
        payload = {
            "text": text
        }
        
        response = requests.post(f"{BASE_URL}/llm/summarize", json=payload)
        print(f"Summarize status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Summarize test failed: {e}")
        return False

def test_chat():
    """Test the chat endpoint"""
    print("\nTesting chat...")
    try:
        messages = [
            {"role": "user", "content": "What are the main applications of AI?"}
        ]
        
        payload = {
            "messages": messages
        }
        
        response = requests.post(f"{BASE_URL}/llm/chat", json=payload)
        print(f"Chat status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Chat test failed: {e}")
        return False

def test_pdf_extract():
    """Test the PDF extract endpoint"""
    print("\nTesting PDF extract...")
    try:
        # We can't easily test file upload without a real PDF,
        # but we can test that the endpoint exists
        response = requests.post(f"{BASE_URL}/pdf/extract")
        print(f"PDF extract status: {response.status_code}")
        # This might return 400 (Bad Request) since we didn't send a file,
        # but that's still a valid response showing the endpoint exists
        print(f"Response: {response.json()}")
        return response.status_code in [200, 400]
    except Exception as e:
        print(f"PDF extract test failed: {e}")
        return False

def test_ocr_image():
    """Test the OCR image endpoint"""
    print("\nTesting OCR image...")
    try:
        # We can't easily test file upload without a real image,
        # but we can test that the endpoint exists
        response = requests.post(f"{BASE_URL}/ocr/image")
        print(f"OCR image status: {response.status_code}")
        # This might return 400 (Bad Request) since we didn't send a file,
        # but that's still a valid response showing the endpoint exists
        print(f"Response: {response.json()}")
        return response.status_code in [200, 400]
    except Exception as e:
        print(f"OCR image test failed: {e}")
        return False

if __name__ == "__main__":
    print("AI Assistant Server Endpoint Test Script")
    print("=" * 40)
    
    # Test health check
    health_ok = test_health_check()
    
    if health_ok:
        # Test LLM endpoints
        summarize_ok = test_summarize()
        chat_ok = test_chat()
        
        # Test PDF endpoint
        pdf_ok = test_pdf_extract()
        
        # Test OCR endpoint
        ocr_ok = test_ocr_image()
        
        print("\n" + "=" * 40)
        print("Test Summary:")
        print(f"Health Check: {'PASS' if health_ok else 'FAIL'}")
        print(f"Summarize: {'PASS' if summarize_ok else 'FAIL'}")
        print(f"Chat: {'PASS' if chat_ok else 'FAIL'}")
        print(f"PDF Extract: {'PASS' if pdf_ok else 'FAIL'}")
        print(f"OCR Image: {'PASS' if ocr_ok else 'FAIL'}")
    else:
        print("Server is not responding. Please check that it's running.")