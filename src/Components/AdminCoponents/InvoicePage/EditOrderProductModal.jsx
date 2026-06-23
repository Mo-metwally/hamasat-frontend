import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, IconButton, TextField, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditOrderProductModal = ({ open, handleClose, orderId, product, onSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);
    const [color, setColor] = useState("n/a");
    const [size, setSize] = useState("n/a");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setQuantity(product.OrderProducts?.quantity || 1);
            setUnitPrice(product.OrderProducts?.unitPrice || 0);
            setColor(product.OrderProducts?.color || "n/a");
            setSize(product.OrderProducts?.size || "n/a");
        }
    }, [product]);

    if (!product) return null;

    const handleSave = async () => {
        try {
            setLoading(true);
            const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/orders/${orderId}/products/${product.id}`, {
                quantity: Number(quantity),
                unitPrice: Number(unitPrice),
                color,
                size
            }, { withCredentials: true });
            
            if (res.status === 200) {
                toast.success("تم تعديل المنتج بنجاح ✅");
                onSuccess();
                handleClose();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تعديل المنتج ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose} sx={{ zIndex: 99999 }}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '90%', maxWidth: 500, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4, direction: 'rtl'
            }}>
                <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <span>X</span>
                </IconButton>
                <Typography variant="h6" component="h2" mb={2} color="#ff6f33" fontWeight="bold">
                    تعديل المنتج داخل الطلب
                </Typography>
                
                <Typography variant="subtitle1" mb={3}>
                    {product.name_ar}
                </Typography>

                <Box display="flex" flexDirection="column" gap={2} mb={3}>
                    <TextField 
                        label="الكمية" 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                        fullWidth 
                    />
                    <TextField 
                        label="سعر الوحدة" 
                        type="number" 
                        value={unitPrice} 
                        onChange={(e) => setUnitPrice(e.target.value)} 
                        fullWidth 
                    />
                    <FormControl fullWidth>
                        <InputLabel>اللون</InputLabel>
                        <Select
                            value={color}
                            label="اللون"
                            onChange={(e) => setColor(e.target.value)}
                        >
                            <MenuItem value="n/a">لا يوجد (n/a)</MenuItem>
                            {product.color_ar && product.color_ar.map((c, idx) => (
                                <MenuItem key={`color-${idx}`} value={c}>{c}</MenuItem>
                            ))}
                            {color !== "n/a" && (!product.color_ar || !product.color_ar.includes(color)) && (
                                <MenuItem value={color}>{color}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>المقاس / الحجم</InputLabel>
                        <Select
                            value={size}
                            label="المقاس / الحجم"
                            onChange={(e) => setSize(e.target.value)}
                        >
                            <MenuItem value="n/a">لا يوجد (n/a)</MenuItem>
                            {product.size_ar && product.size_ar.map((s, idx) => (
                                <MenuItem key={`size-${idx}`} value={s}>{s}</MenuItem>
                            ))}
                            {size !== "n/a" && (!product.size_ar || !product.size_ar.includes(size)) && (
                                <MenuItem value={size}>{size}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <Box mt={1} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                        <Typography variant="body1" fontWeight="bold">
                            الإجمالي الجديد: { (Number(quantity) * Number(unitPrice)).toLocaleString('en-EG') } ج.م
                        </Typography>
                    </Box>
                </Box>

                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={loading ? <CircularProgress size={20} color="inherit" sx={{ml: 1}} /> : <span>Save</span>}
                    disabled={loading}
                    onClick={handleSave}
                    fullWidth
                >
                    {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
            </Box>
        </Modal>
    );
};

export default EditOrderProductModal;
