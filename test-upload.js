const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

// Test file upload to R2 storage
async function testFileUpload() {
  try {
    console.log("Testing R2 file upload...");

    // Check if test file exists
    const testFilePath = path.join(__dirname, "test-document.txt");
    if (!fs.existsSync(testFilePath)) {
      console.log("Creating test file...");
      fs.writeFileSync(
        testFilePath,
        "This is a test document for R2 storage integration.\nCreated on: November 2, 2025\nTesting file upload functionality."
      );
    }

    // Create form data
    const form = new FormData();
    form.append("file", fs.createReadStream(testFilePath));
    form.append("category", "documents");

    // Test without authentication first
    console.log("Testing file upload endpoint...");
    const response = await axios.post(
      "http://localhost:4000/api/files/upload",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: "Bearer test-token", // Invalid token for testing
        },
        timeout: 10000,
      }
    );

    console.log("Success! Response:", response.data);
  } catch (error) {
    console.log("Error occurred:", error.response?.data || error.message);
    console.log("Status code:", error.response?.status);
  }
}

testFileUpload();
