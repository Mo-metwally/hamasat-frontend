import React, { useEffect, useMemo } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import "./DescriptionForm.css";

const DescriptionForm = ({ value = "", onChange, name }) => {
    const customColors = [
        "#4a1e0a", "#4d3930", "#ffa480", "#ff4b00",
        "#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff",
        "#facccc", "#ffebcc", "#ffffcc", "#ccffcc", "#cceeff", "#ebd6ff", "#bbbbbb", "#f06666",
        "#ffc266", "#ffff66", "#66ff66", "#66ffff", "#c2a3ff", "#666666", "#a10000", "#b26b00",
        "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600",
        "#003700", "#002966", "#3d1466"
    ];

    // ✅ خليه ثابت (مش يتبني كل مرة)
    const modules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, false] }, { font: [] }],
            [{ size: [] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
            [{ color: customColors },
            { background: [...customColors, "transparent"] } // ✅ اضفت خيار شفاف
            ],
            [{ align: [] }],
            ["link", "image", "video"],
            ["clean"],
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

    const formats = useMemo(() => [
        "header", "font", "size",
        "bold", "italic", "underline", "strike", "blockquote",
        "list", "indent",
        "color", "background", "align",
        "link", "image", "video",
    ], []);

    const { quill, quillRef } = useQuill({
        modules,
        formats,
        placeholder: "اكتب وصف المنتج هنا...",
        theme: "snow",
    });

    // ✅ Sync external value مع المحرر
    useEffect(() => {
        if (quill && value !== quill.root.innerHTML) {
            if (value) {
                quill.clipboard.dangerouslyPasteHTML(value);
            } else {
                quill.setText("");
            }
        }
    }, [quill, value]);

    // ✅ OnChange handler
    useEffect(() => {
        if (!quill) return;
        const handler = () => {
            if (onChange) {
                onChange({
                    target: {
                        name,
                        value: quill.root.innerHTML || "",
                        type: "quill",
                    },
                });
            }
        };

        quill.on("text-change", handler);
        return () => quill.off("text-change", handler);
    }, [quill, onChange, name]);

    return (
        <div className="decForm">
            <div ref={quillRef} />
        </div>
    );
};

export default DescriptionForm;
