/* will request the backend to remove auth cookies from clienty */
export async function logout() {
  const url = `${process.env.API_URL}/auth/logout`;
  return fetch(url, { method: "GET", credentials: "include" });
}

export async function refreshAccessToken() {
  const url = `${process.env.API_URL}/auth/refresh`;
  return fetch(url, { method: "GET", credentials: "include" });
}

export async function fetchUser() {
  const url = `${process.env.API_URL}/auth/user`;
  return fetch(url, { method: "GET", credentials: "include" });
}
