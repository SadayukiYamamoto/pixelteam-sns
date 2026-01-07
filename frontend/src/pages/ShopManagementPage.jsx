import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import "./ShopManagementPage.css";

const ShopManagementPage = () => {
    const [shopsData, setShopsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/analytics/shops/', {
                headers: { Authorization: `Token ${token}` }
            });
            setShopsData(res.data);
            if (res.data.length > 0) {
                setActiveTab(0);
            }
        } catch (error) {
            console.error("Error fetching shop analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const currentShop = shopsData.length > 0 ? shopsData[activeTab] : null;

    return (
        <div className="shop-mgmt-container">
            <Header />
            <div className="shop-mgmt-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-page-content"
                >
                    <header className="shop-mgmt-header">
                        <h1>店舗管理レポート</h1>
                        <p>各店舗の週間レポート提出状況とノウハウ共有状況を確認できます。</p>
                    </header>

                    {loading ? (
                        <div className="p-16 text-center text-gray-400 font-bold">読み込み中...</div>
                    ) : shopsData.length === 0 ? (
                        <div className="p-16 text-center text-gray-400 font-bold">店舗データがありません</div>
                    ) : (
                        <>
                            {/* 店舗タブ */}
                            <div className="shop-tabs-container">
                                {shopsData.map((shop, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTab(index)}
                                        className={`shop-tab-btn ${activeTab === index ? 'active' : ''}`}
                                    >
                                        {shop.shop_name}
                                    </button>
                                ))}
                            </div>

                            {currentShop && (
                                <div className="report-card">
                                    <div className="report-card-header">
                                        <h2 className="report-shop-title">
                                            <span className="title-indicator"></span>
                                            {currentShop.shop_name} の活動状況
                                        </h2>
                                        <span className="report-period-text">過去8週間のデータ</span>
                                    </div>

                                    <div className="report-table-wrapper">
                                        <table className="report-table">
                                            <thead>
                                                <tr>
                                                    <th className="w-[180px]">対象期間</th>
                                                    <th>個人報告 (提出者)</th>
                                                    <th className="w-[320px]">ノウハウ提出 (週1必須)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentShop.weeks.map((week, idx) => (
                                                    <tr key={idx}>
                                                        <td>
                                                            <div className="cell-period">
                                                                <span className="period-label">{week.label}</span>
                                                                <span className="week-label">Week {8 - idx}</span>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <div className="flex flex-wrap gap-3">
                                                                {week.personal_reports.length > 0 ? (
                                                                    week.personal_reports.map(rep => (
                                                                        <Link
                                                                            key={rep.id}
                                                                            to={`/posts/${rep.id}`}
                                                                            className="report-item-link"
                                                                        >
                                                                            {rep.user_name}
                                                                            <ExternalLink size={14} className="opacity-50" />
                                                                        </Link>
                                                                    ))
                                                                ) : (
                                                                    <div className="no-report-placeholder">
                                                                        - 提出なし -
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <div className="status-badge-container">
                                                                <div className={`status-icon-box ${week.know_how_submitted ? 'success' : 'error'}`}>
                                                                    {week.know_how_submitted ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                                                </div>
                                                                <div className={`mgmt-status-text ${week.know_how_submitted ? 'success' : 'error'}`}>
                                                                    {week.know_how_submitted ? '提出済み' : '未提出'}
                                                                </div>
                                                            </div>

                                                            {week.know_hows.length > 0 && (
                                                                <div className="submission-detail-card">
                                                                    <div className="submitter-name">{week.know_hows[0].user_name}</div>
                                                                    <Link
                                                                        to={`/treasure/${week.know_hows[0].category}/${week.know_hows[0].id}`}
                                                                        className="submission-title"
                                                                    >
                                                                        {week.know_hows[0].title || "投稿内容を確認"}
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default ShopManagementPage;
