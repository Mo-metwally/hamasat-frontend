import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { CircularProgress } from '@mui/material';
import { FaUserEdit, FaLock, FaStore, FaAddressCard, FaPhoneAlt, FaShareAlt } from 'react-icons/fa';
import './MyAccount.scss';
import { useAuth } from '../../../Context/AuthContext';

const MyAccount = () => {
    const { user, setUser } = useAuth();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        sec_phone: '',
        address: '',
        businessField: '',
        productDescription: '',
        vendorDescription: '',
        whyUs: '',
        fbLink: '',
        instLink: '',
        tiktokLink: '',
        gMapLink: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                sec_phone: user.sec_phone || '',
                address: user.address || '',
                businessField: user.businessField || '',
                productDescription: user.productDescription || '',
                vendorDescription: user.vendorDescription || '',
                whyUs: user.whyUs || '',
                fbLink: user.fbLink || '',
                instLink: user.instLink || '',
                tiktokLink: user.tiktokLink || '',
                gMapLink: user.gMapLink || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password && formData.password !== formData.confirmPassword) {
            return toast.error("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
        }

        try {
            setLoading(true);
            const dataToUpdate = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                sec_phone: formData.sec_phone,
                address: formData.address,
                businessField: formData.businessField,
                productDescription: formData.productDescription,
                vendorDescription: formData.vendorDescription,
                whyUs: formData.whyUs,
                fbLink: formData.fbLink,
                instLink: formData.instLink,
                tiktokLink: formData.tiktokLink,
                gMapLink: formData.gMapLink
            };

            if (formData.password) {
                dataToUpdate.password = formData.password;
            }

            const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/users/updateMe`, dataToUpdate, {
                withCredentials: true
            });

            if (res.status === 200) {
                toast.success("تم تحديث البيانات بنجاح ✅");
                if (setUser) {
                    setUser(res.data.data);
                }
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "حدث خطأ أثناء التحديث");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="my-account-page" dir="rtl">
            <div className="account-container advanced-container">
                <h2 className="page-title">
                    <FaUserEdit className="title-icon" /> إعدادات {user?.role === 'vendor' ? 'حساب البائع' : 'المدير'}
                </h2>
                
                <form onSubmit={handleSubmit} className="advanced-form">
                    
                    {/* الأساسيات */}
                    <div className="form-section">
                        <h4 className="section-title"><FaUserEdit /> المعلومات الأساسية</h4>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="form-floating-custom">
                                    <label className="form-label">الاسم</label>
                                    <input type="text" name="name" className="form-control advanced-input" value={formData.name} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-floating-custom">
                                    <label className="form-label">البريد الإلكتروني</label>
                                    <input type="email" name="email" className="form-control advanced-input" value={formData.email} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-floating-custom">
                                    <label className="form-label">مجال العمل</label>
                                    <input type="text" name="businessField" className="form-control advanced-input" value={formData.businessField} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* بيانات التواصل */}
                    <div className="form-section">
                        <h4 className="section-title"><FaPhoneAlt /> بيانات التواصل</h4>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="form-floating-custom">
                                    <label className="form-label">رقم الهاتف</label>
                                    <input type="text" name="phone" className="form-control advanced-input" value={formData.phone} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-floating-custom">
                                    <label className="form-label">رقم إضافي (اختياري)</label>
                                    <input type="text" name="sec_phone" className="form-control advanced-input" value={formData.sec_phone} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-floating-custom">
                                    <label className="form-label">العنوان بالتفصيل</label>
                                    <input type="text" name="address" className="form-control advanced-input" value={formData.address} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4 className="section-title"><FaShareAlt /> الروابط والتواصل الاجتماعي</h4>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="form-floating-custom">
                                    <label className="form-label">رابط فيسبوك</label>
                                    <input type="url" name="fbLink" className="form-control advanced-input" value={formData.fbLink} onChange={handleChange} dir="ltr" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-floating-custom">
                                    <label className="form-label">رابط إنستجرام</label>
                                    <input type="url" name="instLink" className="form-control advanced-input" value={formData.instLink} onChange={handleChange} dir="ltr" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-floating-custom">
                                    <label className="form-label">رابط تيك توك</label>
                                    <input type="url" name="tiktokLink" className="form-control advanced-input" value={formData.tiktokLink} onChange={handleChange} dir="ltr" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-floating-custom">
                                    <label className="form-label">رابط الموقع على جوجل ماب</label>
                                    <input type="url" name="gMapLink" className="form-control advanced-input" value={formData.gMapLink} onChange={handleChange} dir="ltr" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4 className="section-title"><FaStore /> التفاصيل والوصف</h4>
                        <div className="row g-4">
                            <div className="col-md-12">
                                <div className="form-floating-custom">
                                    <label className="form-label">عن البائع/المتجر</label>
                                    <textarea name="vendorDescription" className="form-control advanced-input" rows="3" value={formData.vendorDescription} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-floating-custom">
                                    <label className="form-label">وصف المنتجات والخدمات التي تقدمها</label>
                                    <textarea name="productDescription" className="form-control advanced-input" rows="3" value={formData.productDescription} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-floating-custom">
                                    <label className="form-label">لماذا ترغب بالانضمام لمنصتنا كبائع؟ (عن المتجر)</label>
                                    <textarea name="whyUs" className="form-control advanced-input" rows="4" value={formData.whyUs} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* الأمان */}
                    <div className="form-section">
                        <h4 className="section-title"><FaLock /> الأمان وكلمة المرور</h4>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="form-floating-custom">
                                    <label className="form-label">كلمة المرور الجديدة (اختياري)</label>
                                    <input type="password" name="password" className="form-control advanced-input" value={formData.password} onChange={handleChange} placeholder="اتركه فارغاً إذا لم ترد التغيير" />
                                </div>
                            </div>
                            
                            {formData.password && (
                                <div className="col-md-6">
                                    <div className="form-floating-custom">
                                        <label className="form-label">تأكيد كلمة المرور</label>
                                        <input type="password" name="confirmPassword" className="form-control advanced-input" value={formData.confirmPassword} onChange={handleChange} required={!!formData.password} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="submit-section text-start mt-4">
                        <button type="submit" className="save-btn advanced-btn" disabled={loading}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'حفظ التعديلات'}
                        </button>
                    </div>

                </form>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default MyAccount;
