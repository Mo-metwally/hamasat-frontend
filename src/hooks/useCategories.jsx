// src/hooks/useSubCategories.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// ✅ دوال API
const getCategories = async () => {
    const res = await axios.get(`${API_URL}/api/v1/categories`);
    return res.data?.data?.data || [];
};

const getSubcategories = async () => {
    const res = await axios.get(`${API_URL}/api/v1/subcategories`);
    return res.data?.data?.data || [];
};

const getBrands = async () => {
    const res = await axios.get(`${API_URL}/api/v1/brands`);
    return res.data?.data?.data || [];
};

// ✅ hook رئيسي
export const useSubCategories = () => {
    const queryClient = useQueryClient();

    const queryOptions = {
        staleTime: 1000 * 60 * 5,  // 5 دقائق
        cacheTime: 1000 * 60 * 10, // 10 دقائق
    };

    // جلب البيانات (v5 syntax)
    const {
        data: categories = [],
        isLoading: loadingCategories,
        error: errorCategories,
        refetch: fetchCategories,
    } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
        ...queryOptions,
    });

    const {
        data: subcategories = [],
        isLoading: loadingSubcategories,
        error: errorSubcategories,
        refetch: fetchSubcategories,
    } = useQuery({
        queryKey: ["subcategories"],
        queryFn: getSubcategories,
        ...queryOptions,
    });

    const {
        data: brands = [],
        isLoading: loadingBrands,
        error: errorBrands,
        refetch: fetchBrands,
    } = useQuery({
        queryKey: ["brands"],
        queryFn: getBrands,
        ...queryOptions,
    });

    // options جاهزة
    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name_ar,
        image: cat.image,
    }));

    const subcategoryOptions = subcategories.map((sub) => ({
        value: sub.id,
        label: sub.name_ar,
        image: sub.image,
    }));

    const brandOptions = brands.map((brand) => ({
        value: brand.id,
        label: brand.name_ar,
        image: brand.image,
    }));

    // ✅ refetchAll (v5)
    const refetchAll = async () => {
        await Promise.all([
            queryClient.refetchQueries({ queryKey: ["categories"] }),
            queryClient.refetchQueries({ queryKey: ["subcategories"] }),
            queryClient.refetchQueries({ queryKey: ["brands"] }),
        ]);
    };

    return {
        categories,
        subcategories,
        brands,
        categoryOptions,
        subcategoryOptions,
        brandOptions,
        loading: loadingCategories || loadingSubcategories || loadingBrands,
        error: errorCategories || errorSubcategories || errorBrands,
        fetchCategories,
        fetchSubcategories,
        fetchBrands,
        refetchAll,
    };
};
