import React, { useEffect, useState, useMemo } from 'react';
import './CartPage.scss';
import CartCounter from './CartCounter';
import { useCart } from '../../Context/CartContext';
import { FourSquare } from 'react-loading-indicators';
import { TiDeleteOutline } from "react-icons/ti";

import { TfiReload } from "react-icons/tfi";
import { BsCartX, BsCart4 } from "react-icons/bs";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSubCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { Helmet } from 'react-helmet-async';


const CartCard = ({ product }) => (
    <div className='CartCard'>
        <div className='CartImg'>
            <img src={product.image} alt={product.name_ar} />
        </div>
        <div className='CartCardInfo'>
            <p className='Cname'><strong>{product.name_ar}</strong></p>
            <p className='Cinfo'>اللون: <span>{product.color_ar}</span></p>
            <p className='Cinfo'>القطع: <span>{product.color}</span></p>
            <p className='Cinfo'>الحجم: <span>{product.size}</span></p>
            {product.pieces && (
                <p className='Cinfo'>عدد القطع: <span>{product.pieces} قطعة</span></p>
            )}
        </div>
        {/* {console.log(product)} */}
    </div>
);

const CartPage = () => {
    const location = useLocation();
    const { subcategories } = useSubCategories();
    const navigate = useNavigate();
    const {
        cart,
        loading,
        removeProduct,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        // eslint-disable-next-line no-unused-vars
        confirmOrder,
        fetchCart,
    } = useCart();
    const { products } = useProducts();
    const [showLoading, setShowLoading] = useState(false);

    const cartItems = useMemo(() => {
        if (Array.isArray(cart?.products)) {
            return cart.products.map((item) => ({
                ...item,
                productId: item.id, // ✅ عشان يبقى متوافق مع باقي الكود
                quantity: item.CartProducts?.quantity || 1,
                color: item?.CartProducts?.color || item.size_ar?.[0] || "",
                size: item?.CartProducts?.size || item.size_ar?.[0] || "",
            }));
        }
        return [];
    }, [cart]);

    // console.log(cartItems)

    const productsQuantity = cartItems.length;

    // ✅ حساب السعر الإجمالي
    const totalProductsPrice = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const productData = products.find(p => p.id === item.productId);
            if (!productData) return total;
            const finalPrice =
                productData.salePrice > 0 ? productData.salePrice : productData.price;
            return total + (finalPrice * item.quantity);
        }, 0);
    }, [cartItems, products]);



    useEffect(() => {
        if (loading) {
            setShowLoading(true); // شغل اللودنج على الفور
        } else {
            // خلي اللودنج يظل ظاهر لمدة ثانية إضافية حتى لو loading=false
            const timer = setTimeout(() => setShowLoading(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // ممكن تستخدم 'auto' لو مش عاوز تأثير انسيابي
        });
    }, []);

    const totalQuantity = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [cartItems]);
    // في JSX

    return (

        <><Helmet>
            {/* Title */}
            <title>عربة المشتريات - همسات هوم</title>

            {/* Basic Meta */}
            <meta
                name="description"
                content="استعرض عربة المشتريات الخاصة بك في منصة همسات هوم، وتابع خطوات إتمام الطلب للحصول على أفضل الأدوات المنزلية بأعلى جودة وأفضل سعر."
            />
            <meta name="keywords" content="همسات, همسات هوم, منصة همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت" />

            <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
            <meta name="googlebot" content="index, follow" />
            <meta name="bingbot" content="index, follow" />
            {/* Theme Color (Progressive Enhancement) */}
            <meta name="theme-color" content="#000000" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

            {/* Open Graph / Facebook / WhatsApp */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content="عربة المشتريات - منصة همسات لتجهيز المنازل" />
            <meta
                property="og:description"
                content="اعرض محتويات عربة التسوق الخاصة بك وأكمل عملية الشراء بسهولة مع منصة همسات لتجهيز المنازل."
            />
            <meta property="og:image" content="/Hamasat-ShowCase.webp" />
            <meta property="og:url" content={`${process.env.REACT_APP_API_URL}/cart`} />
            <meta property="og:site_name" content="همسات هوم" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="عربة المشتريات - منصة همسات لتجهيز المنازل" />
            <meta
                name="twitter:description"
                content="اعرض محتويات عربة التسوق الخاصة بك وأكمل عملية الشراء بسهولة مع منصة همسات لتجهيز المنازل."
            />
            <meta name="twitter:image" content="/Hamasat-ShowCase.webp" />

            {/* Canonical URL */}
            <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/cart`} />
        </Helmet>

            <div className='CartPage'>
                <div className='cartHead'>
                    <h2>عربة المشتريات <BsCart4 /> </h2>
                    <p>عدد منتجات العربة: <strong>{productsQuantity}</strong> منتج</p>
                </div>

                <div className="cart-container">
                    <div className="cartT-container">
                        <div className='cartActions-conatinaer'>
                            <div className='cartActions-btns'>
                                <button className='catAction-btn ' title='حذف العربة'
                                    onClick={() => {
                                        if (window.confirm("هل تريد إزالة العربة بالكامل؟")) {
                                            clearCart();
                                        }
                                    }}
                                >
                                    <BsCartX className='del' />  حذف العربة</button>
                                <button className='catAction-btn' title='تحديث العربة' onClick={fetchCart}><TfiReload className='reload' />  تحديث العربة</button>
                            </div>
                            <div className='cartActions-counter'>
                                <p>إجمالي القطع: <strong>{totalQuantity}</strong> قطعة</p>
                            </div>
                        </div>
                        <div className='table-wrapper'>
                            <table className="cart-table">

                                <thead>
                                    <tr>
                                        <th>المنتج</th>
                                        <th>السعر</th>
                                        <th>الكمية</th>
                                        <th>الإجمالي</th>
                                        <th>إزالة</th>
                                    </tr>
                                </thead>
                                {productsQuantity === 0 ? (
                                    <tbody className='emptyCart'>
                                        <tr className='emptyCart'>
                                            <td colSpan="5" className='emptyCart'> عربة المشتريات فارغة</td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tbody>
                                        {showLoading && (<tr className="loading">
                                            <td className='tdLoading'>
                                                <FourSquare color={["#ff6f33"]} />
                                            </td>
                                        </tr>)}
                                        {cartItems
                                            .map((item) => {

                                                const productData = products.find(p => p.id === item.productId);
                                                if (!productData) return null;
                                                return { ...item, ...productData }; // دمج البيانات
                                            })

                                            .filter(Boolean) // إزالة العناصر اللي رجعت null
                                            .sort((a, b) => a.name_ar.localeCompare(b.name_ar)) // ترتيب حسب الاسم بالعربي
                                            .map((fullProduct) => {
                                                const subcategory = subcategories.find(sub => sub.id === fullProduct.subcategoryId);
                                                const subcategoryName = subcategory ? subcategory.name_ar : '';
                                                return (
                                                    <tr key={`${fullProduct.productId}-${fullProduct.color}-${fullProduct.size}`}>
                                                        <td>
                                                            <Link to={`/subcategory/${fullProduct.subcategoryId}/${subcategoryName}/product/${fullProduct.id}/${fullProduct.name_ar}`}
                                                                state={{ from: location.pathname }}
                                                            >
                                                                <CartCard product={fullProduct} />
                                                            </Link>
                                                        </td>
                                                        <td>
                                                            ج.م {(fullProduct.salePrice > 0
                                                                ? Number(fullProduct.salePrice || 0).toLocaleString('en-EG')
                                                                : Number(fullProduct.price || 0).toLocaleString('en-EG')
                                                            )}
                                                        </td>
                                                        <td className='CartCaounter'>
                                                            <CartCounter
                                                                initialQuantity={fullProduct.quantity}
                                                                max={fullProduct.remaining}
                                                                onIncrease={(q) =>
                                                                    increaseQuantity({
                                                                        productId: fullProduct.productId,
                                                                        color: fullProduct.color,
                                                                        size: fullProduct.size,
                                                                        quantity: q
                                                                    })
                                                                }
                                                                onDecrease={(q) =>
                                                                    decreaseQuantity({
                                                                        productId: fullProduct.productId,
                                                                        color: fullProduct.color,
                                                                        size: fullProduct.size,
                                                                        quantity: q
                                                                    })
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            ج.م <strong>
                                                                {(
                                                                    (Number(fullProduct.salePrice) > 0
                                                                        ? Number(fullProduct.salePrice)
                                                                        : Number(fullProduct.price)
                                                                    ) * Number(fullProduct.quantity || 0)
                                                                ).toLocaleString('en-EG')}
                                                            </strong>

                                                        </td>
                                                        <td>
                                                            <button
                                                                className='catAction-btn'
                                                                title='إزالة من العربة'
                                                                onClick={() => {
                                                                    if (window.confirm("هل تريد إزالة هذا المنتج من العربة؟")) {
                                                                        removeProduct({ productId: fullProduct.productId });
                                                                    }
                                                                }}
                                                            >
                                                                <TiDeleteOutline className='remove' />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>

                    <div className="cart-check">
                        <div className="cart-check-items">
                            <div className="cart-check-item total-section">
                                <h4>مصاريف الشحن</h4>
                                <p>تكلفة الشحن تُحدد بناءً على المنطقة وحجم الطرد أو الطلب.</p>
                                <p>
                                    <small><span>(سيتم التواصل معكم لإبلاغكم بقيمة الشحن بعد تحديد وزن الطلب وعنوان التوصيل)</span></small>
                                </p>
                            </div>


                            <div className="cart-check-item info-section">
                                <div style={{ position: 'relative', paddingBottom: '1rem' }}>
                                    {showLoading && (<div className="loading">
                                        <FourSquare color={["#FFF7EF"]} />
                                    </div>)}
                                    <h5>تفاصيل الطلب</h5>
                                    <div className="total-row">
                                        <p>عدد المنتجات: <strong>{productsQuantity}</strong> منتج</p>
                                    </div>
                                    <div className="total-row">
                                        <p>إجمالي القطع: <strong>{totalQuantity}</strong> قطعة</p>
                                    </div>
                                    <div className="total-row">
                                        <p>سعر المنتجات: <span>{Number(totalProductsPrice || 0).toLocaleString('en-EG')} ج.م</span></p>
                                    </div>
                                    <div className="total-row">
                                        <p>مصاريف الشحن: <span><strong>حسب الوزن</strong></span></p>
                                    </div>
                                    <div className="total-row grand-total">
                                        <p>
                                            الإجمالي: <strong>{Number(totalProductsPrice || 0).toLocaleString('en-EG')}</strong> ج.م +
                                            <strong>مصاريف الشحن</strong>
                                        </p>
                                    </div>

                                </div>
                                <button disabled={productsQuantity <= 0} className='checkBtn' onClick={() => { navigate('/cart/checkout'); }}>
                                    تأكيد الطلب
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartPage;
