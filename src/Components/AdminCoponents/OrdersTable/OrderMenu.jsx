// src/components/OrderMenu.jsx
import React from "react";
import { useState } from "react";
import { SlOptions } from "react-icons/sl";

import { Menu, MenuItem, IconButton } from "@mui/material";

const OrderMenu = ({ order, handleChangeStatus, pageStatus }) => {

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (status) => {
        handleChangeStatus(status); // <<< هنا لازم ننده على handleChangeStatus بس
        handleClose();
    };


    const actions = [
        {
            status: "delayed",
            label: "تعليق",
            color: "rgb(44, 0, 33)",
            hoverBg: "rgba(205, 50, 166, 0.555)",
            prevent: ["processed", "shipped", "delivered", "canceled", "returned"], // لا يظهر إذا الطلب بالفعل في أي من هذه الحالات
        },
        {
            status: "processed",
            label: "نقل الي التنفيذ",
            color: "#856404",
            hoverBg: "#fff3cd",
            prevent: ["processed", "shipped", "delivered", "canceled", "returned"], // لا يظهر إذا الطلب بالفعل في أي من هذه الحالات
        },
        {
            status: "shipped",
            label: "نقل الي الشحن",
            color: "#152a57",
            hoverBg: "#d4dfed",
            prevent: ["shipped", "delivered", "canceled", "returned"], // لا يظهر إذا الطلب بالفعل مشحون أو مستلم أو ملغى
        },
        {
            status: "delivered",
            label: "نقل الي التسليم",
            color: "#155724",
            hoverBg: "#d4edda",
            prevent: ["delivered", "canceled", "returned"], // لا يظهر إذا الطلب مستلم أو ملغى
        },
        {
            status: "returned",
            label: "نقل الي الإرجاع",
            color: "#441116",
            hoverBg: "#f8d7da",
            prevent: ["returned", "canceled"], // لا يظهر إذا الطلب بالفعل تم إرجاعه أو ملغى
        },
        {
            status: "canceled",
            label: "تم الإلغاء",
            color: "#FF0000",
            hoverBg: "#f8d7da",
            prevent: ["delivered"], // لا يظهر إذا الطلب ملغى أو مستلم
        },
    ];


    return (
        <div className="OrderOptions">
            <IconButton onClick={handleClick}>
                <SlOptions title="خيارات" size={20} style={{ color: '#4a1e0a' }} />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        minWidth: 160,
                        borderRadius: 12,
                        background: '#FFEAE2',
                        boxShadow: '2px 2px 7px rgba(0, 0, 0, 0.4)'
                    },
                }}
            >
                {actions.map((action) => {
                    // منع ظهور الاكشن لو موجود في prevent أو الشرط الخاص بـ "معلق"
                    const shouldPrevent =
                        action.prevent.includes(order.status) ||
                        (action.status === "delayed" && order.adminNoteTwo === "معلق");

                    return !shouldPrevent ? (
                        <MenuItem
                            key={action.status}
                            onClick={() => {
                                const confirmed = window.confirm(
                                    `هل أنت متأكد أنك تريد نقل هذا الطلب إلى ${action.label}?`
                                );
                                if (confirmed) handleAction(action.status);
                            }}
                            sx={{
                                color: action.color,
                                fontWeight: "bold",
                                "&:hover": { backgroundColor: action.hoverBg },
                            }}
                        >
                            {action.label}
                        </MenuItem>
                    ) : null;
                })}
            </Menu>

        </div>
    );
};




export default OrderMenu;
