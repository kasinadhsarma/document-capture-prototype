import '@tensorflow/tfjs';

export async function loadTestImage(imagePath: string): Promise<ImageData> {
  // Create an image element
  const img = new Image();
  img.crossOrigin = 'anonymous';

  // Load the image
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imagePath;
  });

  // Create a canvas to get image data
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw image and get image data
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

export async function testDocumentProcessing(imagePath: string): Promise<void> {
  console.log('Starting document processing test...');
  try {
    const imageData = await loadTestImage(imagePath);
    console.log('Image loaded successfully:', {
      width: imageData.width,
      height: imageData.height
    });

    // Create and dispatch a custom event with the image data
    const event = new CustomEvent('documentUpload', {
      detail: { imageData }
    });
    window.dispatchEvent(event);

    console.log('Document processing event dispatched');
  } catch (error) {
    console.error('Test failed:', error);
  }
}
