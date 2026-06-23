import React from "react";
import { toast } from "react-toastify";

const CopyOrder = ({ orderDetails, user }) => {
    const buildMessage = () => {
        let products = orderDetails.products || [];
        if (user?.role === 'admin') {
            products = products.filter(p => p.vendorId === user.id);
        }

        const productsList = products
            ?.map(
                (product, index) =>
                    `\u202B${index + 1}- ${product.name_ar}
                    الكمية: ${product.OrderProducts?.quantity}
                    اللون: ${product.color_ar?.[0] || '-'}
                    العدد: ${product.OrderProducts?.color !== "n/a"
                        ? product.OrderProducts?.color
                        : product.size_ar
                    }
                    المقاس: ${product.OrderProducts?.size !== "n/a"
                        ? product.OrderProducts?.size
                        : product.size_en
                    }\u202C`
            )
            .join("\n\n");

        return `\u202B
                برجاء مراجعة الطلب
                رقم الطلب: *${orderDetails.orderCode || "N/A"}*
                اسم العميل: *${orderDetails.username || "N/A"}*
                رقم الهاتف: ${orderDetails.phoneNumber || "N/A"}
                المحافظة/المدينة: *${orderDetails.area} - ${orderDetails.flatNum || "N/A"}*
                سعر الطلب: *${orderDetails.total ? Number(orderDetails.total.replace(/\.00$/, "")).toLocaleString("en-US") : "N/A"}*
                مصاريف الشحن: *${orderDetails.adminNoteOne || "لم تحدد"}*
                حالة الدفع: *${orderDetails.adminNoteTwo || "لم تحدد"}*
                تاريخ الطلب: ${new Date(orderDetails.createdAt).toLocaleDateString() || "N/A"
            }

                المنتجات:
                ${productsList || "لا توجد منتجات"}\u202C`;
    };
    const copyToClipboardFallback = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand("copy");
            toast.success("تم نسخ بيانات الطلب بنجاح ✅");
        } catch (err) {
            toast.error("تعذر نسخ البيانات ❌");
        }
        document.body.removeChild(textArea);
    };

    const handleCopyAndOpenWhatsApp = async () => {
        const message = buildMessage();

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(message);
                toast.success("تم نسخ بيانات الطلب بنجاح ✅");

                setTimeout(() => {
                    // نحاول نفتح التطبيق
                    const appLink = `whatsapp://send?text=${encodeURIComponent(message)}`;
                    const webLink = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;

                    // افتح اللينك بتاع التطبيق
                    window.location.href = appLink;

                    // fallback: لو التطبيق مش موجود يرجع يفتح الويب
                    setTimeout(() => {
                        window.open(webLink, "_blank");
                    }, 1500);
                }, 1000);
            } catch (err) {
                toast.error("تعذر نسخ البيانات ❌");
                console.error("فشل نسخ الرسالة:", err);
            }
        } else {
            // fallback
            copyToClipboardFallback(message);

            setTimeout(() => {
                const appLink = `whatsapp://send?text=${encodeURIComponent(message)}`;
                const webLink = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;

                window.location.href = appLink;
                setTimeout(() => {
                    window.open(webLink, "_blank");
                }, 1500);
            }, 1000);
        }
    };

    return (
        <button type='button' className="btn btn-store" onClick={handleCopyAndOpenWhatsApp}>
            نسخ البيانات
        </button>
    );
};



export default CopyOrder;
