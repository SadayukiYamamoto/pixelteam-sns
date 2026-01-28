import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import axiosClient from "../api/axiosClient";
import { FiArrowRight, FiInfo } from "react-icons/fi";
import "./PastSecretariatNewsPage.css";

import PullToRefresh from "../components/PullToRefresh";

export default function PastSecretariatNewsPage() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSecretariatNews();
    }, []);

    const fetchSecretariatNews = async () => {
        try {
            setLoading(true);
            // お知らせ（Notice）から事務局だよりカテゴリーのみ取得
            const res = await axiosClient.get("/notices/");
            const filtered = (res.data || [])
                .filter(n => n.category === "事務局だより")
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setNotices(filtered);
        } catch (err) {
            console.error("事務局だより取得エラー:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        await fetchSecretariatNews();
    };

    const handleCardClick = (notice) => {
        if (notice.external_url) {
            window.open(notice.external_url, "_blank");
        } else {
            navigate(`/notice/${notice.id}`);
        }
    };

    return (
        <div className="home-container">
            <div className="home-wrapper">
                <Header title="過去の事務局だより" />

                <PullToRefresh onRefresh={handleRefresh} className="news-page-content pb-32 overflow-y-auto" style={{ paddingTop: 'calc(112px + env(safe-area-inset-top, 0px))' }}>
                    <div className="news-page-header">
                        <h2 className="news-page-title">Archives</h2>
                        <p className="news-page-subtitle">過去の事務局だより一覧</p>
                    </div>

                    {loading ? (
                        <div className="news-loading">
                            <div className="news-spinner"></div>
                            <p>読み込み中...</p>
                        </div>
                    ) : notices.length > 0 ? (
                        <div className="news-grid">
                            {notices.map((notice) => (
                                <div
                                    key={notice.id}
                                    className="news-modern-card"
                                    onClick={() => handleCardClick(notice)}
                                >
                                    <div className="news-card-thumb">
                                        {notice.image_url ? (
                                            <img src={notice.image_url} alt="" />
                                        ) : (
                                            <div className="news-thumb-placeholder">
                                                <FiInfo size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="news-card-body">
                                        <span className="news-card-category">{notice.category}</span>
                                        <h3 className="news-card-title">{notice.title}</h3>

                                        {notice.summary_points ? (
                                            <ul className="news-card-bullets">
                                                {notice.summary_points.split('\n').filter(p => p.trim()).slice(0, 3).map((point, i) => (
                                                    <li key={i}>{point}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="news-card-desc">
                                                詳細はタップしてご確認ください。
                                            </p>
                                        )}

                                        <div className="news-card-footer">
                                            <span className="news-card-author">By {notice.admin_name || "事務局"}</span>
                                            <FiArrowRight className="news-arrow-icon" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="news-empty">
                            <p>過去の事務局だよりはありません。</p>
                        </div>
                    )}
                </PullToRefresh>


                <Navigation activeTab="home" />
            </div>
        </div>
    );
}
