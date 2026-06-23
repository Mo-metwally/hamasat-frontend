// src/components/CancelReasonModal.jsx
import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";

const CancelReasonModal = ({ orderId, isOpen, onClose, onSave, currentStatus, initialData }) => {
  const [loading, setLoading] = useState(false);
  const options = (
    currentStatus === "delivered" ? [
      { value: "قيد المراجعة (طلب إرجاع)", label: "قيد المراجعة (طلب إرجاع)" },
    ]
      :
      [
        { value: "تم إلغاء الطلب نظراً لعدم إمكانية التواصل", label: "لا يمكن التواصل مع العميل" },
        { value: "تم إلغاء الطلب بناءً علي رغبتك", label: "تم إلغاء الطلب من العميل" },
      ]);


  const [selectedReason, setSelectedReason] = useState("");

  useEffect(() => {
    if (isOpen && initialData) {
      setSelectedReason(initialData.cancelReason || "");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;


  const handleSave = async () => {
    if (!selectedReason) {
      toast.error("من فضلك اختر سبب الإلغاء أو أضف واحد جديد");
      return;
    }
    setLoading(true);
    try {
      await onSave(orderId, selectedReason);
      setSelectedReason("");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حفظ سبب الإلغاء");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reStock-model-container">
      <div className="reStock-model">
        <h3>سبب الإلغاء</h3>
        <CreatableSelect
          className="selector"
          isClearable
          options={options}
          value={
            selectedReason
              ? { value: selectedReason, label: selectedReason }
              : null
          }
          onChange={(newValue) =>
            setSelectedReason(newValue ? newValue.value : "")
          }
          formatCreateLabel={(inputValue) => `إضافة "${inputValue}"`}

          placeholder="اختر أو أضف سبب الإلغاء"
          isDisabled={loading}
        />
        <div className="reStock-model-buttons">
          <button
            type='button'
            className="C-btn"
            onClick={() => {
              if (loading) return;
              setSelectedReason("");
              onClose();
            }}
            disabled={loading}
          >
            إلغاء
          </button>
          <button type='button' className="C-btn" onClick={handleSave} disabled={loading}>
            {loading ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelReasonModal;
