import React from "react";
const SendToStorage = ({ orderDetails }) => {
    const constructWhatsAppLink = () => {
        const baseUrl = 'https://api.whatsapp.com/send';
        const phone = process.env.REACT_APP_Shop_PhoneNum;

        // بناء قائمة المنتجات
        const productsList = orderDetails.products
            ?.map(
                (product, index) =>
                    `\u202B${index + 1}- ${product.name_ar}\n   الكمية: ${product.OrderProducts?.quantity}\n   اللون: ${product.color_ar?.[0] || '-'}\n   العدد: ${product.OrderProducts?.color !== "n/a"
                        ? product.OrderProducts?.color
                        : product.size_ar
                    }\n   المقاس: ${product.OrderProducts?.size !== "n/a"
                        ? product.OrderProducts?.size
                        : product.size_en
                    }\u202C`
            )
            .join("\n\n");

        const message = `\u202Bبرجاء تجهيز الطلب
            اسم العميل: ${orderDetails.username || 'N/A'}
            رقم الهاتف: ${orderDetails.phoneNumber || 'N/A'}
            رقم الطلب: ${orderDetails.orderCode || 'N/A'}
            تاريخ الطلب: ${new Date(orderDetails.createdAt).toLocaleDateString() || 'N/A'}

            المنتجات:
            ${productsList || 'لا توجد منتجات'}\u202C`;



        return `${baseUrl}?phone=${phone}&text=${encodeURIComponent(message)}`;
    };

    const handleSendToStorage = () => {
        const whatsappLink = constructWhatsAppLink();
        window.open(whatsappLink, '_blank');
    };

    return (
        <button type='button' className='btn btn-store' onClick={handleSendToStorage}>
            إرسال للمخزن
        </button>
    );
};

export default SendToStorage;
