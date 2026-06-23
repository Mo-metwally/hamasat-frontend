import React, { useState } from 'react'
import './ProdCard.scss'
import { MdOutlineAddShoppingCart } from "react-icons/md";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../../Context/CartContext';
import { useOrderNow } from '../../../Context/OrderNowContext';
import { toast } from 'react-toastify';


const ProdCard = (props) => {
    const location = useLocation();
    const { setProductDetails } = useOrderNow();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    // eslint-disable-next-line no-unused-vars
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(props.img); // الصورة الافتراضية

    const handleAddToCart = async () => {
        try {
            await addToCart({
                productId: props.id,
                quantity,
                color: props.sizeAr?.[0] || "n/a",
                size: props.sizeEn?.[0] || "n/a",
            });

            toast.success("تم إضافة المنتج إلى العربة", { autoClose: 2000 });
        }
        catch (err) {
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


    const handleOrderNow = async () => {
        try {
            setProductDetails({
                productId: props.id,
                quantity,
                color: props.sizeAr?.[0] || "n/a",
                size: props.sizeEn?.[0] || "n/a",
            });
            navigate("/checkout");
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


    return (
        <div className='card-container' id={props.id} key={props.id}>
            <Link className='card-Link' to={props.link} state={{ from: location.pathname }}>
                <div className="card-top">
                    {props.isNew && (
                        <div className='prod_label isNew'>
                            <span className='prod_label_text'>جديد</span>
                        </div>
                    )}

                    {props.remaining > 0 && props.isSale && (
                        <div className='prod_label isSale'>
                            <span className='prod_label_text'>عرض خاص <sup>%</sup></span>
                        </div>
                    )}
                    {props.remaining <= 0 && (
                        <div className='prod_label outOfStockLable'>
                            <span className='prod_label_text'>نفذت الكمية !</span>
                        </div>
                    )}

                    <div className='card-img'>
                        <div>
                            <img
                                effect="blur"
                                className='mainImg'
                                src={mainImage}
                                alt={props.name}
                            />
                        </div>
                        <div className="imagesContainer">
                            {props.imgs && props.imgs.length > 0 && (
                                props.imgs.slice(0, 5).map((img, index) => (
                                    <div
                                        key={index}
                                        className="imageWrapper"
                                        onMouseEnter={() => setMainImage(img)} // تغيير الصورة عند الهوفر
                                        onMouseLeave={() => setMainImage(props.img)} // العودة للصورة الافتراضية
                                    >
                                        <img effect="blur" src={img} alt={`${props.name}-${index}`} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
                <div className='card-content'>
                    <h2><strong>{props.name}</strong></h2>
                    <p>{props.description}</p>
                </div>

                <div className='card-price-Container'>
                    {Number(props.salePrice) > 0 && (
                        <>
                            <p className="mainprice">
                                <strong>{Number(props.price || 0).toLocaleString('en-EG')}</strong> <small>جنيه</small>
                            </p>
                        </>
                    )}
                    <p className='prodPrice'>
                        {(Number(props.salePrice) > 0
                            ? Math.floor(Number(props.salePrice || 0))
                            : Number(props.price || 0)
                        ).toLocaleString('en-EG')}
                        <sub>جنيه</sub>
                    </p>
                </div>

            </Link>
            {props.remaining <= 0 ? (
                <div className='card-action-btn'>
                    <button className='outOfStockBtn'>أطلب الان</button>
                </div>
            ) : (
                <div className='card-action-btn'>
                    <button className='C-Sbtn' onClick={handleOrderNow}>أطلب الان</button>
                    <button className='cart-btn' onClick={handleAddToCart}
                        aria-label="أضف المنتج إلى العربة"
                        title="أضف المنتج إلى العربة">
                        <MdOutlineAddShoppingCart />
                    </button>
                </div>
            )}
        </div>

    )
}

export default ProdCard;
