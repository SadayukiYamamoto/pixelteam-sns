import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import axiosClient from "../api/axiosClient";
import { FiClock, FiChevronRight } from "react-icons/fi";
import "./NoticeListPage.css";

export default function NoticeListPage() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/notices/");
            // 日付順にソート (新しい順)
            const sorted = (res.data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setNotices(sorted);
        } catch (err) {
            console.error("お知らせ一覧取得エラー:", err);
        } finally {
            setLoading(false);
        }
    };

    const getTagClass = (category) => {
        switch (category) {
            case "new": return "tag-new";
            case "event": return "tag-event";
            case "update": return "tag-update";
            case "important": return "tag-important";
            case "事務局だより": return "tag-事務局だより";
            default: return "tag-default";
        }
    };

    return (
        <div className="home-container">
            <div className="home-wrapper">
                <Header title="お知らせ" />

                <div
                    className="overflow-y-auto pb-32"
                    style={{
                        height: "calc(100vh - 120px)",
                        paddingTop: 'calc(80px + env(safe-area-inset-top, 0px))'
                    }}
                >
                    <main className="notice-list-container">
                        <div className="notice-list-header">
                            <h1 className="notice-list-title">お知らせ一覧</h1>
                            <p className="notice-list-subtitle">Important Updates</p>
                        </div>

                        {loading ? (
                            <div className="loading-container">
                                <div className="notice-spinner"></div>
                                <p>読み込み中...</p>
                            </div>
                        ) : notices.length > 0 ? (
                            <div className="notice-items-wrapper">
                                {notices.map((notice) => (
                                    <div
                                        key={notice.id}
                                        className="notice-item-card"
                                        onClick={() => navigate(`/notice/${notice.id}`)}
                                    >
                                        {notice.image_url && (
                                            <div className="notice-card-img-wrapper">
                                                <img src={notice.image_url} alt="" className="notice-card-img" />
                                            </div>
                                        )}
                                        <div className="notice-card-content">
                                            <div className="notice-card-meta">
                                                <span className="notice-card-date">
                                                    <FiClock />
                                                    {notice.created_at ? notice.created_at.slice(0, 10) : "----/--/--"}
                                                </span>
                                                {notice.category && (
                                                    <span className={`notice-card-tag ${getTagClass(notice.category)}`}>
                                                        {notice.category}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-start justify-between">
                                                <h3 className="notice-card-title">{notice.title}</h3>
                                                <FiChevronRight className="notice-item-arrow" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="loading-container">
                                <p>現在、お知らせはありません。</p>
                            </div>
                        )}
                    </main>
                </div>

                <Navigation activeTab="home" />
            </div>
        </div>
    );
}
