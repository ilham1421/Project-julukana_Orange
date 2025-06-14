import { useEffect, useState } from "react";
import axiosFetch from "../lib/axios";

export default function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosFetch({
                url : url,
                method : "GET"
            });
            if(response.status >= 400) {
                const errorMessage = response.data.message || "An error occurred";
                if(Array.isArray(errorMessage) ) {
                    setError(errorMessage.join(", "));
                } else {
                    setError(response.data.message)
                }
            } else {
                console.log(response.data)
                setData(response.data);
            }
            setData(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData()
    }, [])

    return { data, loading, error, fetchData };
}