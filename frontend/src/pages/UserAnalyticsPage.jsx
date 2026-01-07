import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import "./UserAnalyticsPage.css";

const UserAnalyticsPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'post_count', direction: 'desc' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/analytics/users/', {
                headers: { Authorization: `Token ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const SortIcon = ({ columnKey }) => {
        const isActive = sortConfig.key === columnKey;
        return (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleSort(columnKey);
                }}
                className={`sort-trigger-btn ${isActive ? 'active' : ''}`}
            >
                <ArrowUpDown size={12} />
            </button>
        );
    };

    return (
        <div className="user-analytics-container">
            <Header />
            <div className="user-analytics-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-page-content"
                >
                    <header className="user-analytics-header">
                        <div>
                            <h1>ユーザー別統計</h1>
                            <p>ユーザーごとの投稿数やテスト結果などのアクティビティを確認できます。</p>
                        </div>
                        <div className="analytics-summary-text">
                            該当ユーザー: <span className="text-accent">{users.length}</span> 名
                        </div>
                    </header>

                    <div className="analytics-card">
                        <div className="analytics-table-wrapper">
                            <table className="analytics-table">
                                <thead>
                                    <tr>
                                        <th className="w-[280px]">ユーザー情報</th>
                                        <th className="w-[220px]">店舗</th>
                                        <th className="text-center w-[120px]">
                                            <div className="flex items-center justify-center">
                                                投稿数 <SortIcon columnKey="post_count" />
                                            </div>
                                        </th>
                                        <th className="text-center w-[120px]">
                                            <div className="flex items-center justify-center">
                                                動画視聴 <SortIcon columnKey="video_views" />
                                            </div>
                                        </th>
                                        <th className="text-center w-[150px]">
                                            <div className="flex items-center justify-center">
                                                視聴時間 <SortIcon columnKey="watch_time" />
                                            </div>
                                        </th>
                                        <th className="text-center w-[120px]">
                                            <div className="flex items-center justify-center">
                                                テスト受講 <SortIcon columnKey="tests_taken" />
                                            </div>
                                        </th>
                                        <th className="text-center w-[120px]">
                                            <div className="flex items-center justify-center">
                                                合格数 <SortIcon columnKey="tests_passed" />
                                            </div>
                                        </th>
                                        <th className="text-center w-[120px]">
                                            <div className="flex items-center justify-center">
                                                ノウハウ <SortIcon columnKey="know_how_count" />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="p-20 text-center font-bold text-gray-400">読み込み中...</td>
                                        </tr>
                                    ) : sortedUsers.length > 0 ? (
                                        sortedUsers.map((u, index) => (
                                            <tr key={u.user_id}>
                                                <td>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`rank-badge ${index < 3 ? 'top-3' : 'others'}`}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <div className="user-name-cell">{u.display_name}</div>
                                                            <div className="user-id-cell">{u.user_id?.substring(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {u.shop_name ? (
                                                        <span className="shop-badge">
                                                            {u.shop_name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 ml-1">-</span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <span className={`stat-value ${u.post_count === 0 ? 'zero' : ''}`}>
                                                        {u.post_count}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`stat-value ${u.video_views === 0 ? 'zero' : ''}`}>
                                                        {u.video_views}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <div className={`watch-time-cell ${u.watch_time === 0 ? 'text-gray-200' : ''}`}>
                                                        {Math.floor(u.watch_time / 60)}分
                                                        <span className="watch-time-seconds">{u.watch_time % 60}秒</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`stat-value ${u.tests_taken === 0 ? 'zero' : ''}`}>
                                                        {u.tests_taken}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`stat-value ${u.tests_passed === 0 ? 'zero' : 'highlight-green'}`}>
                                                        {u.tests_passed}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`stat-value ${u.know_how_count === 0 ? 'zero' : 'highlight-blue'}`}>
                                                        {u.know_how_count}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="p-32 text-center text-gray-400 font-bold">
                                                データが見つかりませんでした
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default UserAnalyticsPage;
