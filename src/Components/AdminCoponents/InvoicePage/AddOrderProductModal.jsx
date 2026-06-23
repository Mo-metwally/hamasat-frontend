import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, IconButton, TextField, CircularProgress, Autocomplete } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../Context/AuthContext';

const AddOrderProductModal = ({ open, handleClose, orderId, onSuccess }) => {
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);
    const [color, setColor] = useState("n/a");
    const [size, setSize] = useState("n/a");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (open) {
            fetchProducts();
        } else {
            // Reset state when closed
            setSelectedProduct(null);
            setQuantity(1);
            setUnitPrice(0);
            setColor("n/a");
            setSize("n/a");
        }
    }, [open]);

    const fetchProducts = async () => {
        try {
            setLoadingProducts(true);
            const adminViewParam = user?.role === 'admin' ? '&adminView=true' : '';
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/products?limit=1000${adminViewParam}`, { withCredentials: true });
            setProducts(res.data.data.data || res.data.data || []);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleProductSelect = (event, newValue) => {
        setSelectedProduct(newValue);
        if (newValue) {
            setUnitPrice(newValue.salePrice > 0 ? newValue.salePrice : newValue.price);
            setColor(newValue.color_ar?.[0] || "n/a");
            setSize(newValue.size_ar || "n/a");
        }
    };

    const handleAdd = async () => {
        if (!selectedProduct) {
            return toast.error("برجاء اختيار المنتج أولاً");
        }

        try {
            setLoading(true);
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/orders/${orderId}/products`, {
                productId: selectedProduct.id,
                quantity: Number(quantity),
                unitPrice: Number(unitPrice),
                color,
                size
            }, { withCredentials: true });
            
            if (res.status === 200 || res.status === 201) {
                toast.success("تم إضافة المنتج للطلب بنجاح ✅");
                onSuccess();
                handleClose();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "حدث خطأ أثناء الإضافة ❌");
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
                <Typography variant="h6" component="h2" mb={3} color="#ff6f33" fontWeight="bold">
                    إضافة منتج للطلب
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2} mb={3}>
                    <Autocomplete
                        options={products}
                        getOptionLabel={(option) => `${option.name_ar} - كود: ${option.model_ar || option.model_en || ''} - متاح: ${option.remaining}`}
                        loading={loadingProducts}
                        onChange={handleProductSelect}
                        value={selectedProduct}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="ابحث عن منتج" 
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {loadingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                        noOptionsText="لا يوجد منتجات"
                    />

                    {selectedProduct && (
                        <>
                            <TextField 
                                label="الكمية" 
                                type="number" 
                                value={quantity} 
                                onChange={(e) => setQuantity(e.target.value)} 
                                fullWidth 
                                InputProps={{ inputProps: { min: 1, max: selectedProduct.remaining } }}
                            />
                            <TextField 
                                label="سعر الوحدة" 
                                type="number" 
                                value={unitPrice} 
                                onChange={(e) => setUnitPrice(e.target.value)} 
                                fullWidth 
                            />
                            <TextField 
                                label="اللون" 
                                type="text" 
                                value={color} 
                                onChange={(e) => setColor(e.target.value)} 
                                fullWidth 
                            />
                            <TextField 
                                label="المقاس / الحجم" 
                                type="text" 
                                value={size} 
                                onChange={(e) => setSize(e.target.value)} 
                                fullWidth 
                            />
                            <Box mt={1} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                                <Typography variant="body1" fontWeight="bold">
                                    الإجمالي المتوقع: { (Number(quantity) * Number(unitPrice)).toLocaleString('en-EG') } ج.م
                                </Typography>
                            </Box>
                        </>
                    )}
                </Box>

                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={loading ? <CircularProgress size={20} color="inherit" sx={{ml: 1}} /> : <span>+</span>}
                    disabled={loading || !selectedProduct || quantity < 1}
                    onClick={handleAdd}
                    fullWidth
                >
                    {loading ? 'جاري الإضافة...' : 'إضافة للطلب'}
                </Button>
            </Box>
        </Modal>
    );
};

export default AddOrderProductModal;
