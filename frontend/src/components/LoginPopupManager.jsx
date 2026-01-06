import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import LoginPopup from "./LoginPopup";

const LoginPopupManager = () => {
    const [popupData, setPopupData] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        checkPopup();
    }, []);

    const checkPopup = async () => {
        try {
            const res = await axiosClient.get("user/login-popup/");

            console.log("Popup API response:", res.data); // デバッグ用

            if (res.data.show) {
                setPopupData(res.data);
                setShow(true);
            } else {
                console.log("Popup will not show. Reason:", res.data.reason);
            }
        } catch (err) {
            console.error("LoginPopup error:", err);
        }
    };

    const handleClose = async () => {
        setShow(false);
        try {
            await axiosClient.post("user/login-popup/", {
                popup_id: popupData.popup_id
            });
        } catch (err) {
            console.error("Mark seen error:", err);
        }
    };

    if (!show || !popupData) return null;

    return (
        <LoginPopup
            notice={popupData.notice}
            onClose={handleClose}
        />
    );
};

export default LoginPopupManager;
