/* will request the backend to remove auth cookies from clienty */
export async function logout() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`;
  return fetch(url, { method: "GET", credentials: "include" });
}

/* will refresh access token by using a refresh token */
export async function refreshAccessToken() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;
  return fetch(url, { method: "GET", credentials: "include" });
}

/* will fetch user data (access token is required) */
export async function fetchUser() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/user`;
  return fetch(url, { method: "GET", credentials: "include" });
}
