export const prerender = false;
export const ssr = false;
export const csr = true;

import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { watchedList } from "@/store";
import { goto } from "$app/navigation";
import axios from "axios";
const { MODE } = import.meta.env;

axios.interceptors.request.use(
  (config) => {
    if (!config.baseURL) {
      config.baseURL = MODE === "development" ? "http://127.0.0.1:3080" : "/api";

      // Only want to set auth header if requesting to our backend.
      const token = localStorage.getItem("token");
      // Don't require token check if going to auth route (login/register)
      if (!token && !config.url?.includes("/auth")) {
        console.error("No token, going to login. Endpoint:", config.url);
        goto("/login?again=1");
        throw new axios.Cancel("No auth token found");
      }
      config.headers.set("Authorization", token);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("Recieved 401 response, going to login.");
      goto("/login?again=1");
      return;
    }
    return Promise.reject(error);
  }
);

export const load = (async () => {
  try {
    const w = await axios.get("/watched");
    watchedList.update((wl) => (wl = w.data));
  } catch (err) {
    console.error("Error loading watched content:", err);
    error(500, "Error loading watched content!");
  }
}) satisfies LayoutLoad;
