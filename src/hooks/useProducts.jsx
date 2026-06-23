// src/hooks/useProducts.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// دالة fetch المنتجات
const getProducts = async () => {
    const isAdminView = window.location.pathname.startsWith('/admin');
    const endpoint = `${API_URL}/api/v1/products/get-all${isAdminView ? '?adminView=true' : ''}`;
    const res = await axios.get(endpoint, { withCredentials: isAdminView });
    return (
        res.data?.data?.data?.map((product) => ({
            ...product,
            price: Number(product.price),
        })) || []
    );
};

const queryOptions = {
    retry: (failureCount, error) => {
        // لو ال error status 429 ما نعملش retry
        return error?.response?.status !== 429;
    },
};

const EMPTY_ARRAY = [];

export const useProducts = () => {
    const queryClient = useQueryClient();

    const {
        data: products = EMPTY_ARRAY,
        isLoading: loading,
        error,
        refetch: fetchProducts,
    } = useQuery({
        queryKey: ["products", window.location.pathname.startsWith('/admin')],
        queryFn: getProducts,
        ...queryOptions,
    });

    // ✅ نجيب رسالة الخطأ وكودها
    const errorMessage =
        error?.response?.data?.message || error?.message || null;
    const errorCode = error?.response?.status || null;

    // ✅ refetch كل الـ queries
    const refetchAll = async () => {
        await queryClient.refetchQueries({ queryKey: ["products"] });
    };

    // ✅ نعمل setProducts زي الكونتكست القديم
    const setProducts = (updater) => {
        queryClient.setQueryData(["products", window.location.pathname.startsWith('/admin')], (old) => {
            if (!old) return [];

            // لو المستخدم مرر فانكشن زي useState(prev => ...)
            if (typeof updater === "function") {
                return updater(old);
            }

            // لو مرر array جاهزة
            return updater;
        });
    };

    return {
        products,
        setProducts,   // 🔥 زي الكونتكست القديم
        loading,
        error: errorMessage,
        errorCode,
        fetchProducts,
        refetchAll,
    };
};
