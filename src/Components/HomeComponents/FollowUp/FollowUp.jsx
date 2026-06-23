import React from "react";
import { Link } from 'react-router-dom'
import followUpImg from '../../../Assets/OrdersPage.webp'
import decor from '../../../Assets/Group 54.svg'
import './FollowUp.scss'
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";


const FollowUp = () => {
    return (
        <div id='FollowUp'>
            <img className='decor' src={decor} alt="" />
            <div className='FollowUp-Container'>
                <div className='FollowUp-Img'>
                    <LazyLoadImage
                        src={followUpImg} alt='FollowUpImage'
                        effect="blur"   // 👈 بيعمل تأثير عند التحميل
                    />
                </div>
                <div className='FollowUp-Content-container'>
                    <div className='FollowUp-Content'>
                        <div className='lineUp'></div>
                        <h2><strong>متابعة الطلبات</strong></h2>
                        <p>تابع حالة طلبك بسهولة عبر إدخال رقم الطلب. سنوفر لك جميع التحديثات علي حالة الطلب حتى التسليم
                            <br />
                            (برجاء التوجة لصفحة الطلب وإدخال رقم الطلب لمتابعه تحديثات الطلب) </p>
                    </div>
                    <div className='FollowUp-btn-container'>
                        <Link className='C-btn' to='/followup'>تابع طلبك</Link>
                        <Link to="/orders" className="C-Sbtn">
                            الطلبات
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FollowUp
