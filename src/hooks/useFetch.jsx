// Impor hook yang diperlukan dari React
import { useState, useEffect, useCallback } from "react";
import axiosFetch from "../lib/axios"; // Pastikan path ini benar

/**
 * Hook kustom untuk mengambil data dari API.
 * @param {string} url - URL endpoint API.
 * @returns {object} - Objek yang berisi `data`, `loading`, `error`, dan fungsi `refetch`.
 */
export default function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bungkus fetchData dengan useCallback untuk memoization.
  // Ini memastikan fungsi tidak dibuat ulang kecuali dependensinya (url, params) berubah.
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosFetch({
        url: url,
        method: "GET",
        
      });

      console.log("Response data:", response.data);

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
  }

  // useEffect untuk memanggil fetchData saat komponen pertama kali mount atau dependensi berubah.
  useEffect(() => {
    fetchData();
  }, [url]); // Dependensinya sekarang adalah fungsi fetchData yang sudah di-memoize

  // Mengembalikan state dan fungsi refetch untuk digunakan di komponen
  return { data, loading, error, refetch: fetchData };
}
