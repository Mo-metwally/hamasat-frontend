// src/Context/OrderNowContext.jsx
import { createContext, useContext, useState } from "react";

const OrderNowContext = createContext();

export const OrderNowProvider = ({ children }) => {
    const [orderData, setOrderData] = useState({
        productId: "",
        quantity: 1,
        color: "",
        size: "",

        username: "",
        phoneNumber: "",
        ISD: "+20",
        email: "",
        address: "",
        area: "",
        street: "",
        buildingNum: "",
        userNote: "",
        flatNum: "",
    });

    // لتحديث بيانات المنتج عند الضغط على "اطلب الآن" من صفحة المنتج
    const setProductDetails = ({ productId, quantity, color, size }) => {
        setOrderData(prev => ({
            ...prev,
            productId,
            quantity,
            color,
            size,
        }));
    };

    // لتحديث بيانات المستخدم في صفحة checkout
    const setUserDetails = (userDetails) => {
        setOrderData(prev => ({
            ...prev,
            ...userDetails
        }));
    };

    // إرسال الطلب إلى السيرفر
    // إرسال الطلب إلى السيرفر
    const placeOrder = async () => {
        try {
            // ✨ عمل نسخة من البيانات مع fallback للإيميل
            const finalData = {
                ...orderData,
                email: orderData.email?.trim() || "usermail@usermaile.com"
            };

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/orders/order-now`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(finalData),
            });

            const data = await res.json();
            return data;
        } catch (error) {
            console.error("❌ Order Now Error:", error);
            throw error;
        }
    };


    return (
        <OrderNowContext.Provider value={{ orderData, setProductDetails, setUserDetails, placeOrder }}>
            {children}
        </OrderNowContext.Provider>
    );
};

// Hook للاستخدام
export const useOrderNow = () => useContext(OrderNowContext);
