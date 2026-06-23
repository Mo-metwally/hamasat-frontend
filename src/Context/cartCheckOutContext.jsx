import { createContext, useContext, useState } from "react";

// إنشاء الكونتكست باسم cartCheckOut
const CartCheckOutContext = createContext();

export const CartCheckOutProvider = ({ children }) => {
    const [cartOrderData, setCartOrderData] = useState({
        sessionId: "", // موجود من قبل
        username: "",
        email: "",
        phoneNumber: "",
        ISD: "+20",
        userNote: "",
        address: "",
        area: "",
        street: "",
        buildingNum: "",
        flatNum: "",
    });

    // دالة لإرسال الطلب للـ API
    const placeCartOrder = async () => {
        try {
            // ✨ نسخة مع fallback للإيميل
            const finalData = {
                ...cartOrderData,
                email: cartOrderData.email?.trim() || "usermail@usermaile.com"
            };

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/carts/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(finalData),
            });

            const data = await res.json();
            return data;
        } catch (error) {
            console.error("❌ Cart CheckOut Error:", error);
            throw error;
        }
    };


    return (
        <CartCheckOutContext.Provider value={{ cartOrderData, setCartOrderData, placeCartOrder }}>
            {children}
        </CartCheckOutContext.Provider>
    );
};

// hook لاستخدام الكونتكست بسهولة
export const useCartCheckOut = () => useContext(CartCheckOutContext);
