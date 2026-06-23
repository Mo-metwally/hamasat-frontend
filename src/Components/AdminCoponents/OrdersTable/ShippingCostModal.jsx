// src/components/ShippingCostModal.jsx
import React from "react";
import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";

const ShippingCostModal = ({ orderId, isOpen, onClose, onSave, initialData }) => {
    const [cost, setCost] = useState("");
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState("");

    // ✅ الخيارات المبدئية
    const options =
        [
            { value: "الدفع عند الاستلام", label: "الدفع عند الاستلام" },
            { value: "تم الدفع", label: "تم الدفع" },
            { value: "قيد المراجعة", label: "قيد المراجعة" },
        ];


    useEffect(() => {
        if (initialData) {
            setCost(initialData.cost || "");
            setPaymentStatus(initialData.paymentStatus || "");
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!cost) return;
        if (!paymentStatus) return; // لازم يختار حالة دفع
        setLoading(true);
        try {
            await onSave(orderId, {
                cost: Number(cost),
                paymentStatus,
            });

            setCost("");
            setPaymentStatus("");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSave();
        }
    };

    return (
        <div className="reStock-model-container">
            <div className="reStock-model">
                <h3>أدخل مصاريف الشحن</h3>
                <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="ادخل مصاريف الشحن"
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                />

                {/* ✅ سيلكتور اختياري + قابل لإضافة قيم جديدة */}
                <div style={{ marginTop: "1rem", textAlign: "right" }}>
                    <label>حالة الدفع</label>
                    <CreatableSelect
                        className="selector"
                        isClearable
                        options={options}
                        value={
                            paymentStatus
                                ? { value: paymentStatus, label: paymentStatus }
                                : null
                        }
                        onChange={(newValue) =>
                            setPaymentStatus(newValue ? newValue.value : "")
                        }
                        formatCreateLabel={(inputValue) => `إضافة "${inputValue}"`}

                        placeholder="اختر أو أضف حالة الدفع"
                        isDisabled={loading}
                    />
                </div>

                <div className="reStock-model-buttons">
                    <button
                        type='button'
                        className="C-btn"
                        onClick={() => {
                            if (loading) return;
                            setCost("");
                            setPaymentStatus("");
                            onClose();
                        }}
                        disabled={loading}
                    >
                        إلغاء
                    </button>
                    <button type='button' className="C-btn" onClick={handleSave} disabled={loading}>
                        {loading ? "جارٍ الحفظ..." : "حفظ"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShippingCostModal;
