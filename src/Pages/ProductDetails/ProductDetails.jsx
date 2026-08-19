import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import './ProductDetails.scss'
import ProductCounter from './ProductCounter';
import CardSlider from '../../Components/HomeComponents/CardSlider/CardSlider';
import GallaryModel from './GallaryModel';
import { useRecentlyWatched } from '../../Context/RecentlyWatchedContext';
import { useUserInterests } from '../../Context/InterestContext';
import { TbTruckDelivery } from "react-icons/tb";
import { useSubCategories } from '../../hooks/useCategories';
import { FourSquare } from 'react-loading-indicators';
import { FaHome, FaStore, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useCart } from "../../Context/CartContext";

import { toast, ToastContainer } from "react-toastify";
import { useOrderNow } from '../../Context/OrderNowContext';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useProducts } from '../../hooks/useProducts';
import useTracking from '../../utils/useTracking';
// import { normalizedText } from '../../utils/normalizeText';
import { useAuth } from '../../Context/AuthContext';
import AddToOrderModal from './AddToOrderModal';

const ProductDetails = () => {
    // أعلى الملف
    const location = useLocation();
    const origin = location.state?.from || null; // الصفحة اللي جينا منها (مثلاً "/shop")

    const { products } = useProducts();
    const { subcategories, brands } = useSubCategories();
    const { productId, subCatId, productName } = useParams();
    const currentProductId = productId;
    const { watchedProducts, addProduct } = useRecentlyWatched();
    const { addInterest } = useUserInterests();

    const [product, setProduct] = useState(null);
    const [vendorInfo, setVendorInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useTracking();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/products/${productId}`);
                setProduct(data?.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("خطأ في جلب بيانات المنتج");
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    useEffect(() => {
        const vId = product?.vendorId || product?.vendor?.id;
        if (vId) {
            axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users/vendor/${vId}`)
                .then((res) => {
                    if (res.data?.data) {
                        setVendorInfo(res.data.data);
                    }
                })
                .catch((err) => console.error("Error fetching vendor info:", err));
        } else {
            setVendorInfo(null);
        }
    }, [product]);


    const bestselling = products.filter(product => product.sold > 5);
    const Catproducts = products.filter(product => product.subcategoryId === subCatId);
    const filteredProduct = product;

    const { setProductDetails } = useOrderNow();
    const navigate = useNavigate();
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedSizeAr, setSelectedSizeAr] = useState("");
    const [selectedSizeEn, setSelectedSizeEn] = useState("");
    const [addToOrderModalOpen, setAddToOrderModalOpen] = useState(false);

    const { user } = useAuth();
    const { addToCart } = useCart();


    const canonicalUrl = `${process.env.REACT_APP_CLIENT_URL}${location.pathname}`;

    useEffect(() => {
        if (!filteredProduct && !loading) {
            navigate("/notfound");
        }
    }, [filteredProduct, loading, navigate]);

    const handleAddToCart = async () => {
        try {
            await addToCart({
                productId: filteredProduct.id,
                quantity,
                color: selectedSizeAr || "n/a",
                size: selectedSizeEn || "n/a",
            });

            toast.success("تم إضافة المنتج إلى العربة", {
                autoClose: 2000, position: "top-right",
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


    useEffect(() => {
        if (!filteredProduct) return;
        if (filteredProduct?.id && filteredProduct?.categoryId) {
            addProduct(filteredProduct);
            addInterest(filteredProduct.categoryId); // تخزين categoryId فقط كاهتمام
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredProduct]);

    const handleOrderNow = async () => {
        try {
            setProductDetails({
                productId: filteredProduct.id,
                quantity,
                color: selectedSizeAr || filteredProduct.size_ar?.[0] || "n/a",
                size: selectedSizeEn || filteredProduct.size_en?.[0] || "n/a",
            });
            navigate("/checkout");
            // الانتقال لصفحة checkout
        } catch (err) {
            console.error("خطأ أثناء تنفيذ الطلب:", err);

            const errorMsg = err?.response?.data?.message || err.message;

            if (errorMsg === "Not enough stock available") {
                toast.error("الكمية المطلوبة غير متوفرة في المخزن، تفقد العربة", {
                    autoClose: 2000,
                    position: "top-right",
                });
            } else if (/Cannot add more than \d+ units/i.test(errorMsg)) {
                const match = errorMsg.match(/Cannot add more than (\d+) units/i);
                const units = match ? match[1] : 0;
                toast.error(`الكمية غير متاحة (${units} وحدة متوفرة فقط)`, {
                    autoClose: 2000,
                    position: "top-right",
                });
            } else if (/Only \d+ units available/i.test(errorMsg)) {
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


    useEffect(() => {
        if (!filteredProduct) return;
        setQuantity(1);
        setSelectedSizeAr(filteredProduct.size_ar?.[0])
        setSelectedSizeEn(filteredProduct.size_en?.[0])
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // ممكن تستخدم 'auto' لو مش عاوز تأثير انسيابي
        });
    }, [productId, filteredProduct]);

    if (loading) {
        return (
            <div className="loading">
                <FourSquare color={["#ff6f33"]} />
            </div>
        )
    };
    if (error) return <div>Error: {error}</div>;
    if (!filteredProduct) return <div>لا يمكن العثور علي هذا المنتج</div>;

    const daysLeft = () => {
        const expireDate = new Date(filteredProduct.saleExpireDate);
        const today = new Date();

        // نحذف الوقت من التاريخين عشان نحسب عدد الأيام بدقة
        expireDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = expireDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // نحول من ميلي ثانية إلى أيام

        return diffDays;
    };

    const isMeaningfulHTML = (html) => {
        if (!html) return false;
        const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
        return text.length > 0;
    };

    const getSubCatNameById = (subCatId) => {
        const subCat = subcategories.find((sub) => sub.id === subCatId);
        return subCat ? subCat.name_ar : 'Unknown';
    };

    const subCatName = getSubCatNameById(subCatId);


    // تضيف فاصلة بعد كل كلمة/جملة
    function addCommas(text) {
        if (!text) return "";
        return text
            .split(/\s+/) // تقسيم بالكلمات
            .filter(Boolean) // حذف الفراغات الفاضية
            .join(","); // ضم مع فاصلة
    }

    const safeDesc = filteredProduct.slug || (filteredProduct.description_ar ? filteredProduct.description_ar.replace(/<[^>]*>?/gm, '').substring(0, 160) : '');

    const productOG = {
        id: productId,
        name: decodeURIComponent(productName),
        description: safeDesc || `تسوق ${decodeURIComponent(productName)} من همسات هوم بأفضل الأسعار. يجمع لك كل ما يحتاجه المطبخ العصري.`,
        image: filteredProduct.image
    };

    // رجّع الأب مع كل الأبناء
    const parent = filteredProduct.parentId
        ? products.find(p => p.id === filteredProduct.parentId) // لو ابن → هات الأب
        : filteredProduct; // لو أب → نفسه

    // الأب + الأبناء
    const displayProduct = {
        ...parent,
        children: products.filter(p => p.parentId === parent.id)
    };

    // اجمع الأب + الأبناء في variants
    const variants = [
        {
            id: displayProduct.id,
            name_ar: displayProduct.name_ar,
            subcategoryId: displayProduct.subcategoryId,
            color: displayProduct.color_ar?.[0] || "",
            size: displayProduct.size_en?.[0] || "",
            pieces: displayProduct.size_ar?.[0] || "",
            image: displayProduct.image,
            remaining: displayProduct.remaining || 0, // 👈 أضف دي
        },
        ...(displayProduct.children || []).map(child => ({
            id: child.id,
            name_ar: child.name_ar,
            subcategoryId: child.subcategoryId,
            color: child.color_ar?.[0] || "",
            size: child.size_en?.[0] || "",
            pieces: child.size_ar?.[0] || "",
            image: child.image,
            remaining: child.remaining || 0, // 👈 أضف دي كمان
        }))
    ];


    // util function
    const getUniqueOptions = (variants, key, currentProductId) => {
        return Array.from(
            new Map(
                variants.map(v => {
                    const group = variants.filter(x => x[key] === v[key]);

                    // المنتج الحالي
                    const currentVariant = group.find(x => x.id === currentProductId);

                    // أول متاح
                    const availableVariant = group.find(x => x.remaining > 0);

                    // لو كله خلص
                    const lastVariant = group[group.length - 1];

                    const finalVariant = currentVariant
                        ? { ...currentVariant }
                        : availableVariant
                            ? { ...availableVariant }
                            : { ...lastVariant, remaining: 0 };

                    return [v[key], finalVariant];
                })
            ).values()
        );
    };

    // ================== Colors ==================
    const uniqueColors = Array.from(
        new Map(
            variants.map(v => {
                const colorVariants = variants.filter(x => x.color === v.color);

                // لو فيه المنتج الحالي → رجعه
                const currentVariant = colorVariants.find(x => x.id === currentProductId);

                // غير كده → رجع أول متاح
                const availableVariant = colorVariants.find(x => x.remaining > 0);

                // لو كله خلص → رجع آخر واحد بعلامة نفاد
                const finalVariant = currentVariant
                    ? { ...currentVariant }
                    : availableVariant
                        ? { ...availableVariant }
                        : { ...colorVariants[colorVariants.length - 1], remaining: 0 };

                return [v.color, finalVariant];
            })
        ).values()
    );

    // ================== Sizes & Pieces ==================
    const activeColor =
        selectedColor || variants.find(v => v.id === currentProductId)?.color;

    const filteredVariants = activeColor
        ? variants.filter(v => v.color === activeColor)
        : variants;

    const uniqueSizes = getUniqueOptions(filteredVariants, "size", currentProductId);
    const uniquePieces = getUniqueOptions(filteredVariants, "pieces", currentProductId);


    return (
        <>

            <Helmet>
                <meta charSet="UTF-8" />

                {/* SEO Title & Desc */}
                <title>{productOG.name} - همسات هوم</title>
                <meta name="keywords" content={`
                  ${addCommas(productOG.name)},${addCommas(productOG.description)},
                همسات, همسات هوم, منصة همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت`} />

                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
                <meta name="googlebot" content="index, follow" />
                <meta name="bingbot" content="index, follow" />

                <meta name="description" content={productOG.description} />
                <link rel="canonical" href={canonicalUrl} />
                <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

                {/* OG Tags */}
                <meta property="og:type" content="product" />
                <meta property="og:title" content={`${productOG.name} - همسات هوم`} />
                <meta property="og:description" content={productOG.description} />
                <meta property="og:image" content={productOG.image} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:site_name" content="همسات هوم" />

                {/* Twitter Cards */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${productOG.name} - همسات هوم`} />
                <meta name="twitter:description" content={productOG.description} />
                <meta name="twitter:image" content={productOG.image} />

                {/* Product JSON-LD Schema */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": productOG.name,
                        "image": productOG.image,
                        "description": productOG.description,
                        "sku": filteredProduct.id,
                        "brand": {
                            "@type": "Brand",
                            "name": filteredProduct.model_ar || "همسات هوم"
                        },
                        "offers": {
                            "@type": "Offer",
                            "url": canonicalUrl,
                            "priceCurrency": "EGP",
                            "price": Number(filteredProduct.salePrice) > 0 ? Number(filteredProduct.salePrice) : Number(filteredProduct.price),
                            "availability": filteredProduct.remaining > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                            "seller": {
                                "@type": "Organization",
                                "name": filteredProduct.vendor?.name || "همسات هوم"
                            }
                        }
                    })}
                </script>
            </Helmet>


            <div id='products-details'>
                <div className="page-hot-links" dir='rtl'>
                    <Link to="/" aria-label="الرئيسية"> <FaHome /> </Link>
                    &gt;
                    <Link to={`/subcategory/${subCatId}/${subCatName}`}>
                        {subCatName}
                    </Link>
                    &gt;
                    <p>{filteredProduct.name_ar}</p>

                </div>
                <div className='products-details'>
                    <GallaryModel product={filteredProduct} />
                    <div className='product-content'>
                        {filteredProduct.remaining > 0 && filteredProduct.isNew && (
                            <div className='prod_label isNew'>
                                <span className='prod_label_text'>جديد</span>
                            </div>
                        )}
                        {filteredProduct.remaining <= 0 && (
                            <div className='prod_label isSale'>
                                <span className='prod_label_text'><strong>نفذت الكمية !</strong></span>
                            </div>
                        )}
                        {filteredProduct.remaining > 0 && filteredProduct.isSale && (
                            <div className='prod_label isSale'>
                                <span className='prod_label_text'>عرض خاص <sup>%</sup> <strong>لمدة:</strong> <strong>{daysLeft()} أيام</strong></span>
                            </div>
                        )}

                        <h1>{filteredProduct.name_ar}</h1>
                        <div className='product-content-col1'>
                            <div className="product-content-col1-right">
                                <div className='priceContainer'>
                                    {Number(filteredProduct.salePrice) > 0 && (
                                        <h5 className="mainprice">
                                            <strong>{Number(filteredProduct.price).toLocaleString('en-EG', { maximumFractionDigits: 2 })}</strong> <small>جنيه</small>
                                        </h5>
                                    )}
                                    <h4>
                                        <strong>
                                            {Number(filteredProduct.salePrice) > 0
                                                ? Number(filteredProduct.salePrice).toLocaleString('en-EG', { maximumFractionDigits: 2 })
                                                : Number(filteredProduct.price).toLocaleString('en-EG', { maximumFractionDigits: 2 })}
                                        </strong>
                                        <small>جنيه</small>
                                    </h4>
                                </div>

                                {Number(filteredProduct.salePrice) > 0 && (
                                    <h5>
                                        وفرت:
                                        <strong className='product_cont_uniq'>
                                            {Math.floor(Number(filteredProduct.discount))}%
                                            <sub>
                                                {(Number(filteredProduct.price) - Number(filteredProduct.salePrice)).toLocaleString('en-EG', { maximumFractionDigits: 2 })} <small>جنيه</small>
                                            </sub>
                                        </strong>
                                    </h5>
                                )}
                            </div>

                            <div className='product-content-col1-left'>
                                {filteredProduct.sold > 9 && (
                                    <p className='product_cont_uniq_P'><strong>مبيعات المنتج:</strong> <strong className='product_cont_uniq'>{filteredProduct.sold} <sub>قطعة</sub></strong></p>
                                )}

                                {filteredProduct.remaining <= 0 && (
                                    <p className='product_cont_uniq_P'><strong>متبقي:</strong> <strong className='product_cont_uniq'>{filteredProduct.remaining} <sub>قطعة</sub></strong></p>
                                )}

                            </div>
                        </div>

                        <div className="similar-products-section">
                            <h4>ألوان المنتج:</h4>
                            <div className="colors-list">
                                {uniqueColors.map((item, index) => {
                                    // داخل map للألوان:
                                    const isActive = selectedColor ? (selectedColor === item.color) : (currentProductId === item.id);

                                    const isOutOfStock = item.remaining === 0;

                                    return (
                                        <Link
                                            key={index}
                                            to={`/subcategory/${item.subcategoryId}/${getSubCatNameById(item.subcategoryId)}/product/${item.id}/${encodeURIComponent(item.name_ar)}`}
                                            state={{ from: origin }}
                                            replace={!!origin}
                                            onClick={() => setSelectedColor(item.color)}
                                        >
                                            <div
                                                className={`color-option 
                                                    ${isActive ? "color-active" : ""} 
                                                    ${isOutOfStock ? "stockOut" : ""}`}
                                            >
                                                <img src={item.image} alt={item.name_ar} />
                                                <p>{item.color}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className='PContentHead'>
                            <h5><strong>تفاصيل المنتج</strong></h5>
                            <div className='product-content-col2'>
                                <p><strong>اللون:</strong> {filteredProduct.color_ar?.join(', ') || '—'}</p>
                                <p><strong>البراند:</strong> {filteredProduct.model_ar}</p>
                                <p><strong>المنشأ/الخامة:</strong> {filteredProduct.model_en}</p>
                                <div>
                                    <strong>عدد القطع:</strong>
                                    {uniquePieces.map((obj, index) => {
                                        const isOutOfStock = obj.remaining === 0;
                                        return (
                                            <Link
                                                key={index}
                                                to={`/subcategory/${obj.subcategoryId}/${getSubCatNameById(obj.subcategoryId)}/product/${obj.id}/${encodeURIComponent(obj.name_ar)}`}
                                                state={{ from: origin }}
                                                replace={!!origin}
                                                className={`option-btn 
                                                    ${selectedSizeAr === obj.pieces ? "active" : ""} 
                                                    ${isOutOfStock ? "stockOut" : ""}`}
                                                onClick={() => setSelectedSizeAr(obj.pieces)}
                                            >
                                                {obj.pieces}
                                            </Link>
                                        );
                                    })}
                                </div>



                                {filteredProduct.keywords && filteredProduct.keywords.length > 0 && (
                                    <p>
                                        <strong>البندل:</strong> {filteredProduct.keywords.join(', ')}
                                    </p>
                                )}

                                <div>
                                    <strong>الحجم:</strong>
                                    <div className="options-container">
                                        {uniqueSizes.map((obj, index) => {
                                            const isOutOfStock = obj.remaining === 0;
                                            return (
                                                <Link
                                                    key={index}
                                                    to={`/subcategory/${obj.subcategoryId}/${getSubCatNameById(obj.subcategoryId)}/product/${obj.id}/${encodeURIComponent(obj.name_ar)}`}
                                                    state={{ from: origin }}
                                                    replace={!!origin}
                                                    className={`option-btn 
                                                        ${selectedSizeEn === obj.size ? "active" : ""} 
                                                        ${isOutOfStock ? "stockOut" : ""}`}
                                                    onClick={() => setSelectedSizeEn(obj.size)}
                                                >
                                                    {obj.size}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>


                                {filteredProduct.description_ar && (
                                    <div
                                        className="product-description"
                                        dangerouslySetInnerHTML={{ __html: filteredProduct.description_ar }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Vendor Section */}
                        {(() => {
                            const currentVendor = vendorInfo || filteredProduct?.vendor;
                            const vendorId = currentVendor?.id || filteredProduct?.vendorId;
                            const vendorName = currentVendor?.name || "منصة همسات هوم";

                            const matchedBrand = brands?.find(b =>
                                (b.name && vendorName && b.name.trim().toLowerCase() === vendorName.trim().toLowerCase()) ||
                                (b.name_ar && vendorName && b.name_ar.trim().toLowerCase() === vendorName.trim().toLowerCase()) ||
                                (b.vendorId && vendorId && b.vendorId === vendorId)
                            );

                            const brandImage = matchedBrand?.image || currentVendor?.profileImage || currentVendor?.image || null;

                            return (
                                <div className="vendor-info-card">
                                    <div className="vendor-icon">
                                        {brandImage ? (
                                            <img src={brandImage} alt={vendorName} />
                                        ) : (
                                            <FaStore />
                                        )}
                                    </div>
                                    <div className="vendor-details">
                                        <h4>{vendorName}</h4>

                                        {currentVendor && (
                                            <div className="vendor-contact">
                                                {currentVendor.phone && (
                                                    <span className="contact-item"><FaPhone /> {currentVendor.phone}</span>
                                                )}
                                                {currentVendor.email && (
                                                    <span className="contact-item"><FaEnvelope /> {currentVendor.email}</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="vendor-field">
                                            {currentVendor?.businessField || "الأدوات المنزلية"}
                                        </div>
                                        <div className="vendor-desc">
                                            {currentVendor?.productDescription || currentVendor?.vendorDescription || "نوفر لك أفضل المنتجات المنزلية العصرية بجودة ممتازة وبأسعار تنافسية تناسب الجميع."}
                                        </div>
                                        {vendorId && (
                                            <div className="vendor-action" style={{ marginTop: '15px' }}>
                                                <Link to={`/vendor/${vendorId}`} className="C-btn" style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '8px', display: 'inline-block' }}>
                                                    تفاصيل البائع
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                        {/* End Vendor Section */}

                        <p><strong>الوصف</strong><br />{filteredProduct.slug}</p>
                        {filteredProduct.remaining <= 0 ? (
                            <h5 className='OutOfStockPage'>نأسف لنفاذ الكمية, إعادة المخزون قريباً</h5>
                        ) : (
                            <div className='product-content-col3-container'>
                                <div className='product-content-col3'>
                                    <button className='orderNow' onClick={handleOrderNow}>
                                        <span className="text">أطلب الآن</span>
                                        <span className="icon"><TbTruckDelivery /></span>
                                    </button>
                                    <button className='C-Sbtn' onClick={handleAddToCart}>أضف الي العربة</button>
                                    {(user?.role === 'superAdmin' || user?.role === 'admin') && (
                                        <button
                                            className='C-Sbtn addToOrderBtn'
                                            style={{
                                                backgroundColor: " var( --main-text-color)", borderColor: 'var( --main-color)', color: '#fff',

                                            }}
                                            onClick={() => setAddToOrderModalOpen(true)}
                                        >
                                            إضافة لطلب
                                        </button>
                                    )}
                                </div>
                                <ProductCounter
                                    key={productId}
                                    initialQuantity={1}
                                    max={filteredProduct.remaining} // المخزون المتاح
                                    onQuantityChange={(qty) => setQuantity(qty)}
                                />
                            </div>
                        )}
                    </div>
                </div>
                {/* <div className='product-second-sec'>
                    <Bundel />
                </div> */}
                <br />
                <div className='product-second-sec'>
                    <div className='mainDescriptionTable'>
                        {isMeaningfulHTML(filteredProduct.description_en) && (
                            <div className='DescriptionTable'>
                                <h2><strong>وصف إضافي +</strong></h2>
                                <div
                                    className="product-description"
                                    dangerouslySetInnerHTML={{ __html: filteredProduct.description_en }}
                                />
                            </div>
                        )}
                    </div>

                </div>
                <br />
                {Catproducts.length >= 5 && (
                    <CardSlider
                        sectionName="ذات صلة"
                        link={`/subcategory/${subCatId}/${subCatName}`}
                        produactsData={Catproducts} />
                )}

                <br />
                {watchedProducts.length >= 5 ? (
                    <CardSlider
                        sectionName="رأيت مؤخراً"
                        link="/suggestion"
                        produactsData={watchedProducts}
                    />
                ) :
                    bestselling.length >= 5 && (<CardSlider
                        sectionName="الأكثر مبيعاً"
                        link="/bestselling"
                        produactsData={bestselling}
                    />)
                }

            </div>
            <ToastContainer toastClassName="custom-toast" position="top-right" />
            <AddToOrderModal
                open={addToOrderModalOpen}
                handleClose={() => setAddToOrderModalOpen(false)}
                product={filteredProduct}
                quantity={quantity}
                color={selectedSizeAr || filteredProduct?.size_ar?.[0] || "n/a"}
                size={selectedSizeEn || filteredProduct?.size_en?.[0] || "n/a"}
            />
        </>
    );
};

export default ProductDetails;
