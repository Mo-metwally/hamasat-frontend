import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Albums.scss";
import { toast, ToastContainer } from "react-toastify";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/albums`;
const ADD_URL = `${process.env.REACT_APP_API_URL}/api/v1/albums/add`;
const REMOVE_URL = `${process.env.REACT_APP_API_URL}/api/v1/albums/remove`;

const AddAlbum = () => {
    const [previews, setPreviews] = useState([]);
    const [files, setFiles] = useState([]);   // لتخزين الملفات الحقيقية
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await axios.get(API_URL, { withCredentials: true });
                if (res.data.success) {
                    const images = res.data.data.images;
                    setPreviews(images.map(i => i.image));
                    setLinks(images.map(i => i.link ?? ""));
                    setFiles(images.map(() => null)); // ملفات افتراضية فارغة
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchAlbum();
    }, []);

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const newFiles = [...files];
        newFiles[index] = file;
        setFiles(newFiles);

        const newPreviews = [...previews];
        newPreviews[index] = URL.createObjectURL(file);
        setPreviews(newPreviews);

        const newLinks = [...links];
        if (newLinks[index] === undefined) newLinks[index] = "";
        setLinks(newLinks);
    };

    const handleLinkChange = (e, index) => {
        const newLinks = [...links];
        newLinks[index] = e.target.value || "";
        setLinks(newLinks);
    };

    const handleRemove = async (index) => {
        const imageUrl = previews[index];

        // لو الصورة جديدة (blob) أو لا يوجد رابط → نحذف محلياً فقط
        if (!imageUrl || imageUrl.startsWith("blob:")) {
            const newPreviews = [...previews];
            const newFiles = [...files];
            const newLinks = [...links];
            newPreviews.splice(index, 1);
            newFiles.splice(index, 1);
            newLinks.splice(index, 1);
            setPreviews(newPreviews);
            setFiles(newFiles);
            setLinks(newLinks);
            return;
        }

        try {
            await axios.patch(
                REMOVE_URL,
                { imageNames: [imageUrl] },
                { withCredentials: true }
            );

            const newPreviews = [...previews];
            const newFiles = [...files];
            const newLinks = [...links];
            newPreviews.splice(index, 1);
            newFiles.splice(index, 1);
            newLinks.splice(index, 1);
            setPreviews(newPreviews);
            setFiles(newFiles);
            setLinks(newLinks);
            toast.success('تم حذف الصورة');

        } catch (err) {
            console.error(err);
            toast.error("حدث خطأ أثناء الحذف");
            setMessage("حدث خطأ أثناء الحذف");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const formData = new FormData();

            previews.forEach((p, i) => {
                if (files[i]) {
                    // لو الصورة جديدة، أرسل الصورة والرابط اللي المستخدم دخله
                    formData.append("images", files[i]);
                    formData.append(`links`, links[i] || "");
                } else if (!p && links) {
                    // لو في رابط بدون صورة، ممكن تتجاهل أو تتحكم فيه حسب احتياجك
                    formData.append(`links`, links[i]);
                }
            });

            await axios.patch(ADD_URL, formData, { withCredentials: true });
            setMessage('تم تعديل عارض الصورة');
            toast.success('تم تعديل عارض الصورة');
            // مسح الملفات الجديدة
            setFiles([]);

            // إعادة تحميل المعاينة من السيرفر
            const fetchRes = await axios.get(API_URL, { withCredentials: true });
            if (fetchRes.data.success) {
                const images = fetchRes.data.data.images;
                setPreviews(images.map(i => i.image));
                setLinks(images.map(i => i.link ?? ""));
                setFiles(images.map(() => null));
            }

        } catch (err) {
            console.error(err);
            toast.error("حدث خطأ أثناء الحفظ. برجاء حذف الصورة وإضافة صورة ورابط جديدين.");
            setMessage("حدث خطأ أثناء الحفظ. برجاء حذف الصورة وإضافة صورة ورابط جديدين.");
        } finally {
            setLoading(false);
        }
    };



    const renderImageBox = (label, index) => (


        <div className="image-box" key={index}>
            <p>{label}</p>
            {previews[index] ? (
                <div className="preview">
                    <img src={previews[index]} alt={label} />
                    <label className="custom-upload">
                        <input
                            type="text"
                            placeholder="أدخل الرابط"
                            value={links[index] ?? ""}
                            onChange={(e) => handleLinkChange(e, index)}
                        />
                    </label>

                    <button type="button" onClick={() => handleRemove(index)}>
                        حذف
                    </button>
                </div>
            ) : (
                <label className="custom-upload">
                    اختر {label}
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleImageChange(e, index)}
                    />
                </label>
            )}
        </div>
    );

    return (
        <>
            <ToastContainer toastClassName="custom-toast" position="top-right" autoClose={3000} />
            <div className="albums">
                <h2>تعديل عارض الصور</h2>
                <form onSubmit={handleSubmit} className="albums-form">
                    {["صورة المتجر", "صورة العروض", "صورة الأصناف", "صورة الأكثر مبيعاً"].map((label, i) =>
                        renderImageBox(label, i)
                    )}
                    <button type="submit" disabled={loading}>
                        {loading ? "جاري الحفظ..." : "حفظ"}
                    </button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </>
    );
};

export default AddAlbum;
