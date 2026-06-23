import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export const AdminOrdersContext = createContext();

export const AdminOrdersProvider = ({ children }) => {
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState({});
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isAdminPath = location.pathname.startsWith("/admin");

    const fetchOrders = async () => {
        if (!isAdminPath) return; // ❌ ما تعملش أي fetch لو مش /admin

        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/orders`, {
                withCredentials: true,
            });
            setOrders(res.data?.data?.data || []);
            setPagination(res.data?.data?.pagination || {});
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        if (!isAdminPath) return;

        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/orders/order/${orderId}`, {
                withCredentials: true,
            });
            setOrderDetails((prev) => ({
                ...prev,
                [orderId]: res.data.data,
            }));
        } catch (err) {
            console.error("Error fetching order details:", err);
        }
    };

    const updateLocalOrderStatus = (orderId, newStatus, adminNoteOne = null) => {
        if (!isAdminPath) return;

        setOrders((prev) =>
            prev.map((o) =>
                o.id === orderId
                    ? { ...o, status: newStatus, adminNoteOne: adminNoteOne ?? o.adminNoteOne, updatedAt: new Date().toISOString() }
                    : o
            )
        );

        setOrderDetails((prev) => {
            if (!prev[orderId]) return prev;
            return {
                ...prev,
                [orderId]: {
                    ...prev[orderId],
                    status: newStatus,
                    adminNoteOne: adminNoteOne ?? prev[orderId].adminNoteOne,
                    updatedAt: new Date().toISOString(),
                },
            };
        });
    };

    useEffect(() => {
        if (isAdminPath) {
            fetchOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]); // ✅ هيتفعل لما المسار يتغير

    return (
        <AdminOrdersContext.Provider
            value={{
                orders,
                orderDetails,
                pagination,
                loading,
                error,
                fetchOrders,
                fetchOrderDetails,
                updateLocalOrderStatus,
            }}
        >
            {children}
        </AdminOrdersContext.Provider>
    );
};
