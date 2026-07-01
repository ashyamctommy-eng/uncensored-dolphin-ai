/**
 * Returns the base URL for all API calls.
 *
 * In development (same origin) this is empty — calls go to /api/...
 * In split deployments (e.g. InfinityFree frontend + Render backend)
 * set VITE_API_BASE_URL=https://your-backend.onrender.com in the build env.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
