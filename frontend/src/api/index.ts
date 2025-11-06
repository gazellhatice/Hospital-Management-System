// src/api/index.ts
import axiosClient from "./axiosClient";

export async function apiGet(path: string) {
  const res = await axiosClient.get(path);
  return res.data;
}
export async function apiPost(path: string, body?: any) {
  const res = await axiosClient.post(path, body);
  return res.data;
}
