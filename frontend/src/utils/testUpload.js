async function testDocumentUpload() {
  try {
    // Fetch the sample passport image
    const response = await fetch('/sample_passport.jpg');
    const blob = await response.blob();

    // Create a File object
    const file = new File([blob], 'sample_passport.jpg', { type: 'image/jpeg' });

    // Create a DataTransfer object
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    // Get the file input element and trigger change
    const fileInput = document.querySelector('input[type="file"]');
    fileInput.files = dataTransfer.files;

    // Dispatch change event
    const event = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(event);

    console.log('Test document uploaded successfully');
  } catch (error) {
    console.error('Error in test document upload:', error);
  }
}

// Run the test
testDocumentUpload();
