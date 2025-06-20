import axios from "axios";
import ValidateError from "./ValidateError";
import { signature } from "./elliptic";

/**
 * @param {import("axios").AxiosRequestConfig} config
 */
export default async function axiosFetch(config, isAuth = true) {
  try {
    if (isAuth) {
      if (!config.headers) config.headers = {};

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");
      const client_secret = localStorage.getItem("client_secret");

      if (!token || !userId || !client_secret) {
        localStorage.removeItem("token");
        localStorage.removeItem("client_secret");
        throw new ValidateError("Session bermasalah, silakan login ulang.");
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const method = config.method?.toUpperCase() || "GET";
      const endpoint = config.url;

      if (!endpoint) {
        throw new ValidateError("URL tidak ditentukan di config axiosFetch");
      }

      const payload = `${timestamp}:${endpoint}:${method}:${userId}`;
      const signatureHash = signature(payload, client_secret);

      Object.assign(config.headers, {
        Authorization: `Bearer ${token}`,
        "x-signature": signatureHash,
        "x-timestamp": timestamp,
        "x-endpoint": endpoint,
        "x-method": method,
      });
    }

    return await axios({
      ...config,
      method: config.method || "GET",
      baseURL: "http://localhost:3000",
      headers: config.headers || {},
      validateStatus: (status) => status < 500, // Tangani error 4xx di luar
    });
  } catch (err) {
    console.error(err);
    if (err instanceof ValidateError) {
      return {
        status: 400,
        data: { message: err.message },
      };
    }

    return {
      status: 500,
      data: {
        message: "Terjadi kesalahan pada server, silakan coba lagi nanti.",
      },
    };
  }
}
