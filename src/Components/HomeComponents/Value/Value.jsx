import React from 'react'
import './value.scss'
import Vimg from '../../../Assets/Group 66.webp'
import V_BG from '../../../Assets/V-BG.webp'
import { TbTruckDelivery } from "react-icons/tb";
import { RiSecurePaymentLine } from "react-icons/ri";
import { GiCardboardBoxClosed } from "react-icons/gi";
import { MdTrackChanges } from "react-icons/md";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "react-lazy-load-image-component/src/effects/blur.css";

const Value = () => {
    return (
        <div id='Value'>
            <br />
            <div className='main-head'>
                <br />
                <h1>مهمتنا</h1>
            </div>
            <div className='value-container'>

                <div className='V-showcase'>
                    <LazyLoadImage
                        src={Vimg} alt="value"
                        effect="blur"   // 👈 بيعمل تأثير عند التحميل
                    />
                    {/* <img src={Vimg} alt="value" /> */}
                </div>
                <div className='value-content'>
                    <div className='value-content-head'>
                        <h2>مستلزمات مطبخك، خطوة نحو إبداعك</h2>
                        <p>
                            معرض همسات للأدوات المنزلية هو وجهتك المثالية لتجهيز مطبخ عصري متكامل. نوفر لك تشكيلة واسعة من
                            أدوات المطبخ بتصاميم أنيقة وجودة عالية تناسب جميع الأذواق.
                            نحرص دائمًا على الجمع بين العملية والفخامة،
                        </p>
                    </div>
                    <div className='value-cores'>
                        <div className='value-core'>
                            <img src={V_BG} alt="" />
                            <div className='value-core-item'>
                                <i><TbTruckDelivery /></i>
                                <p>شحن سريع</p>
                            </div>
                        </div>
                        <div className='value-core'>
                            <img src={V_BG} alt="" />
                            <div className='value-core-item'>
                                <i><RiSecurePaymentLine /></i>
                                <p>دفع آمن</p>
                            </div>
                        </div>
                        <div className='value-core'>
                            <img src={V_BG} alt="" />
                            <div className='value-core-item'>
                                <i><GiCardboardBoxClosed /></i>
                                <p>تغليف آمن</p>
                            </div>
                        </div>
                        <div className='value-core'>
                            <img src={V_BG} alt="" />
                            <div className='value-core-item'>
                                <i><MdTrackChanges /></i>
                                <p>متابعة الطلب</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Value