// utils/normalizeText.js
export const normalizedText = (text = "") => {
    if (!text) return "";

    return text
        .replace(/<br\s*\/?>/gi, "\n") // يحول <br> أو <br /> لسطر جديد
        .replace(/<\/?[^>]+(>|$)/g, "") // يشيل أي HTML tags تانية
        .trim(); // يشيل المسافات الفاضية في الأول والآخر
};
