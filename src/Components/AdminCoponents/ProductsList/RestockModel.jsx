import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import './RestockModel.css'
import { useProducts } from "../../../hooks/useProducts";

const RestockModel = ({ itemId, onClose, onUpdate }) => {
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const { products } = useProducts();
  const filteredProduct = products.find(product => product.id === itemId);

  const handleSubmit = async () => {
    if (quantity <= 0) return toast.error("أدخل كمية صحيحة");

    setLoading(true);
    try {
      // إرسال التحديث بدون تخزين response لأنه مش مستخدم
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/products/${itemId}`,
        { stock: filteredProduct.stock + Number(quantity) },
        { withCredentials: true }
      );

      // تحديث البيانات محليًا
      onUpdate(filteredProduct.id, filteredProduct.stock + Number(quantity));
      toast.success("تم تحديث الكمية بنجاح");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reStock-model-container" onClick={onClose}>
      <div className="reStock-model" onClick={(e) => e.stopPropagation()}>
        <h3>تحديث كمية المنتج</h3>
        <p>المنتج: {filteredProduct.name_ar}</p>
        <p>الكمية السابقة: <strong>{filteredProduct.stock} </strong>- المتبقي: <strong>{Number(filteredProduct.remaining) + Number(quantity)}</strong></p>
        <input
          type="number"
          value={quantity}
          min={0}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="أدخل الكمية المراد إضافتها"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // يمنع الـ form من إنه يعمل refresh
              handleSubmit();
            }
          }}
        />

        <div className="reStock-model-buttons">
          <button className="C-btn" onClick={onClose} disabled={loading}>إلغاء</button>
          <button className="C-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "جارٍ التحديث..." : "تحديث"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestockModel;
