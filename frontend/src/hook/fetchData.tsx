import { useState } from "react";

/**
 * A reusable custom React hook for sending HTTP requests (GET, POST, etc.)
 * with built-in loading, error, and status handling.
 *
 * @template T - The expected type of the response data
 * @param url - The API endpoint to send the request to
 */
const useFetch = <T,>(url: string) => {
  // ----------------------------
  // State variables
  // ----------------------------
  const [data, setData] = useState<T>();          // Holds the response data
  const [isLoading, setIsLoading] = useState(false); // Indicates if the request is in progress
  const [error, setError] = useState<string>("");  // Stores error message if any
  const [status, setStatus] = useState(0);         // HTTP status code of the response

  /**
   * Sends an HTTP request to the provided `url`.
   * @param options - Standard fetch options (method, headers, body, etc.)
   * @param fallbackErrorMessage - Optional fallback message if the server gives no message
   */
  async function sendRequest(options?: RequestInit, fallbackErrorMessage?: string) {
    setIsLoading(true);
    setError("");

    try {
      // --- Perform the request ---
      const response = await fetch(url, { ...options, mode: "cors" });
      setStatus(response.status);

      // --- Try to parse JSON safely ---
      // If the response body is empty, JSON.parse() will throw, so we catch and return {}
      const resData:any = await response.json().catch(() => ({}));

      // --- Handle HTTP errors ---
      if (!response.ok) {
        // Extract backend message or fallback to status text
        const backendMessage =
          resData.message || resData.error || response.statusText || fallbackErrorMessage;
        throw new Error(backendMessage || "Request failed");
      }

      // --- If everything is okay, update data ---
      setData(resData);
      console.log("Fetched data:", resData);

    } catch (er) {
      // --- Handle both backend and network errors ---
      if (er instanceof Error) {
        setError(er.message);
      } else if (fallbackErrorMessage) {
        setError(fallbackErrorMessage);
      } else {
        setError("Unknown error");
      }
    } finally {
      setIsLoading(false);
    }
  }

   // NEW: Reset all state
  const reset = () => {
    setData(undefined);
    setError("");
    setStatus(0);
    setIsLoading(false);
  };

  // Return all state and functions so they can be used in any component
  return { sendRequest, setError, status, data, isLoading, error, reset };
};

export default useFetch;
