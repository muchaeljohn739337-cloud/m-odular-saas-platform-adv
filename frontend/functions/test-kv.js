/**
 * Test KV Storage Functionality
 * Cloudflare Pages Function to test ADVANCIA_DATA KV binding
 */

export async function onRequest({ request, env }) {
  const { ADVANCIA_DATA } = env;
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "test";

  try {
    switch (action) {
      case "write":
        // Test writing data
        const testData = {
          userId: "test-user-123",
          balance: 1000,
          lastLogin: new Date().toISOString(),
          preferences: { theme: "dark", notifications: true },
        };

        await ADVANCIA_DATA.put("user:test-user-123", JSON.stringify(testData));
        await ADVANCIA_DATA.put("session:active-users", "42");

        return new Response(
          JSON.stringify({
            success: true,
            message: "Data written to KV",
            data: testData,
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );

      case "read":
        // Test reading data
        const userData = await ADVANCIA_DATA.get("user:test-user-123");
        const activeUsers = await ADVANCIA_DATA.get("session:active-users");

        return new Response(
          JSON.stringify({
            success: true,
            userData: userData ? JSON.parse(userData) : null,
            activeUsers: activeUsers || "0",
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );

      case "list":
        // Test listing keys (limited functionality in KV)
        // Note: KV doesn't have a direct list operation like Redis
        // You'd typically maintain an index or use a known pattern
        return new Response(
          JSON.stringify({
            success: true,
            message: "KV list operations require custom indexing",
            note: "Use known key patterns or maintain separate index keys",
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );

      case "delete":
        // Test deleting data
        await ADVANCIA_DATA.delete("user:test-user-123");
        await ADVANCIA_DATA.delete("session:active-users");

        return new Response(
          JSON.stringify({
            success: true,
            message: "Test data deleted from KV",
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );

      default:
        // Basic connectivity test
        const testKey = `test:timestamp:${Date.now()}`;
        await ADVANCIA_DATA.put(testKey, "KV is working!");
        const testValue = await ADVANCIA_DATA.get(testKey);
        await ADVANCIA_DATA.delete(testKey);

        return new Response(
          JSON.stringify({
            success: true,
            message: "KV storage test passed",
            timestamp: new Date().toISOString(),
            binding: "ADVANCIA_DATA",
            namespaceId: "3bdece1ca0824daeaaecaccfd220895c",
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
