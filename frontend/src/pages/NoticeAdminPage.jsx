import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { Link, useNavigate } from "react-router-dom"; // Link, useNavigate 追加

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
        <div className="home-container">
            <div className="home-wrapper">
                <Header />
                <div style={{ padding: "20px", paddingBottom: "100px", flex: 1, overflowY: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>お知らせ管理</h2>
                        <Link
                            to="/admin/notice/new"
                            style={{
                                background: "#4f46e5", color: "white", padding: "8px 16px",
                                borderRadius: "6px", textDecoration: "none", fontWeight: "bold", fontSize: "14px"
                            }}
                        >
                            + 新規投稿
                        </Link>
                    </div>

                    {/* お知らせ一覧 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {notices.map((notice) => (
                            <div
                                key={notice.id}
                                onClick={() => navigate(`/admin/notice/${notice.id}`)}
                                style={{
                                    background: "white", padding: "12px", borderRadius: "8px",
                                    borderLeft: `4px solid ${notice.category === '事務局' ? '#4f46e5' : '#22c55e'}`,
                                    cursor: "pointer", transition: "0.2s",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        {notice.image_url && (
                                            <img src={notice.image_url} alt="" style={{ width: "80px", height: "50px", objectFit: "cover", borderRadius: "4px" }} />
                                        )}
                                        <div>
                                            <span style={{ fontSize: "10px", background: "#eee", padding: "2px 6px", borderRadius: "4px", marginRight: "8px" }}>
                                                {notice.category}
                                            </span>
                                            <span style={{ fontSize: "14px", fontWeight: "bold" }}>{notice.title}</span>
                                            <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                                                {notice.created_at?.slice(0, 10)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(notice.id, e)}
                                        style={{ fontSize: "12px", color: "red", border: "none", background: "none", cursor: "pointer", padding: "4px" }}
                                    >
                                        削除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
                <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        </div>
    );
};

export default NoticeAdminPage;
