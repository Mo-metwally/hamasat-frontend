import React, { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSubCategories } from '../../hooks/useCategories';
import { FourSquare } from 'react-loading-indicators';
// import { FaPlus } from "react-icons/fa6";
import { useCart } from '../../Context/CartContext';
import { toast } from 'react-toastify';
import { useProducts } from '../../hooks/useProducts';


const Bundel = () => {
    const location = useLocation();
    const { subcategories } = useSubCategories();
    const { products, loading, error } = useProducts();
    const { productId } = useParams();
    const { addToCart } = useCart();


    // المنتج الحالي
    const currentProduct = useMemo(() => {
        return products.find((product) => product.id === productId);
    }, [products, productId]);

    // تصفية المنتجات بناء على keywords
    const relatedProducts = useMemo(() => {
        if (!currentProduct || !currentProduct.keywords) return [];

        return products.filter(
            (product) =>
                product.id !== currentProduct.id &&
                product.keywords?.some((kw) => currentProduct.keywords.includes(kw))
        );
    }, [products, currentProduct]);

    const allProducts = [currentProduct, ...relatedProducts];

    // فلترة المنتجات المتوفرة فقط
    const availableProducts = allProducts.filter(product => product.remaining > 0);

    const totalPrice = availableProducts.reduce((sum, product) => {
        return sum + Number(product.price || 0);
    }, 0);

    const totalSalePrice = availableProducts.reduce((sum, product) => {
        const sale = product.salePrice > 0 ? product.salePrice : product.price;
        return sum + Number(sale || 0);
    }, 0);

    const totalDiscount = availableProducts.reduce((sum, product) => {
        return sum + Number(product.discount || 0);
    }, 0);

    const handleAddToCart = async () => {
        try {
            for (const product of allProducts) {
                if (product.remaining === 0) continue; // تجاهل المنتجات غير المتوفرة

                await addToCart({
                    productId: product.id,
                    quantity: 1,
                    color: Array.isArray(product.size_ar)
                        ? product.size_ar[0]
                        : product.size_ar || "",
                    size: product.size_en?.[0] || product.size_ar?.[0] || "",
                });
            }

            toast.success("✅ تم إضافة البندل إلى العربة", {
                position: "top-right",
                autoClose: 2000,
            });

        } catch (err) {
            console.error("خطأ أثناء إضافة المنتج:", err);

            const errorMsg = err?.response?.data?.message || err.message;

            if (errorMsg === "Not enough stock available") {
                toast.error(" الكمية المطلوبة غير متوفرة في المخزن تفقد العربة", {
                    autoClose: 2000,
                    position: "top-right",
                });
            } else if (/Cannot add more than \d+ units/i.test(errorMsg)) {
                // استخراج الرقم
                const match = errorMsg.match(/Cannot add more than (\d+) units/i);
                const units = match ? match[1] : 0;
                toast.error(`الكمية غير متاحة (${units} وحدة متوفرة فقط)`, {
                    autoClose: 2000,
                    position: "top-right",
                });
            } else if (/Only \d+ units available/i.test(errorMsg)) {
                // استخراج الرقم
                const match = errorMsg.match(/Only (\d+) units available/i);
                const units = match ? match[1] : 0;
                toast.error(`الكمية غير متاحة (${units} وحدة متوفرة فقط)`, {
                    autoClose: 2000,
                    position: "top-right",
                });
            } else {
                toast.error("المنتج موجود في العربة (عدد/مقاس مختلف)", {
                    autoClose: 2000,
                    position: "top-right",
                });
            }
        }
    };



    if (loading) {
        return (
            <div className="loading">
                <FourSquare color={["#ff6f33"]} />
            </div>
        )
    };
    if (error) return <div>Something went wrong!</div>;

    return (
        <>
            {allProducts.length >= 2 && (
                <div className='bundel-sec'>
                    <h4>اشتري معه</h4>
                    <div className='bundel-container'>
                        <div className='bundel-cards-container'>
                            {allProducts.map((product, index) => {
                                const subcategory = subcategories.find(sub => sub.id === product.subcategoryId);
                                const subcategoryName = subcategory ? subcategory.name_ar : '';
                                const isOutOfStock = product.remaining === 0;

                                return (
                                    <React.Fragment key={product.id}>
                                        <Link
                                            to={`/subcategory/${product.subcategoryId}/${subcategoryName}/product/${product.id}/${product.name_ar}`}
                                            state={{ from: location.pathname }}
                                        >

                                            <div className='card-container' id={product.id}>
                                                <div className='card-img'>
                                                    <img src={product.image} alt={product.name_ar} />
                                                </div>

                                                <div className='card-content'>
                                                    <h6><strong>{product.name_ar}</strong></h6>
                                                    <p>{product.slug}</p>
                                                </div>

                                                <div className='card-price-Container'>
                                                    {Number(product.salePrice) > 0 && (
                                                        <h5 className="mainprice">
                                                            <strong>{Number(product.price || 0).toLocaleString('en-EG')}</strong> <small>جنيه</small>
                                                        </h5>
                                                    )}
                                                    <h6>
                                                        {(Number(product.salePrice) > 0
                                                            ? Math.floor(Number(product.salePrice || 0))
                                                            : Number(product.price || 0)
                                                        ).toLocaleString('en-EG')}
                                                        <sub>جنيه</sub>
                                                    </h6>
                                                    {isOutOfStock && <p className='bundelOutStock' style={{ color: 'red' }}><strong>غير متوفر</strong></p>}
                                                </div>

                                            </div>
                                        </Link>

                                        {/* ✅ علامة الجمع بين الكروت
                                        {index !== allProducts.length - 1 && (
                                            <div className="plus-sign"><strong><FaPlus /></strong></div>
                                        )} */}
                                    </React.Fragment>

                                );
                            })}
                        </div>
                        <div className="bundle-summary">
                            <div>
                                {Number(totalSalePrice || 0) < Number(totalPrice || 0) ? (
                                    <>
                                        <h5>
                                            وفرت:
                                            <strong className='product_cont_uniq'>
                                                {Math.floor(Number(totalDiscount || 0))}%
                                                <sub>
                                                    {(Number(totalPrice || 0) - Number(totalSalePrice || 0)).toLocaleString('en-EG')} <small>جنيه</small>
                                                </sub>
                                            </strong>
                                        </h5>

                                        <h5 className="mainprice">
                                            <strong>{Number(totalPrice || 0).toLocaleString('en-EG')}</strong> <small>جنيه</small>
                                        </h5>
                                    </>
                                ) : (
                                    <h3>ترقبوا أفضل العرض و <strong className='product_cont_uniq'>الخصومات</strong></h3>
                                )}

                                {Number(totalSalePrice || 0) > 0 ? (
                                    <h6>
                                        إجمالي سعر العرض: <strong>{Math.floor(Number(totalSalePrice || 0)).toLocaleString('en-EG')}</strong> <sub>جنيه</sub>
                                    </h6>
                                ) : (
                                    <h6><strong>تابعنا لتصلكم آخر التحديثات</strong></h6>
                                )}
                            </div>

                            {Number(totalSalePrice || 0) > 0 && (
                                <div className='product-content-col3'>
                                    <button className='C-Sbtn' onClick={handleAddToCart}>أضف إلى العربة</button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Bundel;
