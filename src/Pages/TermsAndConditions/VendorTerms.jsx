import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './VendorTerms.scss';
import { FaTruckFast, FaShieldHalved, FaTriangleExclamation, FaSackDollar } from "react-icons/fa6";

const VendorTerms = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="vendor-terms-page">
            <Helmet>
                <title>شروط وأحكام البائع - همسات هوم</title>
                <meta name="description" content="اقرأ شروط وأحكام الانضمام كبائع في منصة همسات هوم للأدوات المنزلية والتزامات سياسة التوصيل." />
            </Helmet>

            <div className="hero-section">
                <h1>الشروط والأحكام الخاصة بالبائع</h1>
                <p>
                    مرحباً بك كشريك نجاح في منصة همسات هوم. لضمان أفضل تجربة تسوق لعملائنا، يُرجى قراءة الشروط والأحكام التالية بعناية والموافقة عليها قبل بدء البيع على المنصة.
                </p>
            </div>
            
            <div className="terms-content">
                <div className="term-card">
                    <div className="term-header">
                        <div className="icon-container">
                            <FaTruckFast />
                        </div>
                        <h3>1. الالتزام الكامل بـ <Link to="/deliverypolicy" target="_blank" style={{ color: '#ff6f33', textDecoration: 'underline' }}>سياسة التوصيل</Link></h3>
                    </div>
                    <div className="term-body">
                        <p>
                            يلتزم البائع بشكل <strong>كامل</strong> بجميع بنود <Link to="/deliverypolicy" target="_blank" style={{ color: '#ff6f33', textDecoration: 'underline' }}>سياسة التوصيل</Link> والشحن الخاصة بالمنصة. يجب على البائع تجهيز المنتجات وتغليفها جيداً وتسليمها لشركات الشحن المعتمدة لدينا في الوقت المحدد والموضح للعميل، دون أي تأخير غير مبرر.
                        </p>
                    </div>
                </div>

                <div className="term-card">
                    <div className="term-header">
                        <div className="icon-container">
                            <FaShieldHalved />
                        </div>
                        <h3>2. جودة المنتجات والبيانات</h3>
                    </div>
                    <div className="term-body">
                        <p>
                            يتعهد البائع بأن جميع المنتجات المعروضة هي منتجات أصلية ومطابقة تماماً للوصف والصور المعروضة في المتجر. يمنع منعاً باتاً بيع أي منتجات مقلدة، تالفة، أو غير مطابقة للوصف.
                        </p>
                    </div>
                </div>

                <div className="term-card danger-card">
                    <div className="term-header">
                        <div className="icon-container">
                            <FaTriangleExclamation />
                        </div>
                        <h3>3. المخالفات وإلغاء الحساب</h3>
                    </div>
                    <div className="term-body">
                        <p>
                            تنويه هام: في حالة مخالفة البائع لأي من هذه الشروط، وخاصة <strong>عدم الالتزام ببنود <Link to="/deliverypolicy" target="_blank" style={{ color: '#c0392b', textDecoration: 'underline' }}>سياسة التوصيل</Link></strong>، أو تكرار الشكاوى من العملاء، فإنه <strong>يحق للموقع (إدارة همسات هوم) حذف حساب البائع بشكل نهائي</strong> وإيقاف التعامل معه دون الحاجة إلى إنذار مسبق أو تعويض.
                        </p>
                    </div>
                </div>

                <div className="term-card">
                    <div className="term-header">
                        <div className="icon-container">
                            <FaSackDollar />
                        </div>
                        <h3>4. تسوية المستحقات المالية</h3>
                    </div>
                    <div className="term-body">
                        <p>
                            يتم تحويل أرباح ومستحقات البائع عن الطلبات المكتملة والمستلمة بنجاح من قبل العميل، وذلك حسب الجدولة المالية المتفق عليها بين البائع وإدارة الموقع، وبعد خصم عمولة المنصة وأي رسوم شحن مستحقة.
                        </p>
                    </div>
                </div>

                <div className="footer-note">
                    انضمامك لنا وموافقتك أثناء إنشاء الحساب يُعد إقراراً رسمياً بقراءة هذه الشروط والالتزام التام بها.
                </div>
            </div>
        </div>
    );
};

export default VendorTerms;
