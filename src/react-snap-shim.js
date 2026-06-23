// هذا الكود يشتغل بس وقت react-snap (مش وقت تشغيل الموقع عادي)
if (navigator.userAgent === "ReactSnap") {
    // تجاهل كل الــ API requests
    window.fetch = () =>
        Promise.resolve({
            ok: true,
            json: async () => ({}), // بيرجع بيانات فاضية
            text: async () => "",
        });

    // كمان نقدر نعمل mock لـ localStorage
    window.localStorage = {
        getItem: () => null,
        setItem: () => { },
        removeItem: () => { },
    };
}
