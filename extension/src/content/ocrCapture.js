// Utility to handle OCR processing
export function handleImageUpload(file) {
  return new Promise((resolve, reject) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }
    
    // For now, we'll just return basic file info
    // In a full implementation, this would process the image
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
    
    resolve(fileInfo);
  });
}

export function processImageWithBackend(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    
    fetch('http://localhost:5000/api/ocr/image', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      reject(error);
    });
  });
}

export function processScreenshotWithBackend(imageData) {
  return new Promise((resolve, reject) => {
    const payload = {
      image_base64: imageData
    };
    
    fetch('http://localhost:5000/api/ocr/screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      reject(error);
    });
  });
}