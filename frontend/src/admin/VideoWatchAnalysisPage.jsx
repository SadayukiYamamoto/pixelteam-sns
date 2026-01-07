import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiPlay } from 'react-icons/fi';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import "../admin/AdminCommon.css";

const VideoWatchAnalysisPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        user_id: '',
        video_title: '',
        start_date: '',
        end_date: ''
    });
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.user_id) params.append('user_id', filters.user_id);
            if (filters.video_title) params.append('video_title', filters.video_title);
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);

            const res = await axios.get(`/api/videos/view_logs/?${params.toString()}`);
            setLogs(res.data);
            setExpandedGroups({}); // Reset expanded state on new search
        } catch (error) {
            console.error("Error fetching logs:", error);
            alert("ログの取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    const groupedLogs = React.useMemo(() => {
        const groups = {};
        logs.forEach(log => {
            const title = log.video_title || "不明な動画";
            if (!groups[title]) {
                groups[title] = {
                    title,
                    totalWatchTime: 0,
                    logs: [],
                    minDate: new Date(log.last_watched_at),
                    maxDate: new Date(log.last_watched_at)
                };
            }
            const group = groups[title];
            group.totalWatchTime += log.watch_time;
            group.logs.push(log);

            const logDate = new Date(log.last_watched_at);
            if (logDate < group.minDate) group.minDate = logDate;
            if (logDate > group.maxDate) group.maxDate = logDate;
        });

        return Object.values(groups).sort((a, b) => b.totalWatchTime - a.totalWatchTime);
    }, [logs]);

    const toggleGroup = (title) => {
        setExpandedGroups(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const formatDateShort = (date) => {
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });
    };

    return (
        <div className="admin-page-container">
            <Header />
            <div className="admin-wrapper">
                <div className="admin-page-content">
                    <header className="admin-page-header">
                        <h1>動画視聴ログ詳細</h1>
                        <p>誰がいつ、どの動画をどのくらい視聴したかを確認できます。</p>
                    </header>

                    {/* フィルター */}
                    <div className="premium-card mb-10 p-10" style={{ borderRadius: '40px' }}>
                        <form onSubmit={handleSearch} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">ユーザーID</label>
                                    <input
                                        type="text"
                                        placeholder="User ID"
                                        className="w-full px-6 py-4 rounded-[20px] outline-none transition-all bg-gray-50/50 focus:bg-white text-sm shadow-inner border-none"
                                        value={filters.user_id}
                                        onChange={e => setFilters({ ...filters, user_id: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">動画タイトル</label>
                                    <input
                                        type="text"
                                        placeholder="動画タイトル"
                                        className="w-full px-6 py-4 rounded-[20px] outline-none transition-all bg-gray-50/50 focus:bg-white text-sm shadow-inner border-none"
                                        value={filters.video_title}
                                        onChange={e => setFilters({ ...filters, video_title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">開始日</label>
                                        <input
                                            type="date"
                                            className="w-full px-6 py-4 rounded-[20px] outline-none transition-all bg-gray-50/50 focus:bg-white text-sm shadow-inner border-none"
                                            value={filters.start_date}
                                            onChange={e => setFilters({ ...filters, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">終了日</label>
                                        <input
                                            type="date"
                                            className="w-full px-6 py-4 rounded-[20px] outline-none transition-all bg-gray-50/50 focus:bg-white text-sm shadow-inner border-none"
                                            value={filters.end_date}
                                            onChange={e => setFilters({ ...filters, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-accent hover:bg-lime-500 text-white font-black rounded-[24px] shadow-lg shadow-lime-200/50 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm border-none"
                            >
                                <FiSearch size={20} /> 検索
                            </button>
                        </form>
                    </div>

                    {/* 集計済みテーブル */}
                    <div className="premium-card" style={{ borderRadius: '40px' }}>
                        <div className="p-8 px-10 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                            <span className="text-[13px] font-black text-gray-400 uppercase tracking-widest">
                                集計済データ: <span className="text-accent text-lg mx-1">{groupedLogs.length}</span> 動画
                            </span>
                            <div className="text-[12px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                合計視聴時間:
                                <span className="font-black text-white ml-1 bg-[#475569] px-4 py-1.5 rounded-full shadow-lg">
                                    {formatTime(groupedLogs.reduce((acc, g) => acc + g.totalWatchTime, 0))}
                                </span>
                            </div>
                        </div>
                        <div className="premium-table-container">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th className="p-6 pl-10 font-bold text-[11px] text-gray-400 uppercase tracking-widest border-none">動画タイトル</th>
                                        <th className="p-6 font-bold text-[11px] text-gray-400 uppercase tracking-widest border-none">合計視聴時間</th>
                                        <th className="p-6 font-bold text-[11px] text-gray-400 uppercase tracking-widest border-none">期間 (最初 - 最新)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedLogs.map(group => (
                                        <React.Fragment key={group.title}>
                                            <tr
                                                className="hover:bg-gray-50/50 transition-all cursor-pointer border-b border-gray-50 last:border-none"
                                                onClick={() => toggleGroup(group.title)}
                                            >
                                                <td className="p-6 pl-10 font-bold text-gray-700 flex items-center gap-3">
                                                    <FiPlay
                                                        size={14}
                                                        className={`text-accent fill-accent transition-transform duration-300 ${expandedGroups[group.title] ? 'rotate-90' : ''}`}
                                                    />
                                                    <span className="text-sm font-black">{group.title}</span>
                                                </td>
                                                <td className="p-6 text-gray-800 font-black text-sm">
                                                    {formatTime(group.totalWatchTime)}
                                                </td>
                                                <td className="p-6 text-gray-400 text-[11px] font-bold tracking-tight">
                                                    {formatDateShort(group.minDate)} - {formatDateShort(group.maxDate)}
                                                </td>
                                            </tr>
                                            {expandedGroups[group.title] && group.logs.map((log, idx) => (
                                                <tr key={idx} className="bg-gray-50/50 hover:bg-white transition-colors border-b border-gray-100 last:border-none group">
                                                    <td className="p-4 pl-16 text-[12px] text-gray-500 font-bold flex items-center gap-3">
                                                        <span className="text-gray-300">└</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-400 text-[10px] uppercase font-black">User ID</span>
                                                            <span className="group-hover:text-accent transition-colors">{log.user}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-600 font-black text-[12px]">
                                                        {formatTime(log.watch_time)}
                                                    </td>
                                                    <td className="p-4 text-gray-400 font-bold text-[11px]">
                                                        {new Date(log.last_watched_at).toLocaleString('ja-JP')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                    {groupedLogs.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="3" className="p-32 text-center text-gray-300 font-black uppercase tracking-widest">
                                                No logs found
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

export default VideoWatchAnalysisPage;
