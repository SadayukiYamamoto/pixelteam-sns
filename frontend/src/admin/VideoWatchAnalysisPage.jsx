import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';

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

    // 秒数を "mm:ss" 形式などに変換
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    // ログを動画ごとにグループ化
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

        // 視聴時間の長い順にソート
        return Object.values(groups).sort((a, b) => b.totalWatchTime - a.totalWatchTime);
    }, [logs]);

    const toggleGroup = (title) => {
        setExpandedGroups(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const formatDateShort = (date) => {
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header title="視聴データ分析" />
                <div className="max-w-7xl mx-auto p-4 md:p-10">

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">動画視聴ログ詳細</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            誰がいつ、どの動画をどのくらい視聴したかを確認できます。
                        </p>
                    </div>

                    {/* フィルター */}
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 mb-8">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6 items-end flex-wrap">

                            <div className="w-full md:w-48">
                                <label className="block text-xs font-black text-gray-400 mb-1.5 ml-1 uppercase tracking-widest">ユーザーID</label>
                                <input
                                    type="text"
                                    placeholder="User ID"
                                    className="w-full px-4 py-3 rounded-2xl outline-none transition-all bg-gray-50/50 focus:bg-white text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border-none"
                                    value={filters.user_id}
                                    onChange={e => setFilters({ ...filters, user_id: e.target.value })}
                                />
                            </div>

                            <div className="w-full md:w-64">
                                <label className="block text-xs font-black text-gray-400 mb-1.5 ml-1 uppercase tracking-widest">動画タイトル</label>
                                <input
                                    type="text"
                                    placeholder="動画タイトル"
                                    className="w-full px-4 py-3 rounded-2xl outline-none transition-all bg-gray-50/50 focus:bg-white text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border-none"
                                    value={filters.video_title}
                                    onChange={e => setFilters({ ...filters, video_title: e.target.value })}
                                />
                            </div>

                            <div className="w-full md:w-auto flex items-center gap-2">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-1.5 ml-1 uppercase tracking-widest">開始日</label>
                                    <input
                                        type="date"
                                        className="w-[145px] px-3 py-3 rounded-2xl outline-none transition-all bg-gray-50/50 focus:bg-white text-[11px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border-none"
                                        value={filters.start_date}
                                        onChange={e => setFilters({ ...filters, start_date: e.target.value })}
                                    />
                                </div>
                                <span className="text-gray-300 mt-6 text-sm">~</span>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-1.5 ml-1 uppercase tracking-widest">終了日</label>
                                    <input
                                        type="date"
                                        className="w-[145px] px-3 py-3 rounded-2xl outline-none transition-all bg-gray-50/50 focus:bg-white text-[11px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border-none"
                                        value={filters.end_date}
                                        onChange={e => setFilters({ ...filters, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full md:w-auto px-10 py-3.5 bg-[#84cc16] hover:bg-[#a3e635] text-white font-black rounded-2xl shadow-lg shadow-lime-200/50 hover:shadow-xl hover:shadow-lime-300/50 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs border-none"
                            >
                                <Search size={18} /> 検索
                            </button>
                        </form>
                    </div>
                    {/* 集計済みテーブル */}
                    <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 overflow-hidden border-none overflow-hidden mb-12">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                            <span className="text-sm font-black text-gray-600 uppercase tracking-widest">
                                集計済データ: <span className="text-[#84cc16] text-lg">{groupedLogs.length}</span> 動画
                            </span>
                            <div className="text-sm text-gray-500 font-bold">
                                合計視聴時間: <span className="font-mono text-gray-800 ml-1 bg-gray-50 px-3 py-1 rounded-full shadow-inner">
                                    {formatTime(groupedLogs.reduce((acc, g) => acc + g.totalWatchTime, 0))}
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/30 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                                        <th className="p-5 pl-8 font-black w-5/12">動画タイトル</th>
                                        <th className="p-5 font-black w-3/12">合計視聴時間</th>
                                        <th className="p-5 font-black w-4/12">期間 (最初 ~ 最新)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {groupedLogs.map(group => (
                                        <React.Fragment key={group.title}>
                                            {/* 親行 */}
                                            <tr
                                                className="hover:bg-lime-50/30 transition-all cursor-pointer bg-white"
                                                onClick={() => toggleGroup(group.title)}
                                            >
                                                <td className="p-5 pl-8 font-bold text-gray-700 flex items-center gap-3">
                                                    <span className={`transform transition-transform duration-300 text-[#84cc16] ${expandedGroups[group.title] ? 'rotate-90' : ''}`}>
                                                        ▶
                                                    </span>
                                                    {group.title}
                                                </td>
                                                <td className="p-5 text-gray-800 font-black font-mono">
                                                    {formatTime(group.totalWatchTime)}
                                                </td>
                                                <td className="p-5 text-gray-400 text-xs font-mono font-bold tracking-tighter">
                                                    {formatDateShort(group.minDate).split(" ")[0]} - {formatDateShort(group.maxDate).split(" ")[0]}
                                                </td>
                                            </tr>
                                            {/* 子行 (展開時) */}
                                            {expandedGroups[group.title] && group.logs.map((log, idx) => (
                                                <tr key={idx} className="bg-gray-50/50 hover:bg-gray-100/50 transition-colors border-b border-gray-100/30 last:border-0">
                                                    <td className="p-3 pl-14 text-xs text-gray-500 font-bold flex items-center gap-2">
                                                        <span className="text-gray-300">└</span>
                                                        {new Date(log.last_watched_at).toLocaleString()}
                                                    </td>
                                                    <td className="p-3 text-gray-600 font-black text-xs">
                                                        {log.user}
                                                    </td>
                                                    <td className="p-3 text-gray-400 font-mono text-xs">
                                                        {formatTime(log.watch_time)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                    {groupedLogs.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="3" className="p-16 text-center text-gray-400 font-bold">
                                                データが見つかりませんでした
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
