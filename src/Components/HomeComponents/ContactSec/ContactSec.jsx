import React from "react";
import { Link } from "react-router-dom";
import './ContactSec.scss';
import { FaStore, FaChartLine, FaUsers } from "react-icons/fa";

const ContactSec = () => {
    return (
        <section className="vendor-cta-section" id="Contact" dir="rtl">
            <div className="vendor-cta-container">
                <div className="cta-content">
                    <span className="badge">فرصة استثنائية</span>
                    <h2 className="cta-title">شاركنا النجاح!</h2>
                    <p className="cta-description">
                        يمكنك إنشاء حساب بائع وعرض منتجاتك على منصة <strong>همسات هوم</strong> لتصل إلى آلاف العملاء وتحقق نمواً استثنائياً لمبيعاتك.
                    </p>
                    <div className="cta-features">
                        <div className="feature">
                            <FaStore className="icon" />
                            <span>متجرك الخاص</span>
                        </div>
                        <div className="feature">
                            <FaUsers className="icon" />
                            <span>آلاف العملاء النشطين</span>
                        </div>
                        <div className="feature">
                            <FaChartLine className="icon" />
                            <span>نمو مستمر للمبيعات</span>
                        </div>
                    </div>
                    <Link to="/vendor-register" className="cta-button">
                        <span className="btn-text">أنشئ حساب بائع الآن</span>
                        <div className="btn-glow"></div>
                    </Link>
                </div>
                <div className="cta-image-wrapper">
                    <div className="glass-card-contact">
                        <div className="glass-content">
                            <div className="floating-element circle"></div>
                            <div className="floating-element square"></div>
                            <div className="mockup-content">
                                <div className="line title"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line short"></div>
                                <div className="mockup-btn"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSec;