// Utility to handle PDF processing
export function handlePdfUpload(file) {
  return new Promise((resolve, reject) => {
    // Check if file is a PDF
    if (file.type !== 'application/pdf') {
      reject(new Error('File is not a PDF'));
      return;
    }
    
    // For now, we'll just return basic file info
    // In a full implementation, this would process the PDF
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
    
    resolve(fileInfo);
  });
}

export function processPdfWithBackend(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    
    fetch('http://localhost:5000/api/pdf/extract', {
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