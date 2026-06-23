// src/context/InterestContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSubCategories } from '../hooks/useCategories'; // أو useCategories حسب اللي بيرجعلك categories

const InterestContext = createContext();
const STORAGE_KEY = 'userCategoryInterests';
const MAX_INTERESTS = 20;

export const InterestProvider = ({ children }) => {
    const [interests, setInterests] = useState([]);
    const { categories } = useSubCategories(); // <-- هنا بدل API

    useEffect(() => {
        const loadInterests = () => {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

            if (saved.length === 0) {
                setInterests([]);
                return;
            }

            // فلترة IDs على حسب اللي لسه موجود فعلاً في categories
            const validIds = saved.filter((id) =>
                categories.find((cat) => cat.id === id)
            );

            setInterests(validIds);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(validIds));
        };

        if (categories?.length > 0) {
            loadInterests();
        }
    }, [categories]); // rerun لما categories تتحدث

    const addInterest = (categoryId) => {
        if (!categoryId) return;

        let updated = interests.filter((id) => id !== categoryId);
        updated.unshift(categoryId);

        if (updated.length > MAX_INTERESTS) {
            updated = updated.slice(0, MAX_INTERESTS);
        }

        setInterests(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    return (
        <InterestContext.Provider value={{ interests, addInterest }}>
            {children}
        </InterestContext.Provider>
    );
};

export const useUserInterests = () => useContext(InterestContext);
