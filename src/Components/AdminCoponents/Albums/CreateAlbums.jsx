import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Albums.scss";
import { toast, ToastContainer } from "react-toastify";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/albums`;
const CREATE_URL = `${process.env.REACT_APP_API_URL}/api/v1/albums`;

const CreateAlbum = () => {
    const [previews, setPreviews] = useState([]);
    const [files, setFiles] = useState([]);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [formPreview, setFormPreview] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await axios.get(API_URL, { withCredentials: true });

                if (res.data.success) {
                    const images = res.data.data.images;

                    if (images.length > 0) {
                        // ✅ لو في صور، نحطها في الـ states
                        setPreviews(images.map(i => i.image));
                        setLinks(images.map(i => i.link ?? ""));
                        setFiles(images.map(() => null));
                    }

                    // ✅ في الحالتين (صور أو فاضي) نروح على /admin/addalbum
                    navigate("/admin/addalbum");
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchAlbum();
    }, [navigate]);


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

    const updateFormPreview = () => {
        const dataPreview = previews.map((p, i) => ({
            image: p.startsWith("blob:") ? `File selected: ${p}` : p,
            link: links[i] || "",
        }));
        setFormPreview(dataPreview);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const hasFiles = files.some(f => f);

            if (hasFiles) {
                const formData = new FormData();

                files.forEach(f => {
                    if (f) formData.append("images", f);
                });

                links.forEach((link, i) => formData.append(`links[${i}]`, link || ""));

                await axios.post(CREATE_URL, formData, {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                const payload = {
                    images: [],
                    links: links.map(l => l || "")
                };

                await axios.post(CREATE_URL, payload, {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });
            }

            setMessage("تم الإضافة بنجاح");
            toast.success("تم الإضافة بنجاح");
            updateFormPreview();

            // إعادة توجيه بعد الحفظ
            navigate("/admin/addalbum");

        } catch (err) {
            setMessage("حدث خطأ أثناء الإضافة" || err.response?.data?.message);
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
                    <input
                        type="text"
                        placeholder="أدخل الرابط"
                        value={links[index] ?? ""}
                        onChange={(e) => handleLinkChange(e, index)}
                    />
                    <label className="custom-upload">
                        اختر صورة جديدة
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handleImageChange(e, index)}
                        />
                    </label>
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
                <h2>إضافة صور للألبوم</h2>
                <form onSubmit={handleSubmit} className="albums-form">
                    {["صورة المتجر", "صورة العروض", "صورة الأصناف", "صورة الأكثر مبيعاً"].map((label, i) =>
                        renderImageBox(label, i)
                    )}
                    <button type="submit" disabled={loading}>
                        {loading ? "جاري الحفظ..." : "حفظ"}
                    </button>
                </form>

                {formPreview.length > 0 && (
                    <div className="form-preview">
                        <h3>معاينة البيانات قبل الإرسال:</h3>
                        <ul>
                            {formPreview.map((item, i) => (
                                <li key={i}>
                                    <strong>صورة:</strong> {item.image} | <strong>Link:</strong> {item.link}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {message && <p>{message}</p>}
            </div>
        </>
    );
};

export default CreateAlbum;
