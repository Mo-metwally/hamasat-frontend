import React from "react";
const CancelOrder = ({ orderDetails }) => {
    const constructWhatsAppLink = () => {
        const baseUrl = 'https://api.whatsapp.com/send';
        const phone = process.env.REACT_APP_Shop_PhoneNum; // استبدل برقم واتساب الخاص بك
        const message = `برجاء إلغاء الطلب\nرقم الطلب: ${orderDetails.orderCode || 'N/A'}\nتاريخ الطلب: ${new Date(orderDetails.createdAt).toLocaleDateString() || 'N/A'}\nاسم العميل: ${orderDetails.username || 'N/A'}\nكود الطلب: ${orderDetails.orderCode || 'N/A'}\nالمبلغ الإجمالي: ${orderDetails.total || 'N/A'}`;
        return `${baseUrl}?phone=${phone}&text=${encodeURIComponent(message)}`;
    };

    // const phoneNumber = process.env.REACT_APP_Shop_PhoneNum;
    const handleCancelOrder = () => {
        const whatsappLink = constructWhatsAppLink();
        window.open(whatsappLink, '_blank');
    };

    return (
        <button className='C-Sbtn' onClick={handleCancelOrder}>
            إلغاء الطلب
        </button>
    );
};
export default CancelOrder;
