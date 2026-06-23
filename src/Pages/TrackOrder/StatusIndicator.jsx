import React from "react";
import {
    FaClock,
    FaBox,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle,
    FaUndo,
} from "react-icons/fa";

// الخطوات الأساسية بالعربي (آخر خطوة افتراضية: تم التوصيل)
const baseSteps = [
    { key: "pending", label: "قيد الانتظار", icon: <FaClock /> },
    { key: "processed", label: "تم التجهيز", icon: <FaBox /> },
    { key: "shipped", label: "تم الشحن", icon: <FaTruck /> },
    { key: "delivered", label: "تم التوصيل", icon: <FaCheckCircle /> },
];

const StatusIndicator = ({ status }) => {
    let steps;

    if (status === "canceled") {
        // حالة الإلغاء: فقط قيد الانتظار مكتمل + الإلغاء نشط
        steps = [
            { key: "pending", label: "قيد الانتظار", icon: <FaClock /> },
            { key: "canceled", label: "تم إلغاء الطلب", icon: <FaTimesCircle /> },
        ];
    } else if (status === "returned") {
        // حالة المرتجع: نضيف خطوة المرتجع بعد التوصيل
        steps = [...baseSteps, { key: "returned", label: "تم الإرجاع", icon: <FaUndo /> }];
    } else {
        // الحالات العادية: نستخدم الخطوات الأساسية
        steps = [...baseSteps];
    }

    const currentIndex = steps.findIndex((s) => s.key === status);

    return (
        <div className="status-container" style={{ direction: "ltr" }}>
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;

                return (
                    <div key={step.key} className="status-step">
                        {index !== 0 && (
                            <div
                                className={`status-line ${isCompleted || isActive ? "active" : ""}`}
                            ></div>
                        )}

                        <div
                            className={`status-icon ${isCompleted ? "completed" : isActive ? "active" : ""}`}
                        >
                            {step.icon}
                        </div>

                        <p className={`status-label ${isActive ? "active" : ""}`}>
                            {step.label}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default StatusIndicator;
