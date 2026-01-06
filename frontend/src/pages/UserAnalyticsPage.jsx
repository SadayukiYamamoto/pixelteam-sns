import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { ArrowUpDown } from 'lucide-react';

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
            alert("データの取得に失敗しました");
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
        return (
            <button
                onClick={() => handleSort(columnKey)}
                className={`ml-1 inline-flex items-center justify-center w-6 h-6 rounded-md transition-all shadow-sm bg-white hover:shadow-md active:scale-95 border-none`}
            >
                <ArrowUpDown size={12} className={sortConfig.key === columnKey ? "text-[#84cc16]" : "text-gray-400"} />
            </button>
        );
    };

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header />
                <div className="max-w-7xl mx-auto p-4 md:p-10">

                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">ユーザー別統計</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                ユーザーごとの投稿数やテスト結果などのアクティビティを確認できます。
                            </p>
                        </div>
                        <div className="text-sm text-gray-500">
                            該当ユーザー: <span className="font-bold text-gray-800">{users.length}</span> 名
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] shadow-lg border-none overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                        <th className="p-4 sticky left-0 bg-gray-50 z-10 w-48 font-semibold shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">ユーザー情報</th>
                                        <th className="p-4 font-semibold w-32">店舗</th>
                                        <th className="p-4 text-center font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('post_count')}>
                                            <div className="flex items-center justify-center gap-1">投稿数 <SortIcon columnKey="post_count" /></div>
                                        </th>
                                        <th className="p-4 text-center font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('video_views')}>
                                            <div className="flex items-center justify-center gap-1">動画視聴 <SortIcon columnKey="video_views" /></div>
                                        </th>
                                        <th className="p-4 text-center font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('watch_time')}>
                                            <div className="flex items-center justify-center gap-1">視聴時間 <SortIcon columnKey="watch_time" /></div>
                                        </th>
                                        <th className="p-4 text-center font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('tests_taken')}>
                                            <div className="flex items-center justify-center gap-1">テスト受講 <SortIcon columnKey="tests_taken" /></div>
                                        </th>
                                        <th className="p-4 text-center font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('tests_passed')}>
                                            <div className="flex items-center justify-center gap-1">合格数 <SortIcon columnKey="tests_passed" /></div>
                                        </th>
                                        <th className="p-4 text-center font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('know_how_count')}>
                                            <div className="flex items-center justify-center gap-1">ノウハウ <SortIcon columnKey="know_how_count" /></div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sortedUsers.map((u, index) => (
                                        <tr key={u.user_id} className="hover:bg-blue-50/20 transition-colors text-sm group">
                                            <td className="p-4 font-medium sticky left-0 bg-white group-hover:bg-blue-50/20 transition-colors z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] border-r border-transparent group-hover:border-blue-100">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-900 font-bold">{u.display_name}</div>
                                                        <div className="text-xs text-gray-400 font-mono">{u.user_id.substring(0, 6)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {u.shop_name ? (
                                                    <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-medium">
                                                        {u.shop_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center font-medium font-mono text-base">{u.post_count}</td>
                                            <td className="p-4 text-center font-medium font-mono text-base">{u.video_views}</td>
                                            <td className="p-4 text-center text-gray-500 font-mono text-sm">
                                                {Math.floor(u.watch_time / 60)}分
                                                <span className="text-xs text-gray-300 ml-1">{u.watch_time % 60}秒</span>
                                            </td>
                                            <td className="p-4 text-center font-medium font-mono text-base">{u.tests_taken}</td>
                                            <td className="p-4 text-center">
                                                <span className={`font-bold font-mono text-base ${u.tests_passed > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                                                    {u.tests_passed}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`font-bold font-mono text-base ${u.know_how_count > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                                                    {u.know_how_count}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {sortedUsers.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="8" className="p-16 text-center text-gray-400">
                                                データがありません
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default UserAnalyticsPage;
