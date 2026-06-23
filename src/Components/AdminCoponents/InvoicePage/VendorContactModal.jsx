import React, { useState } from 'react';
import { Modal, Box, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import { FaTimes, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const VendorContactModal = ({ open, handleClose, product, orderCode }) => {
    const [sendingEmail, setSendingEmail] = useState(false);

    if (!product || !product.vendor) return null;

    const vendor = product.vendor;
    const message = `مرحباً ${vendor.name}،
بخصوص الطلب الحالي، نود إخطارك بتفاصيل المنتج الخاص بك:

- كود/موديل المنتج: ${product.model_ar || product.model_en || '-'}
- اسم المنتج: ${product.name_ar}
- الكمية: ${product.OrderProducts?.quantity}
- اللون: ${product.color_ar?.[0] || '-'}
- مقاس/حجم: ${product.OrderProducts?.size !== "n/a" ? product.OrderProducts?.size : (product.size_ar || '-')}
- السعر: ${Math.floor(Number(product.OrderProducts?.unitPrice || 0))} ج.م

طلب رقم: ${orderCode || 'غير متوفر'}

برجاء المراجعة والتأكيد.`;

    const handleWhatsApp = () => {
        let phone = vendor.phone;
        // Basic phone formatting for wa.me (removing leading zeros if needed, or adding country code)
        // If phone doesn't start with '+', we can assume +20 for Egypt for example, but better to just pass it directly if it has country code
        if (phone && phone.startsWith('0')) {
            phone = '+20' + phone.substring(1);
        }
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleSendEmail = async () => {
        try {
            setSendingEmail(true);
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/orders/send-vendor-email`, {
                vendorEmail: vendor.email,
                vendorName: vendor.name,
                subject: `إخطار بخصوص المنتج: ${product.name_ar}`,
                message: message
            }, { withCredentials: true });
            
            if (res.data.success) {
                toast.success("تم إرسال البريد الإلكتروني بنجاح ✅");
                handleClose();
            }
        } catch (error) {
            console.error(error);
            toast.error("حدث خطأ أثناء إرسال البريد ❌");
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose} sx={{ zIndex: 99999 }}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '90%', maxWidth: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4, direction: 'rtl'
            }}>
                <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <FaTimes />
                </IconButton>
                <Typography variant="h6" component="h2" mb={2} color="#ff6f33" fontWeight="bold">
                    بيانات البائع
                </Typography>
                
                <Box mb={3} p={2} bgcolor="#f9fafb" borderRadius={2}>
                    <Typography mb={1}><strong>الاسم:</strong> {vendor.name}</Typography>
                    <Typography mb={1}><strong>الهاتف:</strong> <span dir="ltr">{vendor.phone || 'غير متوفر'}</span></Typography>
                    <Typography mb={1}><strong>البريد الإلكتروني:</strong> {vendor.email || 'غير متوفر'}</Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" mb={2}>
                    إرسال إخطار بخصوص المنتج: <strong>{product.name_ar}</strong>
                </Typography>

                <Box display="flex" gap={2}>
                    <Button 
                        variant="contained" 
                        color="success" 
                        startIcon={<FaWhatsapp style={{marginLeft: '8px'}} />}
                        disabled={!vendor.phone}
                        onClick={handleWhatsApp}
                        fullWidth
                    >
                        واتساب
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={sendingEmail ? <CircularProgress size={20} color="inherit" sx={{ml: 1}} /> : <FaEnvelope style={{marginLeft: '8px'}} />}
                        disabled={!vendor.email || sendingEmail}
                        onClick={handleSendEmail}
                        fullWidth
                    >
                        {sendingEmail ? 'جاري الإرسال...' : 'إيميل'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default VendorContactModal;
