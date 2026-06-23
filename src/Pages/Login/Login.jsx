import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logimg from '../../Assets/HamasatLogo2.webp';
import { Link } from 'react-router-dom';

import {
    MDBBtn,
    MDBContainer,
    MDBCard,
    MDBCardBody,
    MDBCardImage,
    MDBRow,
    MDBCol,
    MDBInput,
    MDBSpinner
} from 'mdb-react-ui-kit';
import { Helmet } from 'react-helmet-async';
import { FaEye, FaEyeSlash, FaTimes, FaEnvelope, FaKey, FaLock } from 'react-icons/fa';
import { useAuth } from '../../Context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate();
    const { user, checkAuth } = useAuth();
    
    useEffect(() => {
        if (user) {
            toast.success('أنت مسجل الدخول بالفعل');
            navigate('/admin');
        }
    }, [user, navigate]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [forgotModalOpen, setForgotModalOpen] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const toggleForgotModal = () => {
        setForgotModalOpen(!forgotModalOpen);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotError('');
        setForgotSuccess('');
    };

    const handleSendOTP = async () => {
        setForgotLoading(true);
        setForgotError('');
        setForgotSuccess('');
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await res.json();
            if (res.ok) {
                setForgotSuccess(data.message);
                setForgotStep(2);
            } else {
                setForgotError(data.message || 'حدث خطأ');
            }
        } catch (err) {
            setForgotError('خطأ في الاتصال');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setForgotLoading(true);
        setForgotError('');
        setForgotSuccess('');
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, otp: forgotOtp })
            });
            const data = await res.json();
            if (res.ok) {
                setForgotSuccess(data.message);
                setForgotStep(3);
            } else {
                setForgotError(data.message || 'رمز التحقق غير صحيح');
            }
        } catch (err) {
            setForgotError('خطأ في الاتصال');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmNewPassword) {
            setForgotError('كلمتا المرور غير متطابقتين');
            return;
        }
        setForgotLoading(true);
        setForgotError('');
        setForgotSuccess('');
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setForgotSuccess('تم تغيير كلمة المرور بنجاح');
                setEmail(forgotEmail);
                setTimeout(() => toggleForgotModal(), 2000);
            } else {
                setForgotError(data.message || 'حدث خطأ أثناء تغيير كلمة المرور');
            }
        } catch (err) {
            setForgotError('خطأ في الاتصال');
        } finally {
            setForgotLoading(false);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/check-user`, {
                    method: 'GET',
                    credentials: 'include',
                });

                const result = await response.json();

                if (response.ok && result.success && result.data?.role === 'admin') {
                    navigate('/admin');
                }
            } catch (error) {
                console.error('Error checking user:', error);

            }
        };

        checkUser();
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            if (response.ok) {
                await checkAuth();
                navigate('/admin');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Something went wrong');
            }
        } catch (error) {
            setError('Error logging in');
        }
    };

    return (
        <>
            <Helmet>
                <title>تسجيل الدخول - همسات هوم</title>
                <meta
                    name="description"
                    content="سجل دخولك إلى حسابك في همسات هوم لمتابعة الطلبات وإدارة مشترياتك بسهولة."
                />
                <meta name="robots" content="noindex, nofollow" />
                <meta name="theme-color" content="#000000" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/login`} />
            </Helmet>


            <div id="Login">
                <MDBContainer className="my-5">
                    <MDBCard className="log-bg">
                        <MDBRow className="g-0">
                            <MDBCol md="5">
                                <Link to="/">
                                    <MDBCardImage src={logimg} alt="login form" className="login-img" />
                                </Link>
                            </MDBCol>
                            <MDBCol md="6" className="LogForm">
                                <MDBCardBody className="d-flex flex-column justify-content-center align-items-center w-100">
                                    <h5 className="pb-3 my-4 fw-normal" style={{ letterSpacing: '1px' }}>
                                        تسجيل دخول
                                    </h5>
                                    <form onSubmit={handleLogin}>
                                        <MDBInput
                                            wrapperClass="mb-4"
                                            placeholder="البريد الالكتروني"
                                            id="formControlLg"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            size="lg"
                                        />
                                        <MDBInput
                                            wrapperClass="mb-4"
                                            placeholder="كلمة المرور"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            id="formControlLg1"
                                            type="password"
                                            size="lg"
                                        />

                                        <div className="mb-4 d-flex justify-content-end w-100">
                                            <span
                                                className="forgot-pass-link"
                                                onClick={toggleForgotModal}
                                                style={{ cursor: 'pointer', color: '#ff6f33', fontSize: '0.9rem' }}
                                            >
                                                نسيت كلمة المرور؟
                                            </span>
                                        </div>

                                        <MDBBtn className="px-5 mb-4" color="dark" type="submit" size="lg">
                                            تسجيل دخول
                                        </MDBBtn>
                                    </form>

                                    {error && <p className="text-danger">{error}</p>}

                                    <div className="mt-3 text-center">
                                        <p className="mb-0" style={{ color: '#5a6a80' }}>
                                            ليس لديك حساب بائع؟ <Link to="/vendor-register" className="fw-bold text-decoration-underline" style={{ color: '#ff6f33' }}>إنشاء حساب</Link>
                                        </p>
                                    </div>
                                </MDBCardBody>
                            </MDBCol>
                        </MDBRow>
                    </MDBCard>
                </MDBContainer>

                {/* </MDBContainer> */}

                {forgotModalOpen && (
                    <div className="custom-modal-overlay" onClick={toggleForgotModal}>
                        <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="custom-modal-header">
                                <h3>استعادة كلمة المرور</h3>
                                <button className="custom-close-btn" onClick={toggleForgotModal}>
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="custom-modal-body">
                                {forgotError && <div className="custom-alert custom-alert-error">{forgotError}</div>}
                                {forgotSuccess && <div className="custom-alert custom-alert-success">{forgotSuccess}</div>}

                                {forgotStep === 1 && (
                                    <div className="custom-modal-step">
                                        <p className="step-description">الرجاء إدخال البريد الإلكتروني المرتبط بحسابك، وسنرسل لك رمز تحقق.</p>
                                        <div className="custom-input-group">
                                            <FaEnvelope className="input-icon" />
                                            <input
                                                type="email"
                                                placeholder="البريد الإلكتروني"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                            />
                                        </div>
                                        <button className="custom-btn primary-btn" onClick={handleSendOTP} disabled={forgotLoading}>
                                            {forgotLoading ? <MDBSpinner size="sm" /> : 'إرسال الرمز'}
                                        </button>
                                    </div>
                                )}

                                {forgotStep === 2 && (
                                    <div className="custom-modal-step">
                                        <p className="step-description">تم إرسال رمز تحقق إلى بريدك الإلكتروني. الرجاء إدخاله هنا.</p>
                                        <div className="custom-input-group">
                                            <FaKey className="input-icon" />
                                            <input
                                                type="text"
                                                placeholder="رمز التحقق (6 أرقام)"
                                                value={forgotOtp}
                                                onChange={(e) => setForgotOtp(e.target.value)}
                                            />
                                        </div>
                                        <button className="custom-btn primary-btn" onClick={handleVerifyOTP} disabled={forgotLoading}>
                                            {forgotLoading ? <MDBSpinner size="sm" /> : 'تحقق من الرمز'}
                                        </button>
                                    </div>
                                )}

                                {forgotStep === 3 && (
                                    <div className="custom-modal-step">
                                        <p className="step-description">الرجاء إدخال كلمة المرور الجديدة وتأكيدها.</p>
                                        <div className="custom-input-group">
                                            <FaLock className="input-icon" />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="كلمة المرور الجديدة"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                            <button className="password-toggle-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        <div className="custom-input-group">
                                            <FaLock className="input-icon" />
                                            <input
                                                type={showConfirmNewPassword ? "text" : "password"}
                                                placeholder="تأكيد كلمة المرور"
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            />
                                            <button className="password-toggle-btn" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                                                {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        <button className="custom-btn primary-btn" onClick={handleResetPassword} disabled={forgotLoading}>
                                            {forgotLoading ? <MDBSpinner size="sm" /> : 'تغيير كلمة المرور'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                )}
            </div>

        </>
    );
};

export default Login;
