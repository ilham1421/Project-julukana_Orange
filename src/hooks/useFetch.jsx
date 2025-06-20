// Impor hook yang diperlukan dari React
import { useState, useEffect, useCallback } from "react";
import axiosFetch from "../lib/axios"; // Pastikan path ini benar

/**
 * Hook kustom untuk mengambil data dari API.
 * @param {string} url - URL endpoint API.
 * @param {object} params - Parameter query untuk dikirim bersama permintaan (misal: untuk pagination, search, dll).
 * @returns {object} - Objek yang berisi `data`, `loading`, `error`, dan fungsi `refetch`.
 */
export default function useFetch(url, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bungkus fetchData dengan useCallback untuk memoization.
  // Ini memastikan fungsi tidak dibuat ulang kecuali dependensinya (url, params) berubah.
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosFetch({
        url: url,
        method: "GET",
        params: params,
      });

      // setData dengan respons langsung dari axios (sudah di-handle oleh interceptor)
      setData(response.data);
    } catch (err) {
      // Error akan ditangkap oleh interceptor axios, namun kita tetap set state error di sini
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred";
      setError(
        Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage
      );
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(params)]); // Dependensi: fetch ulang jika URL atau parameter berubah

  // useEffect untuk memanggil fetchData saat komponen pertama kali mount atau dependensi berubah.
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependensinya sekarang adalah fungsi fetchData yang sudah di-memoize

  // Mengembalikan state dan fungsi refetch untuk digunakan di komponen
  return { data, loading, error, refetch: fetchData };
}
