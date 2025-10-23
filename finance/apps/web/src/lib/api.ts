import axios from "axios";
import { authClient } from "./auth-client";
import { headers } from "next/headers";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(
  async (config) => {
    const session = await authClient.getSession({
		fetchOptions: {
			headers: await headers(),
			throw: true,
		},
	});
    if (session) {
      config.headers.Authorization = `Bearer ${session.session.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
