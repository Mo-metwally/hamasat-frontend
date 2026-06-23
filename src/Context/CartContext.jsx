import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [sessionId, setSessionId] = useState(null);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // 📌 جلب أو إنشاء كارت
    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/carts/cart`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                setSessionId(data.data.sessionId);
                setCart(data.data || {});
            } else {
                setCart([]);
            }
        } catch (error) {
            console.error("❌ Fetch cart error:", error);
            setCart([]);
        } finally {
            setLoading(false);
        }
    };

    // 📌 إضافة منتج
    const addToCart = async (product) => {
        try {
            const payload = {
                productId: product.productId,
                quantity: product.quantity || 1,
                color: product.color || null,
                size: product.size || null,
            };

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/carts/cart/add-product`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await res.json();


            if (data.success) {
                fetchCart(); // تحديث مباشر
            } if (!res.ok) {
                // نرمي error عشان الـ catch في ProductDetails يلقطه
                throw new Error(data.message || "فشل في إضافة المنتج");
            }

            return data;
        } catch (err) {
            console.error("Error in addToCart:", err);
            throw err; // مهم جداً نرميه تاني
        }
    };

    // 📌 إزالة منتج
    const removeProduct = async ({ productId } = {}) => { // ={} يحمي من undefined
        if (!productId) {

            console.error("❌ productId is required");
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/carts/cart/remove-product`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId }),
            });

            const data = await res.json();

            if (data.success) {
                fetchCart();
            }
        } catch (error) {
            console.error("❌ Remove product error:", error);
        }
    };


    // 📌 زيادة الكمية
    const increaseQuantity = async ({ productId }) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/carts/cart/increase-quantity`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId }),
            });

            const data = await res.json();

            if (data.success) {
                // تأخير لمدة ثانية قبل تحديث السلة
                fetchCart();

            }
        } catch (error) {
            console.error("❌ Increase quantity error:", error);
        }
    };

    // 📌 تقليل الكمية
    const decreaseQuantity = async ({ productId }) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/carts/cart/decrease-quantity`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId }),
            });

            const data = await res.json();


            if (data.success) {
                fetchCart();
            }
        } catch (error) {
            console.error("❌ Decrease quantity error:", error);
        }
    };

    // 📌 مسح الكارت
    const clearCart = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/carts/cart/clear-cart`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                setCart([]);
                fetchCart();
            }
        } catch (error) {
            console.error("❌ Clear cart error:", error);
        }
    };

    // 📌 جلب الكارت أول ما يفتح التطبيق
    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <CartContext.Provider
            value={{
                sessionId,
                cart,
                loading,
                addToCart,
                fetchCart,
                clearCart,
                removeProduct,
                increaseQuantity,
                decreaseQuantity,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// 📌 hook للاستخدام
export const useCart = () => useContext(CartContext);
