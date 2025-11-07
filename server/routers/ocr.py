import os
import tempfile
import base64
from flask import Blueprint, jsonify, request

ocr_bp = Blueprint('ocr', __name__)

@ocr_bp.route('/image', methods=['POST'])
def ocr_image():
    # Handle OCR image processing
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        
        # Check if file has a filename
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Check if file is an image
        if not (file.filename and file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))):
            return jsonify({'error': 'File must be an image'}), 400
            
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            file.save(tmp_file.name)
            tmp_path = tmp_file.name
            
        # Process the image with OCR (in a real implementation, this would use Tesseract or PaddleOCR)
        # For now, we'll simulate the OCR processing
        try:
            # Simulate OCR processing
            text = "This is sample text extracted from the image using OCR. In a complete implementation, this would contain the actual text content of the image."
            blocks = []  # In a real implementation, this would contain text blocks with positioning info
            
            # Clean up temporary file
            os.unlink(tmp_path)
            
            return jsonify({
                'message': 'Image processed successfully',
                'text': text,
                'blocks': blocks
            }), 200
            
        except Exception as e:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            return jsonify({'error': f'Failed to process image: {str(e)}'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Failed to handle image upload: {str(e)}'}), 500

@ocr_bp.route('/screenshot', methods=['POST'])
def ocr_screenshot():
    # Handle OCR screenshot processing
    try:
        data = request.json
        image_base64 = data.get('image_base64') if data else None
        
        if not image_base64:
            return jsonify({'error': 'No image data provided'}), 400
            
        # Decode base64 image data
        try:
            image_data = base64.b64decode(image_base64)
        except Exception as e:
            return jsonify({'error': 'Invalid base64 image data'}), 400
            
        # Save image temporarily
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            tmp_file.write(image_data)
            tmp_path = tmp_file.name
            
        # Process the screenshot with OCR (in a real implementation, this would use Tesseract or PaddleOCR)
        # For now, we'll simulate the OCR processing
        try:
            # Simulate OCR processing
            text = "This is sample text extracted from the screenshot using OCR. In a complete implementation, this would contain the actual text content of the screenshot."
            blocks = []  # In a real implementation, this would contain text blocks with positioning info
            
            # Clean up temporary file
            os.unlink(tmp_path)
            
            return jsonify({
                'message': 'Screenshot processed successfully',
                'text': text,
                'blocks': blocks
            }), 200
            
        except Exception as e:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            return jsonify({'error': f'Failed to process screenshot: {str(e)}'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Failed to handle screenshot: {str(e)}'}), 500