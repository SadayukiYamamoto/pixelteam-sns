import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../api/axiosClient";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { FiCheckCircle, FiXCircle, FiPlay, FiSave, FiAlertCircle } from "react-icons/fi";
import LoginPopup from "../components/LoginPopup";
import "./LoginPopupAdminPage.css";

const LoginPopupAdminPage = () => {
    const [currentSetting, setCurrentSetting] = useState(null);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Preview state
    const [previewNotice, setPreviewNotice] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axiosClient.get("admin/login-popup/");
            setCurrentSetting(res.data.current_setting);
            setNotices(res.data.notices);
        } catch (err) {
            console.error("データの取得に失敗しました", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (noticeId, isActive) => {
        setSaving(true);
        try {
            await axiosClient.post("admin/login-popup/", {
                notice_id: noticeId,
                is_active: isActive
            });
            await fetchData();
            alert("設定を保存しました");
        } catch (err) {
            console.error("保存失敗", err);
            alert("保存に失敗しました");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="home-container">
            <Header title="ログインPOPUP管理" />
            <div className="admin-wrapper flex items-center justify-center h-screen">
                <p className="text-slate-400 font-bold">読み込み中...</p>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );

    return (
        <div className="home-container admin-page-container">
            <div className="admin-wrapper">
                <Header title="ログインPOPUP管理" />
                <div className="admin-main-content">
                    <div className="login-popup-admin-container">
                        <div className="admin-page-header mb-10">
                            <h1 className="admin-page-title">ログインPOPUP設定</h1>
                            <p className="admin-page-subtitle">ユーザーがログインした際に自動で表示される特別な「お知らせ」を設定します。</p>
                        </div>

                        {/* Current Status Card */}
                        <div className="status-card-premium mb-12">
                            <div className="status-header">
                                <span className="status-label">現在のステータス</span>
                                {currentSetting?.is_active ? (
                                    <span className="status-badge active"><FiCheckCircle /> 有効</span>
                                ) : (
                                    <span className="status-badge inactive"><FiXCircle /> 無効</span>
                                )}
                            </div>
                            {currentSetting?.notice_id ? (
                                <div className="current-notice-info">
                                    <p className="label">配信中のお知らせ:</p>
                                    <p className="value">{notices.find(n => n.id === currentSetting.notice_id)?.title || "不明なお知らせ"}</p>
                                </div>
                            ) : (
                                <div className="no-setting-alert">
                                    <FiAlertCircle size={24} />
                                    <p>有効な設定がありません。お知らせを選択してください。</p>
                                </div>
                            )}
                        </div>

                        {/* Notice Selection Grid */}
                        <div className="notice-selection-section">
                            <h2 className="section-title mb-6">配信中のおすすめ投稿（お知らせ）</h2>
                            <div className="notice-admin-grid-custom">
                                {notices.map(notice => (
                                    <div key={notice.id} className={`notice-item-card ${currentSetting?.notice_id === notice.id ? 'is-selected' : ''}`}>
                                        <div className="notice-card-inner">
                                            <div className="notice-image-preview">
                                                {notice.image_url ? (
                                                    <img src={notice.image_url} alt="" />
                                                ) : (
                                                    <div className="notice-image-placeholder">No Image</div>
                                                )}
                                            </div>
                                            <div className="notice-meta">
                                                <span className="notice-tag">{notice.category}</span>
                                                <h3 className="notice-title">{notice.title}</h3>
                                                <p className="notice-date">{new Date(notice.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="notice-card-actions">
                                                <button
                                                    className="action-btn preview-btn"
                                                    onClick={() => setPreviewNotice(notice)}
                                                >
                                                    <FiPlay /> プレビュー
                                                </button>
                                                <button
                                                    className={`action-btn select-btn ${currentSetting?.notice_id === notice.id ? 'active' : ''}`}
                                                    disabled={saving || currentSetting?.notice_id === notice.id}
                                                    onClick={() => handleSave(notice.id, true)}
                                                >
                                                    {currentSetting?.notice_id === notice.id ? (
                                                        <><FiCheckCircle /> 設定済み</>
                                                    ) : (
                                                        <><FiSave /> この投稿をセット</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Disable */}
                        {currentSetting?.is_active && (
                            <div className="quick-actions-footer mt-12 text-center">
                                <button
                                    className="disable-btn-premium"
                                    onClick={() => handleSave(currentSetting.notice_id, false)}
                                    disabled={saving}
                                >
                                    <FiXCircle /> 今回のPOPUPを停止する
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation (Fixed Bottom) */}
            <Navigation activeTab="mypage" />

            {/* Render Actual LoginPopup as Preview */}
            <AnimatePresence>
                {previewNotice && (
                    <LoginPopup notice={previewNotice} onClose={() => setPreviewNotice(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoginPopupAdminPage;
