import React from 'react'
import './Footer.scss'
import FooterLogo from '../../../Assets/rend-logo.webp'
import { IoTimerSharp } from 'react-icons/io5'
import { FaMapMarkedAlt } from 'react-icons/fa'
import { FaPhoneVolume } from "react-icons/fa6";
import { Link } from 'react-router-dom'

const Footer = () => {

    const currentYear = new Date().getFullYear();
    return (
        <div id='Footer' className='footer'>
            <div className='footer_logo'>
                <img src={FooterLogo} alt="logo" />
            </div>
            <div className="footer_container">
                <div className="footer_subcontainer">
                    <div className="footer_cul">
                        <ul className='footer_items'>
                            <li className='footer_items_head'>روابط سريعة</li>
                            <li className='head_underline'></li>
                            <li className='footer_item footer_active'><Link to='/'>الرئيسية</Link></li>
                            <li className='sup_underline'></li>
                            <li className='footer_item footer_active'><Link to='/offers'>العروض</Link></li>
                            <li className='sup_underline'></li>
                            <li className='footer_item footer_active'><Link to='/allsubcategories'>تسوق بالفئة</Link></li>
                            <li className='sup_underline'></li>
                            <li className='footer_item footer_active'><Link to='/newarrival'>وصل حديثاً</Link></li>
                        </ul>
                    </div>
                    <div className="footer_cul">
                        <ul className='footer_items'>
                            <li className='footer_items_head'>الحساب</li>
                            <li className='head_underline'></li>
                            <li className='footer_item footer_active'><Link to='/cart'>العربة</Link></li>
                            <li className='sup_underline'></li>
                            <li className='footer_item footer_active'><Link to='/followup'>متابعة الطلبات</Link></li>
                            <li className='sup_underline'></li>
                            <li className='footer_item footer_active'><Link to='/orders'>الطلبات</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer_subcontainer">
                    <div className="footer_cul2 footer_contacts">
                        <ul className='footer_items'>
                            <li className='footer_items_head'>تواصل معنا</li>
                            <li className='head_underline'></li>
                            {/* <li className='footer_contact'>
                                <i><FaMapMarkedAlt /></i>
                                <span>
                                    <strong>العنوان</strong>
                                    <br />
                                    فاقوس - شارع الدروس - الشرقية
                                </span>
                            </li> */}
                            {/* <li className='sup_underline'></li> */}
                            <li className='footer_contact'>
                                <i><FaPhoneVolume /></i>
                                <span>
                                    <strong>الدعم الفني</strong>
                                    <br />
                                    <a href="tel:+201026388831" >
                                        <span dir="ltr" style={{ textDecoration: "underline" }}>+20 102 638 8831</span>
                                    </a>


                                </span>
                            </li>
                            <li className='sup_underline'></li>
                            <li className='footer_contact'>
                                <i><IoTimerSharp /></i>
                                <span>
                                    <strong>مواعيد العمل</strong>
                                    <br />
                                    من 12 م ل ١٢ ص ماعدا الجمعة
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="footer_cul2 footer_policy">
                        <p className='footer_items_head'>روابط تهمك</p>
                        <div className='head_underline'></div>
                        <ul className='footer_items'>
                            <li className='footer_item footer_active'><Link to='/termsandconditions'>الشروط والأحكام</Link></li>
                            <li className='sup_underline'></li>
                            <li className='footer_item footer_active'><Link to='/deliverypolicy'>سياسة التوصيل</Link></li>
                            <li className='sup_underline'></li>
                            <li className='footer_item footer_active'> <Link to="/privacypolicy">سياسة الخصوصية</Link></li>
                            <li className='sup_underline'></li>
                            <li className='footer_item footer_active'> <Link to="/vendor-terms">شروط وأحكام البائع</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer_end" >
                <div><p><span> تصميم وتطوير </span><a href="https://mohammed-metwally.web.app/" target='_blank' rel="noopener noreferrer" title='https://mohammed-metwally.web.app/'>Mohamed Metwally</a></p></div>
                <div className='copyRights'><p><span>&copy; 2005 - {currentYear}</span> .همسات هوم | جميع الحقوق محفوظة</p></div>
            </div>
        </div>
    )
}

export default Footer