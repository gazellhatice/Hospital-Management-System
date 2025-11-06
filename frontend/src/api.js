const API_BASE = "http://localhost:8080";

async function apiGet(path) {
  const res = await fetch(API_BASE + path, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("GET hata: " + res.status);
  }
  return res.json();
}

async function apiPost(path, data) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("POST hata: " + res.status);
  }
  return res.json();
}

async function apiPut(path, data) {
  const res = await fetch(API_BASE + path, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("PUT hata: " + res.status);
  }
  return res.json();
}

export { apiGet, apiPost, apiPut };
