import React, { useState } from 'react';
import { Modal, Box, Typography, Button, IconButton, TextField, CircularProgress } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddToOrderModal = ({ open, handleClose, product, quantity, color, size }) => {
    const [orderCode, setOrderCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!orderCode.trim()) {
            return toast.error("برجاء إدخال كود الطلب أولاً");
        }

        try {
            setLoading(true);
            
            // 1. Get orderId by orderCode
            const orderRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/orders/order/code/${orderCode}`, { withCredentials: true });
            const order = orderRes.data?.data;
            
            if (!order || !order.id) {
                toast.error("لم يتم العثور على طلب بهذا الكود");
                setLoading(false);
                return;
            }

            const orderId = order.id;
            const unitPrice = product.isSale ? product.salePrice : product.price;

            // 2. Add product to order
            const addRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/orders/${orderId}/products`, {
                productId: product.id,
                quantity: Number(quantity),
                unitPrice: Number(unitPrice),
                color: color || "n/a",
                size: size || "n/a"
            }, { withCredentials: true });

            if (addRes.status === 200 || addRes.status === 201) {
                toast.success("تم إضافة المنتج للطلب بنجاح ✅");
                handleClose();
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "حدث خطأ أثناء الإضافة للطلب ❌";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose} sx={{ zIndex: 99999 }}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '90%', maxWidth: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4, direction: 'rtl'
            }}>
                <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <span>X</span>
                </IconButton>
                <Typography variant="h6" component="h2" mb={3} color="#ff6f33" fontWeight="bold">
                    إضافة المنتج لطلب
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2} mb={3}>
                    <TextField 
                        label="كود الطلب (مثل C3AE80)" 
                        type="text" 
                        value={orderCode} 
                        onChange={(e) => setOrderCode(e.target.value)} 
                        fullWidth 
                    />
                </Box>

                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={loading ? <CircularProgress size={20} color="inherit" sx={{ml: 1}} /> : <span>+</span>}
                    disabled={loading || !orderCode}
                    onClick={handleAdd}
                    fullWidth
                    sx={{ backgroundColor: '#28a745', '&:hover': { backgroundColor: '#218838' } }}
                >
                    {loading ? 'جاري الإضافة...' : 'إضافة للطلب'}
                </Button>
            </Box>
        </Modal>
    );
};

export default AddToOrderModal;
