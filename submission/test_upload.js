const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function uploadTestDocument() {
  const form = new FormData();
  form.append('document', fs.createReadStream('../backend/sample_passport.jpg'));

  try {
    const response = await axios.post('http://localhost:3001/api/documents/extract', form, {
      headers: form.getHeaders()
    });
    console.log('Document Processing Results:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

uploadTestDocument();
