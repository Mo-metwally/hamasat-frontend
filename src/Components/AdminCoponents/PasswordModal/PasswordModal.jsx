import React, { useState, useEffect, useRef } from 'react';
import './PasswordModal.css';

const PasswordModal = ({ isOpen, onClose, onSuccess }) => {
    const correctPassword = process.env.REACT_APP_Admin_PIN;
    const [passwordInput, setPasswordInput] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    // ✅ تركيز على الانبوت أول ما يفتح المودال
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // ✅ فحص هل كلمة السر محفوظة في sessionStorage
    useEffect(() => {
        const savedAuth = sessionStorage.getItem("isAuthenticated");
        if (savedAuth === "true") {
            onSuccess();
        }
    }, [onSuccess]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (passwordInput === correctPassword) {
            if (rememberMe) {
                // ✅ لو متعلم على "تذكرني" نحفظ
                sessionStorage.setItem("isAuthenticated", "true");
            } else {
                // ✅ لو مش متعلم نشيل أي حاجة محفوظة
                sessionStorage.removeItem("isAuthenticated");
            }

            onSuccess();
            setPasswordInput('');
            setError('');
        } else {
            setError('كلمة المرور غير صحيحة');
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('modall-overlay')) {
            onClose();
            setPasswordInput('');
            setError('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modall-overlay" onClick={handleOverlayClick}>
            <div className="modall">
                <h3>ادخل كلمة المرور</h3>
                <form onSubmit={handleSubmit}>
                    {/* حيلة علشان نتجنب أوتو كومبليت */}
                    <input
                        type="text"
                        name="username"
                        autoComplete="username"
                        style={{ display: 'none' }}
                    />

                    <input
                        type="password"
                        ref={inputRef}
                        placeholder="كلمة المرور"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        autoComplete="new-password"
                    />

                    {/* ✅ checkbox تذكرني */}
                    <label className="remember-me">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span>تذكرني</span>
                    </label>

                    {error && <p className="error">{error}</p>}

                    <div className="modall-actions">
                        <button type="submit">تأكيد</button>
                        <button type="button" onClick={onClose}>إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
