import http from "http";

const data = JSON.stringify({
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
});

const options = {
  hostname: "localhost",
  port: 4000,
  path: "/api/auth/web3/nonce",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
  },
};

console.log("Testing Web3 nonce endpoint...\n");

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);

  let body = "";

  res.on("data", (chunk) => {
    body += chunk;
  });

  res.on("end", () => {
    console.log("Response Body:");
    try {
      const json = JSON.parse(body);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(body);
    }
  });
});

req.on("error", (e) => {
  console.error(`ERROR: ${e.message}`);
  process.exit(1);
});

req.write(data);
req.end();
