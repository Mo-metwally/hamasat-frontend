import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function CheckoutAgreement({ onAgreementChange }) {
    const [agreed, setAgreed] = useState(false);

    const handleCheckbox = (e) => {
        setAgreed(e.target.checked);
        if (onAgreementChange) {
            onAgreementChange(e.target.checked); // لو حابب تبعت الحالة للصفحة الأب
        }
    };

    return (
        <div className="checkout-agreement" style={{ marginTop: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={handleCheckbox}
                />
                <span>
                    أوافق على{" "}
                    <Link to="/termsandconditions" target="_blank" rel="noopener noreferrer">
                        الشروط والأحكام
                    </Link>{" "}
                    ,
                    <Link to="/deliverypolicy" target="_blank" rel="noopener noreferrer">
                        سياسة التوصيل
                    </Link>{" "}
                    و{" "}
                    <Link to="/privacypolicy" target="_blank" rel="noopener noreferrer">
                        سياسة الخصوصية
                    </Link>
                </span>
            </label>

            {!agreed && (
                <p style={{ color: "red", marginTop: "5px" }}>
                    يجب الموافقة على السياسات قبل إتمام الطلب.
                </p>
            )}
        </div>
    );
}
