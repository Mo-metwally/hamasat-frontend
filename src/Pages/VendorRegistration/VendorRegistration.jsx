import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import logimg from '../../Assets/HamasatLogo2.webp';
import './VendorRegistration.scss';
import { FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../Context/AuthContext';
import { toast } from 'react-toastify';

const VendorRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      toast.success('أنت مسجل الدخول بالفعل');
      navigate('/admin');
    }
  }, [user, navigate]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    sec_phone: '',
    email: '',
    address: '',
    businessField: '',
    productDescription: '',
    vendorDescription: '',
    gMapLink: '',
    fbLink: '',
    tiktokLink: '',
    instLink: '',
    whyUs: '',
    password: '',
    confirmPassword: '',
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressColor, setProgressColor] = useState('#e74c3c'); // Red initially

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const getLinkValidationClass = (name, value) => {
    if (!value || value.trim() === '') return '';
    const val = value.toLowerCase();

    let isValid = false;
    if (name === 'fbLink') isValid = val.includes('facebook.com') || val.includes('fb.me');
    else if (name === 'instLink') isValid = val.includes('instagram.com') || val.includes('instagr.am');
    else if (name === 'tiktokLink') isValid = val.includes('tiktok.com');
    else if (name === 'gMapLink') isValid = val.includes('google.com/maps') || val.includes('goo.gl') || val.includes('maps.app.goo.gl');

    return isValid ? 'valid-link' : 'invalid-link';
  };

  const getTextAreaValidationClass = (value) => {
    if (!value) return '';
    return value.length >= 30 ? 'valid-link' : 'invalid-link';
  };

  const getPasswordValidationClass = (isConfirm) => {
    if (isConfirm) {
      if (!formData.confirmPassword) return '';
      return formData.password === formData.confirmPassword ? 'valid-link' : 'invalid-link';
    } else {
      if (!formData.password) return '';
      const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
      return passwordPattern.test(formData.password) ? 'valid-link' : 'invalid-link';
    }
  };

  const getEmailValidationClass = (email) => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) ? 'valid-link' : 'invalid-link';
  };

  const getPhoneValidationClass = (phone) => {
    if (!phone) return '';
    const phoneRegex = /^[0-9+\- ]{10,15}$/; // basic phone format
    return phoneRegex.test(phone.trim()) ? 'valid-link' : 'invalid-link';
  };

  // Calculate Progress based on 14 fields (excluding confirmPassword for progress)
  useEffect(() => {
    const fieldsToTrack = [
      'name', 'phone', 'sec_phone', 'email',
      'address', 'businessField', 'productDescription', 'vendorDescription',
      'gMapLink', 'fbLink', 'tiktokLink', 'instLink', 'whyUs', 'password'
    ];
    let filled = 0;
    fieldsToTrack.forEach(field => {
      if (formData[field] && formData[field].trim() !== '') filled++;
    });

    const percentage = Math.round((filled / fieldsToTrack.length) * 100);
    setProgress(percentage);

    if (percentage < 40) {
      setProgressColor('#e74c3c'); // Red
    } else if (percentage < 80) {
      setProgressColor('#f1c40f'); // Yellow
    } else {
      setProgressColor('#2ecc71'); // Green
    }
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    setFieldErrors({});

    let currentErrors = {};
    let hasError = false;

    // Validations before moving next
    if (step === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9+\- ]{10,15}$/;

      if (!formData.name) currentErrors.name = 'هذا الحقل مطلوب';
      
      if (!formData.phone) currentErrors.phone = 'هذا الحقل مطلوب';
      else if (!phoneRegex.test(formData.phone.trim())) currentErrors.phone = 'رقم الهاتف غير صالح';

      if (!formData.email) currentErrors.email = 'هذا الحقل مطلوب';
      else if (!emailRegex.test(formData.email.trim())) currentErrors.email = 'البريد الإلكتروني غير صالح';
      
      if (formData.sec_phone && formData.sec_phone.trim() !== '') {
        if (!phoneRegex.test(formData.sec_phone.trim())) {
          currentErrors.sec_phone = 'رقم الهاتف الإضافي غير صالح';
        }
      }

      if (Object.keys(currentErrors).length > 0) {
        setFieldErrors(currentErrors);
        return;
      }
    }
    if (step === 3) {
      if (!formData.address) currentErrors.address = 'هذا الحقل مطلوب';
      if (!formData.businessField) currentErrors.businessField = 'هذا الحقل مطلوب';

      if (!formData.vendorDescription) currentErrors.vendorDescription = 'هذا الحقل مطلوب';
      else if (formData.vendorDescription.length < 30) currentErrors.vendorDescription = 'يجب ألا يقل عن 30 حرفاً';

      if (!formData.productDescription) currentErrors.productDescription = 'هذا الحقل مطلوب';
      else if (formData.productDescription.length < 30) currentErrors.productDescription = 'يجب ألا يقل عن 30 حرفاً';

      if (!formData.whyUs) currentErrors.whyUs = 'هذا الحقل مطلوب';
      else if (formData.whyUs.length < 30) currentErrors.whyUs = 'يجب ألا يقل عن 30 حرفاً';

      if (!acceptTerms) {
        currentErrors.acceptTerms = 'يجب الموافقة على الشروط والأحكام الخاصة بالبائع للاستمرار';
      }

      if (Object.keys(currentErrors).length > 0) {
        setFieldErrors(currentErrors);
        return;
      }
    }
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setError('');
    setFieldErrors({});
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sendOtp = async () => {
    if (!formData.email) {
      setError('البريد الإلكتروني مفقود');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/auth/send-registration-otp`, { email: formData.email });
      setOtpSent(true);
      setSuccess('تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في إرسال الكود. يرجى التأكد من البريد والمحاولة ثانية.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('يرجى إدخال رمز التحقق');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Verify OTP
      await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/auth/verify-registration-otp`, {
        email: formData.email,
        otp
      });

      setOtpVerified(true);

      // 2. Submit Final Form
      await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/auth/vendor-register`, formData);

      setStep(5); // Success Step

    } catch (err) {
      setError(err.response?.data?.message || 'كود التحقق غير صحيح أو حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>تسجيل بائع - همسات هوم</title>
        <meta name="description" content="انضم إلينا كبائع في منصة همسات هوم لعرض منتجاتك" />
      </Helmet>

      <div className="vendor-reg-container">
        <div className="glass-card">

          {step < 5 && (
            <div className="progress-container">
              <div className="progress-text">
                <span>احتمالية قبول الملف</span>
                <span style={{ color: progressColor }}>{progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%`, backgroundColor: progressColor }}
                ></div>
              </div>
            </div>
          )}

          {error && <div className="text-center alert alert-danger" style={{ borderRadius: '10px' }}>{error}</div>}
          {success && <div className="text-center alert alert-success fw-bold" style={{ borderRadius: '10px' }}>{success}</div>}

          {/* STEP 1: Welcome */}
          {step === 1 && (
            <div className="step-container welcome-step">
              <Link to="/">
                <img src={logimg} alt="Hamasat Logo" />
              </Link>
              <h2>أهلاً بك في عائلة همسات هوم</h2>
              <p>
                نحن سعداء برغبتك في الانضمام إلينا كبائع وعرض منتجاتك على منصتنا.
                لقد قمنا بتسهيل عملية التسجيل لتتم في خطوات بسيطة وسريعة لضمان أفضل تجربة لك.
                يرجى التأكد من تعبئة البيانات بأكبر قدر من الدقة لزيادة فرصة قبول طلبك.
              </p>
              <button className="start-btn" onClick={nextStep}>ابدأ التسجيل الآن</button>

              <div className="mt-4">
                <p style={{ fontSize: '15px', color: '#7f8c8d' }}>
                  يمكنك الإطلاع على <Link to="/vendor-terms" target="_blank" className="fw-bold" style={{ color: '#ff6f33', textDecoration: 'underline' }}>الشروط والأحكام الخاصة بالبائع من هنا</Link>
                </p>
                <p style={{ fontSize: '15px', color: '#7f8c8d', marginTop: '10px' }}>
                  لديك حساب بالفعل؟ <Link to="/login" className="fw-bold" style={{ color: '#2c3e50', textDecoration: 'underline' }}>تسجيل الدخول</Link>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Basic Info */}
          {step === 2 && (
            <div className="step-container">
              <h4 className="mb-4 text-center fw-bold" style={{ color: '#2c3e50' }}>البيانات الأساسية</h4>
              <div className="row">
                <div className="col-md-6 custom-input-group">
                  <label>الاسم بالكامل *</label>
                  <input type="text" className="custom-input" name="name" value={formData.name} onChange={handleChange} required />
                  {fieldErrors.name && <small className="text-danger mt-1">{fieldErrors.name}</small>}
                </div>
                <div className="col-md-6 custom-input-group">
                  <label>البريد الإلكتروني *</label>
                  <input type="email" className={`custom-input ${getEmailValidationClass(formData.email)}`} name="email" value={formData.email} onChange={handleChange} dir="ltr" required />
                  {fieldErrors.email && <small className="text-danger mt-1">{fieldErrors.email}</small>}
                </div>
                <div className="col-md-6 custom-input-group">
                  <label>رقم الهاتف *</label>
                  <input type="text" className={`custom-input ${getPhoneValidationClass(formData.phone)}`} name="phone" value={formData.phone} onChange={handleChange} dir="ltr" required />
                  {fieldErrors.phone && <small className="text-danger mt-1">{fieldErrors.phone}</small>}
                </div>
                <div className="col-md-6 custom-input-group">
                  <label>رقم الهاتف الإضافي (اختياري)</label>
                  <input type="text" className={`custom-input ${getPhoneValidationClass(formData.sec_phone)}`} name="sec_phone" value={formData.sec_phone} onChange={handleChange} dir="ltr" />
                  {fieldErrors.sec_phone && <small className="text-danger mt-1">{fieldErrors.sec_phone}</small>}
                </div>
              </div>
              <div className="navigation-buttons">
                <button className="btn-back" onClick={prevStep}>السابق</button>
                <button className="btn-next" onClick={nextStep}>التالي</button>
              </div>
            </div>
          )}

          {/* STEP 3: Address & Business */}
          {step === 3 && (
            <div className="step-container">
              <h4 className="mb-4 text-center fw-bold" style={{ color: '#2c3e50' }}>العنوان وتفاصيل العمل</h4>
              <div className="row">
                <div className="col-md-12 custom-input-group">
                  <label>العنوان بالكامل *</label>
                  <input type="text" className="custom-input" name="address" value={formData.address} onChange={handleChange} required />
                  {fieldErrors.address && <small className="mt-1 text-danger">{fieldErrors.address}</small>}
                </div>
                <div className="col-md-12 custom-input-group">
                  <label>مجال العمل (مثال: أجهزة منزلية، أدوات مطبخ) *</label>
                  <input type="text" className="custom-input" name="businessField" value={formData.businessField} onChange={handleChange} required />
                  {fieldErrors.businessField && <small className="mt-1 text-danger">{fieldErrors.businessField}</small>}
                </div>

                <div className="col-md-6 custom-input-group">
                  <label>رابط موقعك على الخرائط (اختياري)</label>
                  <input type="url" className={`custom-input ${getLinkValidationClass('gMapLink', formData.gMapLink)}`} name="gMapLink" value={formData.gMapLink} onChange={handleChange} dir="ltr" />
                </div>
                <div className="col-md-6 custom-input-group">
                  <label>رابط فيسبوك (اختياري)</label>
                  <input type="url" className={`custom-input ${getLinkValidationClass('fbLink', formData.fbLink)}`} name="fbLink" value={formData.fbLink} onChange={handleChange} dir="ltr" />
                </div>
                <div className="col-md-6 custom-input-group">
                  <label>رابط انستجرام (اختياري)</label>
                  <input type="url" className={`custom-input ${getLinkValidationClass('instLink', formData.instLink)}`} name="instLink" value={formData.instLink} onChange={handleChange} dir="ltr" />
                </div>
                <div className="col-md-6 custom-input-group">
                  <label>رابط تيك توك (اختياري)</label>
                  <input type="url" className={`custom-input ${getLinkValidationClass('tiktokLink', formData.tiktokLink)}`} name="tiktokLink" value={formData.tiktokLink} onChange={handleChange} dir="ltr" />
                </div>

                <div className="col-md-12 custom-input-group">
                  <label>وصف عن البائع / المتجر * (أدنى حد 30 حرف)</label>
                  <textarea className={`custom-input ${getTextAreaValidationClass(formData.vendorDescription)}`} name="vendorDescription" value={formData.vendorDescription} onChange={handleChange} rows={3} required></textarea>
                  {fieldErrors.vendorDescription && <small className="mt-1 text-danger">{fieldErrors.vendorDescription}</small>}
                </div>
                <div className="col-md-12 custom-input-group">
                  <label>تفاصيل المنتجات التي ترغب في بيعها * (أدنى حد 30 حرف)</label>
                  <textarea className={`custom-input ${getTextAreaValidationClass(formData.productDescription)}`} name="productDescription" value={formData.productDescription} onChange={handleChange} rows={3} required></textarea>
                  {fieldErrors.productDescription && <small className="mt-1 text-danger">{fieldErrors.productDescription}</small>}
                </div>
                <div className="col-md-12 custom-input-group">
                  <label>لماذا ترغب بالانضمام إلينا؟ * (أدنى حد 30 حرف)</label>
                  <textarea className={`custom-input ${getTextAreaValidationClass(formData.whyUs)}`} name="whyUs" value={formData.whyUs} onChange={handleChange} rows={3} required></textarea>
                  {fieldErrors.whyUs && <small className="mt-1 text-danger">{fieldErrors.whyUs}</small>}
                </div>

                <div className="col-md-12 custom-input-group mt-3" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: 'row' }}>
                  <input 
                    type="checkbox" 
                    id="acceptTerms" 
                    checked={acceptTerms} 
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      if (e.target.checked) {
                        setFieldErrors(prev => ({ ...prev, acceptTerms: '' }));
                      }
                    }} 
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#ff6f33' }}
                  />
                  <label htmlFor="acceptTerms" style={{ margin: 0, cursor: 'pointer', color: '#2c3e50', display: 'inline-block' }}>
                    لقد قرأت وأوافق على <Link to="/vendor-terms" target="_blank" style={{ color: '#ff6f33', textDecoration: 'underline' }}>الشروط والأحكام الخاصة بالبائع</Link> *
                  </label>
                </div>
                {fieldErrors.acceptTerms && <div className="col-md-12"><small className="mt-1 text-danger fw-bold">{fieldErrors.acceptTerms}</small></div>}

              </div>
              <div className="navigation-buttons mt-4">
                <button className="btn-back" onClick={prevStep}>السابق</button>
                <button className="btn-next" onClick={nextStep}>التالي</button>
              </div>
            </div>
          )}

          {/* STEP 4: Password & OTP */}
          {step === 4 && (
            <div className="step-container">
              <h4 className="mb-2 text-center fw-bold" style={{ color: '#2c3e50' }}>تأمين الحساب والتحقق</h4>
              <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                ملاحظة: يجب ألا تقل كلمة المرور عن 8 خانات، وأن تحتوي على أرقام وحروف (عربي/إنجليزي) على الأقل.
              </p>

              {!otpSent ? (
                <>
                  <div className="row">
                    <div className="col-md-6 custom-input-group">
                      <label>إنشاء كلمة المرور *</label>
                      <div className="password-input-wrapper">
                        <input type={showPassword ? "text" : "password"} className={`custom-input ${getPasswordValidationClass(false)}`} name="password" value={formData.password} onChange={handleChange} dir="ltr" required />
                        <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                      {formData.password && getPasswordValidationClass(false) === 'invalid-link' && (
                        <small className="text-danger mt-1 d-block" style={{ fontSize: '0.8rem' }}>
                          كلمة المرور غير مطابقة للشروط المذكورة أعلاه.
                        </small>
                      )}
                    </div>
                    <div className="col-md-6 custom-input-group">
                      <label>تأكيد كلمة المرور *</label>
                      <div className="password-input-wrapper">
                        <input type={showConfirmPassword ? "text" : "password"} className={`custom-input ${getPasswordValidationClass(true)}`} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} dir="ltr" required />
                        <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="navigation-buttons">
                    <button className="btn-back" onClick={prevStep}>السابق</button>
                    <button className="btn-submit" onClick={sendOtp} disabled={loading}>
                      {loading ? 'جاري الإرسال...' : 'إرسال كود التحقق للإيميل'}
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={verifyOtpAndSubmit}>
                  <div className="text-center otp-section">
                    <p className="otp-desc">
                      تم إرسال كود تحقق مكون من 6 أرقام إلى البريد الإلكتروني:<br />
                      <strong>{formData.email}</strong>
                    </p>
                    <div className="custom-input-group" style={{ maxWidth: '300px', margin: '0 auto' }}>
                      <label style={{ textAlign: 'center' }}>أدخل كود التحقق *</label>
                      <input
                        type="text"
                        className="text-center custom-input"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                        dir="ltr"
                        required
                        style={{ fontSize: '24px', letterSpacing: '5px' }}
                      />
                    </div>
                  </div>
                  <div className="navigation-buttons">
                    <button type="button" className="btn-back" onClick={() => setOtpSent(false)}>تعديل كلمة المرور</button>
                    <button type="submit" className="btn-submit" disabled={loading || !otp}>
                      {loading ? 'جاري تأكيد الحساب...' : 'تأكيد وإنهاء التسجيل'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 5: Success */}
          {step === 5 && (
            <div className="step-container success-step">
              <FaCheckCircle className="success-icon" />
              <h2>تم تسجيل طلبك بنجاح!</h2>
              <p>
                لقد استلمنا طلب انضمامك لعائلة همسات هوم.<br />
                سيتم مراجعة الطلب من قبل الإدارة وسنقوم بالتواصل والرد عليكم في أقرب وقت ممكن.
              </p>
              
              <div className="progress-container" style={{ maxWidth: '400px', margin: '0 auto 30px' }}>
                <div className="progress-text" style={{ justifyContent: 'center', gap: '10px' }}>
                  <span>احتمالية قبول الملف بناءً على دقة بياناتك:</span>
                  <span style={{ color: progressColor, fontSize: '18px' }}>{progress}%</span>
                </div>
                <div className="progress-bar-bg" style={{ height: '12px' }}>
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${progress}%`, backgroundColor: progressColor }}
                  ></div>
                </div>
              </div>

              <Link to="/" style={{ textDecoration: 'none' }}>
                <button className="start-btn">العودة للرئيسية</button>
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default VendorRegistration;
