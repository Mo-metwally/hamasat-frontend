import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const { products = [] } = useProducts() || {};

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    // نثبت المنتجات لتجنب تغيير المرجع في كل رندر
    const memoProducts = useMemo(() => products, [products]);

    useEffect(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) {
            if (suggestions.length > 0) setSuggestions([]);
            return;
        }

        const uniqueNames = new Set();
        memoProducts.forEach(product => {
            const nameEn = product.name_en || '';
            const nameAr = product.name_ar || '';
            if (nameEn.toLowerCase().includes(term)) uniqueNames.add(nameEn);
            if (nameAr.toLowerCase().includes(term)) uniqueNames.add(nameAr);
        });

        const newSuggestions = [...uniqueNames].slice(0, 10);

        // تحديث الحالة فقط لو اقتراحات جديدة
        if (JSON.stringify(newSuggestions) !== JSON.stringify(suggestions)) {
            setSuggestions(newSuggestions);
        }
    }, [searchTerm, memoProducts, suggestions]);

    return (
        <SearchContext.Provider value={{ searchTerm, setSearchTerm, suggestions }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => useContext(SearchContext);
