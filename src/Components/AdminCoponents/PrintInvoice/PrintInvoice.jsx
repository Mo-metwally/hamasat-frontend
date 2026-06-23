import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Modal } from "react-bootstrap";
import PrintBG from "../../../Assets/hamasat-invoice-Bg-7.jpg";
import "./PrintInvoice.scss";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../../Context/AuthContext";

// تقسيم المنتجات كل 2
const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
};

const PrintInvoice = () => {
    const location = useLocation();
    const { order } = location.state || {};
    const { user } = useAuth();
    const printRef = useRef(null);
    const vendorPrintRef = useRef(null);
    
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [includeVendorId, setIncludeVendorId] = useState(false);

    const formattedDate = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `invoice-${order?.orderCode}-${formattedDate}`,
        onAfterPrint: () => {
            console.log("تمت الطباعة ✅");
        },
    });

    const handlePrintIdCard = useReactToPrint({
        contentRef: vendorPrintRef,
        documentTitle: `Vendor-ID-${user?.name || 'Card'}`,
    });

    const triggerPrint = (withVendorId) => {
        setIncludeVendorId(withVendorId);
        setTimeout(() => {
            handlePrint();
            setShowPrintModal(false);
        }, 100);
    };

    if (!order) return <div>لا توجد بيانات للعرض.</div>;

    let productsToPrint = order.products || [];
    if (user?.role === 'admin') {
        productsToPrint = productsToPrint.filter(p => p.vendorId === user.id);
    }

    // نقسم المنتجات كل 2
    const productChunks = chunkArray(productsToPrint, 12);
    const totalInvoices = productChunks.length; // ✅ عدد الفواتير

    return (
        <>
            <Helmet>
                <title>طباعة فاتورة - {order.username} - {order.orderCode}</title>
                <meta
                    name="description"
                    content="طباعة تفاصيل فاتورة الطلب المحدد في متجر همسات هوم."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/orders/print-invoice`} />
            </Helmet>
            <div className="printPage">
                <div className="print-header">
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button type='button' className="C-btn" onClick={() => setShowPrintModal(true)} style={{ margin: "20px 0" }}>
                            طباعة الفاتورة
                        </button>
                    </div>

                    <p>
                        عدد الفواتير: <strong>{totalInvoices}</strong>
                    </p>
                </div>
                {/* ✅ نخلي ref هنا مرة واحدة يلف كل الفواتير */}
                <div className="print-ref" ref={printRef}>
                    {productChunks.map((products, index) => (
                        <div key={index} className="print-area">
                            <div className="invoice-wrapper">
                                <div className="invoice-data">
                                    <div className="invoice-dataOne">
                                        <div className="invoice-userData">
                                            <h5><strong>العميل:</strong> {order.username}</h5>
                                            <h5><strong>الهاتف:</strong> {order.phoneNumber}</h5>
                                        </div>

                                        <div className="invoice-info">
                                            <h4>
                                                طلب رقم: {order.orderCode} <sup>{index + 1}</sup>
                                            </h4>
                                            <h4>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="invoice-justify">
                                        <div className="invoice-dataSec">
                                            <div className="invoice-dataSec-head">
                                                <div>
                                                    <h4>المنتجات:</h4>
                                                </div>
                                                <div>
                                                    <h4>الأجمالي</h4>
                                                </div>
                                            </div>
                                            <ul>
                                                {products.map((product) => (
                                                    <li key={product.id} dir="rtl">
                                                        <div className="invoice_name">
                                                            <h6>{product.name_ar}</h6> <h6>{" | "}</h6>
                                                            <h6>{product.color_ar}</h6>
                                                            {/* <h6>{" | "}</h6> */}
                                                            {/* <h6>{product.size_ar}</h6> <h6>{" | "}</h6>
                                                            <h6>{product.size_en}</h6> */}

                                                        </div>

                                                        <div>
                                                            <h6><strong>{product.OrderProducts.quantity}</strong></h6>
                                                            <h6>{Math.floor(Number(product.OrderProducts.unitPrice || 0)).toLocaleString('en-EG')}</h6>
                                                            <h6>{Math.floor(Number(product.OrderProducts.total || 0)).toLocaleString('en-EG')} ج.م</h6>
                                                        </div>

                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="invoice-Details">

                                            <div className="invoice-dataSec Adress">
                                                <h4>العنوان:</h4>
                                                <p>المحافظة/المدينة: <strong>{order.area} - {order.flatNum}</strong></p>
                                                <p>العنوان مفصل: <strong>{order.address}</strong></p>
                                                <p>علامة مميزة: <strong>{order.buildingNum}</strong></p>
                                                {order.userNote && (<p>
                                                    ملاحظة العميل: <strong>{order.userNote}</strong>
                                                </p>)}
                                            </div>
                                            <div className="invoice-dataSec Pricing">
                                                <h4>تفاصيل الطلب:</h4>
                                                <p>
                                                    السعر الطلب: {" "}
                                                    <strong>
                                                        {Math.floor(Number(order.total || 0)).toLocaleString('en-EG')} ج.م

                                                    </strong>
                                                </p>
                                                <p>
                                                    مصاريف الشحن:{" "}
                                                    <strong>
                                                        {Number(order.adminNoteOne) || "لم تحدد"} ج.م
                                                    </strong>
                                                </p>
                                                <p>
                                                    حالة الدفع: {" "}
                                                    <strong>
                                                        {order.adminNoteTwo}
                                                    </strong>
                                                </p>
                                                <p className="invoice-total">
                                                    سعر الطلب:{" "}
                                                    <strong>
                                                        {(Math.floor(Number(order.total || 0)) + (Number(order.adminNoteOne) || 0)).toLocaleString('en-EG')} ج.م

                                                    </strong>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <img src={PrintBG} alt="" className="invoice-bg" />
                            </div>
                        </div>
                    ))}

                    {/* ✅ Vendor ID printed at the end of the invoices (large and clear) */}
                    {includeVendorId && user?.role !== 'user' && (
                        <div className="invoice-vendor-card-page" dir="rtl">
                            <div className="large-vendor-card">
                                <div className="lvc-header">
                                    <h2 className="brand-title">همسات هوم</h2>
                                    <p className="card-subtitle">بيانات البائع / المورد</p>
                                </div>
                                
                                <div className="lvc-body">
                                    <h1 className="vendor-name">{user?.name}</h1>
                                    {user?.businessField && <p className="business-field">{user.businessField}</p>}
                                    
                                    <div className="lvc-details">
                                        <div className="detail-item">
                                            <span className="detail-label">رقم التواصل:</span>
                                            <strong className="detail-value" dir="ltr">{user?.phone || 'غير متوفر'}</strong>
                                        </div>
                                        {user?.sec_phone && (
                                            <div className="detail-item">
                                                <span className="detail-label">رقم إضافي:</span>
                                                <strong className="detail-value" dir="ltr">{user.sec_phone}</strong>
                                            </div>
                                        )}
                                        <div className="detail-item full-width">
                                            <span className="detail-label">العنوان:</span>
                                            <strong className="detail-value">{user?.address || 'غير متوفر'}</strong>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="lvc-footer">
                                    <p>شركاء النجاح - منصة همسات هوم</p>
                                    <p>https://hamsathome.com</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* 💳 Hidden ID Card for Printing */}
                <div style={{ display: 'none' }}>
                    <div ref={vendorPrintRef} className="vendor-id-card-print" dir="rtl">
                        <div className="id-card-inner">
                            <div className="id-card-header">
                                <div className="header-logo-container">
                                    <h2 className="brand-title">همسات هوم</h2>
                                    <p className="card-subtitle">معرف البائع المعتمد</p>
                                </div>
                            </div>

                            <div className="id-card-body">
                                <h1 className="vendor-name">{user?.name}</h1>
                                {user?.businessField && <p className="business-field">{user.businessField}</p>}

                                <div className="id-card-details">
                                    <div className="detail-item">
                                        <span className="detail-label">رقم التواصل:</span>
                                        <strong className="detail-value" dir="ltr">{user?.phone || 'غير متوفر'}</strong>
                                    </div>
                                    {user?.sec_phone && (
                                        <div className="detail-item">
                                            <span className="detail-label">رقم إضافي:</span>
                                            <strong className="detail-value" dir="ltr">{user.sec_phone}</strong>
                                        </div>
                                    )}
                                    <div className="detail-item full-width">
                                        <span className="detail-label">العنوان:</span>
                                        <strong className="detail-value">{user?.address || 'غير متوفر'}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="id-card-footer">
                                <div className="footer-content">
                                    <p>شركاء النجاح - منصة همسات هوم</p>
                                    <p className="scan-text">المورد مسجل رسمياً في منصتنا</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showPrintModal} onHide={() => setShowPrintModal(false)} centered dir="rtl">
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontWeight: 'bold', color: '#2c3e50' }}>خيارات الطباعة</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex flex-column gap-3 p-4">
                    <button 
                        type="button"
                        className="C-btn" 
                        onClick={() => triggerPrint(false)}
                        style={{ padding: '15px', fontSize: '18px', fontWeight: 'bold' }}
                    >
                        طباعة الفاتورة فقط
                    </button>
                    <button 
                        type="button"
                        className="C-btn" 
                        onClick={() => triggerPrint(true)}
                        style={{ padding: '15px', fontSize: '18px', fontWeight: 'bold', background: '#2c3e50', color: '#fff' }}
                    >
                        طباعة الفاتورة + بيانات المورد
                    </button>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default PrintInvoice;
