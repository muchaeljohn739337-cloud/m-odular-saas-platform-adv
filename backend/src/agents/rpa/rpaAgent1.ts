import axios from "axios";

export async function runRpaAgent1() {
  try {
    const response = await axios.get("https://example.com/api/health1");
    // Handle and store the response as needed
    return { status: "ok", data: response.data };
  } catch (error: unknown) {
    // Log and handle error
    return {
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
