import axios from "axios";
import ValidateError from "./ValidateError";
import { signature } from "./elliptic";

/**
 * 
 * @param {import("axios").AxiosRequestConfig} config 
 */
export default async function axiosFetch(config, isAuth = true) {
    try {

        if (isAuth) {
            if(config.headers == null) {
                config.headers = {};
            }
            const token = localStorage.getItem("token");
            if (!token) {
                throw new ValidateError("Token is not set in axiosFetch");
            }

            const userId = localStorage.getItem("user_id");
            if (!userId) {
                localStorage.removeItem("token");
                throw new ValidateError("User ID is not set in axiosFetch");
            }


            config.headers["Authorization"] = `Bearer ${token}`;

            const client_secret = localStorage.getItem("client_secret");

            if (!client_secret) {
                localStorage.removeItem("token");
                throw new ValidateError("Session Bermasalah, silahkan login ulang");
            }

            const timestamp = Math.floor(Date.now() / 1000);

            if (config.url == null || config.method == null) {
                throw new ValidateError("URL or method is not set in axiosFetch");
            }
            const method = config.method.toUpperCase() || "GET";

            const endpoint = config.url 

            const payload = `${timestamp}:${endpoint}:${method}:${userId}`;

            try {

                const signatureHash = signature(payload, client_secret);

                config.headers["x-signature"] = signatureHash;
                config.headers["x-timestamp"] = timestamp;
                config.headers["x-endpoint"] = endpoint;
                config.headers['x-method'] = method

            } catch (err) {
                console.log(err)
                localStorage.removeItem("token");
                localStorage.removeItem("client_secret");
                throw new ValidateError("Session Bermasalah, silahkan login ulang");
            }
        }

        return await axios({
            ...config,
            method: config.method || "GET",
            baseURL: "http://localhost:3000",
            headers: config.headers || {},

            validateStatus: (status) => {
                return status < 500; // Accept all 2xx and 4xx responses
            },

        })
    } catch (err) {
        console.log(err)
        if (err instanceof ValidateError) {
            console.error("ValidateError:", err.message, err.errors);
            return {
                status : 400,
                data : {
                    message : err.message
                }
            }
        } 
        return {
            status : 500,
            data : {
                message : "Terjadi kesalahan pada server, silahkan coba lagi nanti."
            }
        }
    }
}