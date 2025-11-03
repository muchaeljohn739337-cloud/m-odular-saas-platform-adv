// Quick CORS test script
const https = require("https");

const testCORS = (url, origin) => {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "GET",
        headers: {
          Origin: origin,
          "User-Agent": "CORS-Test/1.0",
        },
      },
      (res) => {
        const corsHeader = res.headers["access-control-allow-origin"];
        const statusCode = res.statusCode;

        console.log(`URL: ${url}`);
        console.log(`Origin: ${origin}`);
        console.log(`Status: ${statusCode}`);
        console.log(`CORS Header: ${corsHeader || "NOT SET"}`);
        console.log("---");

        resolve({ statusCode, corsHeader });
      }
    );

    req.on("error", reject);
    req.end();
  });
};

// Test the Vercel origin against our API
const apiUrl = "https://www.advanciapayledger.com/api/system/status";
const vercelOrigin = "https://frontend-kappa-murex-46.vercel.app";

console.log("Testing CORS configuration...\n");

testCORS(apiUrl, vercelOrigin)
  .then((result) => {
    if (result.corsHeader === vercelOrigin || result.corsHeader === "*") {
      console.log("✅ CORS test PASSED - Origin is allowed");
    } else {
      console.log("❌ CORS test FAILED - Origin not allowed");
    }
  })
  .catch((err) => {
    console.log("❌ CORS test ERROR:", err.message);
  });
