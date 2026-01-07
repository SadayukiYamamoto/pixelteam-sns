import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import "./NoticeAdminPage.css";
import { Plus, Trash2 } from "lucide-react";

const NoticeAdminPage = () => {
    const [notices, setNotices] = useState([]);
    const [activeTab, setActiveTab] = useState("admin");
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = {};
            if (token) {
                config.headers = { Authorization: `Token ${token}` };
            }
            const res = await axios.get("/api/notices/", config);
            setNotices(res.data);
        } catch (error) {
            console.error("お知らせ取得エラー", error);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // 行クリックと競合しないように
        if (!window.confirm("本当に削除しますか？")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/notices/${id}/`, {
                headers: { Authorization: `Token ${token}` }
            });
            fetchNotices();
        } catch (error) {
            console.error("削除エラー", error);
            alert("削除に失敗しました");
        }
    };

    return (
        <div className="home-container admin-page-container">
            <div className="admin-wrapper">
                <Header />
                <div className="admin-main-content">
                    <div className="admin-page-header">
                        <h1 className="admin-page-title">お知らせ管理</h1>
                        <Link to="/admin/notice/new" className="create-btn">
                            <Plus size={18} strokeWidth={3} />
                            新規投稿
                        </Link>
                    </div>

                    <div className="notice-items-grid">
                        {notices.map((notice) => (
                            <div
                                key={notice.id}
                                className="notice-admin-card"
                                onClick={() => navigate(`/admin/notice/${notice.id}`)}
                            >
                                <div className="notice-card-left">
                                    {notice.image_url && (
                                        <div className="notice-thumb-box">
                                            <img src={notice.image_url} alt="" />
                                        </div>
                                    )}
                                    <div className="notice-meta-info">
                                        <span className={`notice-category-tag ${notice.category === '事務局' ? 'tag-office' : 'tag-other'}`}>
                                            {notice.category}
                                        </span>
                                        <h3 className="notice-item-title">{notice.title}</h3>
                                        <p className="notice-item-date">{notice.created_at?.slice(0, 10)}</p>
                                    </div>
                                </div>
                                <button
                                    className="delete-action-btn"
                                    onClick={(e) => handleDelete(notice.id, e)}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};


export default NoticeAdminPage;
