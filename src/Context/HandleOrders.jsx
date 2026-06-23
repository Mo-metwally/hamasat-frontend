// src/context/HandleOrders.jsx
import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const HandleOrdersContext = createContext();

export const HandleOrdersProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const api = axios.create({
        baseURL: `${process.env.REACT_APP_API_URL}/api/v1/admin`,
        withCredentials: true,
    });

    // تحديث الحالة
    const updateOrderStatus = async (orderId, status) => {
        if (!isAuthenticated) return;
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await api.patch(`/update-order/${orderId}/status/${status}`);
            setSuccessMessage(res.data.message || "تم تحديث حالة الطلب");
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "حدث خطأ أثناء تحديث الطلب");
        } finally {
            setLoading(false);
        }
    };

    // إضافة AdminNoteOne
    const updateAdminNoteOne = async (orderId, note) => {
        try {
            const res = await api.put(`/order/${orderId}/admin-note-one`, {
                adminNoteOne: note,
            });
            setSuccessMessage("تم تحديث الملاحظة الأولى");
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "خطأ أثناء تحديث الملاحظة");
        }
    };

    // إضافة AdminNoteTwo
    const updateAdminNoteTwo = async (orderId, note) => {
        try {
            const res = await api.put(`/order/${orderId}/admin-note-two`, {
                adminNoteTwo: note,
            });
            setSuccessMessage("تم تحديث الملاحظة الثانية");
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "خطأ أثناء تحديث الملاحظة");
        }
    };

    // إرسال ايميل للعميل
    const sendEmailToCustomer = async (orderId, body) => {
        try {
            const res = await api.post(`/order/${orderId}/send-email`, { body });
            setSuccessMessage("تم إرسال البريد الإلكتروني للعميل");
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "خطأ أثناء إرسال البريد الإلكتروني");
        }
    };

    return (
        <HandleOrdersContext.Provider
            value={{
                loading,
                error,
                successMessage,
                updateOrderStatus,
                updateAdminNoteOne,
                updateAdminNoteTwo,
                sendEmailToCustomer,
            }}
        >
            {children}
        </HandleOrdersContext.Provider>
    );
};

export const useHandleOrders = () => useContext(HandleOrdersContext);
