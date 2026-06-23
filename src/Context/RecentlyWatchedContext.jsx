// src/context/RecentlyWatchedContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useProducts } from '../hooks/useProducts'; // تأكد من المسار الصحيح

const RecentlyWatchedContext = createContext();

const STORAGE_KEY = 'recentlyWatchedProducts';
const EXPIRY_DAYS = 7;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

export const RecentlyWatchedProvider = ({ children }) => {
    const [watchedIds, setWatchedIds] = useState([]); // Array of product IDs
    const { products, loading, error } = useProducts();

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const now = Date.now();

        // Filter expired
        const valid = data.filter(item => now - item.timestamp < EXPIRY_DAYS * MS_IN_DAY);

        setWatchedIds(valid.map(item => item.id));

        // Sync localStorage (remove expired)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    }, []);

    const addProduct = (product) => {
        if (!product?.id) return;
        const now = Date.now();
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

        // Remove duplicates and expired
        const filtered = data.filter(item =>
            now - item.timestamp < EXPIRY_DAYS * MS_IN_DAY &&
            item.id !== product.id
        );

        // Add new one
        const updated = [{ id: product.id, timestamp: now }, ...filtered];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setWatchedIds(updated.map(item => item.id));
    };

    // هنا نجيب المنتجات الفعلية من useProducts بناءً على IDs المحفوظة
    const watchedProducts = watchedIds
        .map(id => products.find(p => p.id === id))
        .filter(Boolean); // يشيل undefined لو منتج مش موجود

    return (
        <RecentlyWatchedContext.Provider value={{ watchedProducts, addProduct, loading, error }}>
            {children}
        </RecentlyWatchedContext.Provider>
    );
};

export const useRecentlyWatched = () => useContext(RecentlyWatchedContext);
