import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, ChevronRight, ChevronDown, MousePointer2 } from 'lucide-react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';

const AdminInteractionAnalysisPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        user_id: '',
        category: '',
        team: '',
        start_date: '',
        end_date: ''
    });
    const [expandedTeams, setExpandedTeams] = useState({});
    const [expandedUsers, setExpandedUsers] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.user_id) params.append('user_id', filters.user_id);
            if (filters.category) params.append('category', filters.category);
            if (filters.team) params.append('team', filters.team);
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);

            const res = await axios.get(`/api/admin/interaction-logs/?${params.toString()}`, {
                headers: { Authorization: `Token ${token}` }
            });
            setLogs(res.data);
            setExpandedTeams({});
            setExpandedUsers({});
            setExpandedCategories({});
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

    // 階層データ作成: Team -> User -> Category -> Items
    const groupedData = useMemo(() => {
        const teamGroups = {};
        logs.forEach(log => {
            const teamName = log.team || "未設定";
            const userKey = log.user_id;
            const userName = log.display_name || log.user_id;

            if (!teamGroups[teamName]) {
                teamGroups[teamName] = { name: teamName, users: {}, totalCount: 0 };
            }
            const team = teamGroups[teamName];
            team.totalCount += 1;

            if (!team.users[userKey]) {
                team.users[userKey] = { id: userKey, name: userName, categories: {}, totalCount: 0 };
            }
            const user = team.users[userKey];
            user.totalCount += 1;

            const categoryName = log.category;
            if (!user.categories[categoryName]) {
                user.categories[categoryName] = { name: categoryName, items: {}, totalCount: 0 };
            }
            const category = user.categories[categoryName];
            category.totalCount += 1;

            const itemKey = log.item_id || "none";
            if (!category.items[itemKey]) {
                category.items[itemKey] = { title: log.item_title || "不明", count: 0, lastAt: log.created_at };
            }
            const item = category.items[itemKey];
            item.count += 1;
            if (new Date(log.created_at) > new Date(item.lastAt)) {
                item.lastAt = log.created_at;
            }
        });

        // オブジェクトを配列に変換してソート
        return Object.values(teamGroups).sort((a, b) => b.totalCount - a.totalCount);
    }, [logs]);

    const toggleTeam = (name) => {
        setExpandedTeams(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const toggleUser = (id) => {
        setExpandedUsers(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleCategory = (userId, categoryName) => {
        const key = `${userId}-${categoryName}`;
        setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getCategoryLabel = (cat) => {
        const labels = {
            post: '投稿',
            video: '動画',
            knowhow: 'ノウハウ',
            task: '業務',
            news: '事務局だより',
            mission: 'ミッション'
        };
        return labels[cat] || cat;
    };

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header title="操作・インタラクション分析" />
                <div className="max-w-6xl mx-auto p-4 md:p-10">

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <MousePointer2 className="text-[#84cc16]" />
                            インタラクション分析
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            どのチームの誰が、何のコンテンツを何回クリックしたかを確認できます。
                        </p>
                    </div>

                    {/* フィルター */}
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 mb-8 overflow-visible">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">チーム</label>
                                <select
                                    className="w-full px-4 py-3 rounded-2xl outline-none transition-all bg-gray-50/50 focus:bg-white text-sm border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                                    value={filters.team}
                                    onChange={e => setFilters({ ...filters, team: e.target.value })}
                                >
                                    <option value="">全て</option>
                                    <option value="shop">Pixel-Shop</option>
                                    <option value="event">Pixel-Event</option>
                                    <option value="training">Pixel-Training</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">カテゴリー</label>
                                <select
                                    className="w-full px-4 py-3 rounded-2xl outline-none transition-all bg-gray-50/50 focus:bg-white text-sm border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                                    value={filters.category}
                                    onChange={e => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="">全て</option>
                                    <option value="post">投稿</option>
                                    <option value="video">動画</option>
                                    <option value="knowhow">ノウハウ</option>
                                    <option value="task">業務</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">ユーザーID</label>
                                <input
                                    type="text"
                                    placeholder="User ID"
                                    className="w-full px-4 py-3 rounded-2xl outline-none transition-all bg-gray-50/50 focus:bg-white text-sm border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_0_0_2px_rgba(132,204,22,0.1)]"
                                    value={filters.user_id}
                                    onChange={e => setFilters({ ...filters, user_id: e.target.value })}
                                />
                            </div>
                            <div className="lg:col-span-1 space-y-1.5">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">期間指定</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="date"
                                        className="flex-1 px-3 py-3 rounded-2xl outline-none transition-all bg-gray-50/50 focus:bg-white text-[11px] border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                                        value={filters.start_date}
                                        onChange={e => setFilters({ ...filters, start_date: e.target.value })}
                                    />
                                    <span className="text-gray-300">~</span>
                                    <input
                                        type="date"
                                        className="flex-1 px-3 py-3 rounded-2xl outline-none transition-all bg-gray-50/50 focus:bg-white text-[11px] border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
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

                    {/* データ表示 */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border-none backdrop-blur-xl">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white/30">
                            <span className="text-sm font-black text-gray-600 tracking-tight">
                                総計: <span className="text-[#84cc16] text-lg">{logs.length}</span> インタラクション
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                        <th className="p-4 pl-6 font-black w-1/2">対象・項目</th>
                                        <th className="p-4 font-black w-1/4">クリック数</th>
                                        <th className="p-4 font-black w-1/4">最終ログ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedData.map(team => (
                                        <React.Fragment key={team.name}>
                                            {/* チーム行 */}
                                            <tr
                                                className="bg-gray-50/30 hover:bg-blue-50/50 cursor-pointer transition-all duration-300"
                                                onClick={() => toggleTeam(team.name)}
                                            >
                                                <td className="p-5 pl-6 font-black text-gray-800 flex items-center gap-3">
                                                    <div className={`p-1 rounded-lg transition-colors ${expandedTeams[team.name] ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        {expandedTeams[team.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    </div>
                                                    <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">Team</span>
                                                    <span className="text-sm">{team.name}</span>
                                                </td>
                                                <td className="p-5">
                                                    <span className="bg-blue-600 text-white text-[11px] font-black px-2 py-1 rounded-full shadow-md">
                                                        {team.totalCount}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-gray-300 text-[10px] font-black">-</td>
                                            </tr>

                                            {/* ユーザー展開 */}
                                            {expandedTeams[team.name] && Object.values(team.users).map(user => (
                                                <React.Fragment key={user.id}>
                                                    <tr
                                                        className="bg-white/40 hover:bg-emerald-50/50 cursor-pointer transition-all border-l-4 border-transparent hover:border-emerald-400"
                                                        onClick={() => toggleUser(user.id)}
                                                    >
                                                        <td className="p-4 pl-14 font-bold text-gray-700 flex items-center gap-3">
                                                            <div className={`p-1 rounded-lg transition-colors ${expandedUsers[user.id] ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                                {expandedUsers[user.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                            </div>
                                                            <span className="text-xs">{user.name}</span>
                                                            <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">ID: {user.id}</span>
                                                        </td>
                                                        <td className="p-4 font-black text-gray-400 text-xs">{user.totalCount}</td>
                                                        <td className="p-4 text-gray-300 text-[10px] font-black">-</td>
                                                    </tr>

                                                    {/* カテゴリ & アイテム展開 */}
                                                    {expandedUsers[user.id] && Object.values(user.categories).map(cat => {
                                                        const catKey = `${user.id}-${cat.name}`;
                                                        const isExpanded = expandedCategories[catKey];
                                                        return (
                                                            <React.Fragment key={cat.name}>
                                                                <tr
                                                                    className="bg-gray-50/50 text-xs text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors"
                                                                    onClick={() => toggleCategory(user.id, cat.name)}
                                                                >
                                                                    <td className="p-2 pl-20 font-bold uppercase tracking-wider flex items-center gap-1">
                                                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                                        [{getCategoryLabel(cat.name)}]
                                                                    </td>
                                                                    <td className="p-2 font-bold">{cat.totalCount}</td>
                                                                    <td></td>
                                                                </tr>
                                                                {isExpanded && Object.values(cat.items).map((item, idx) => (
                                                                    <tr key={idx} className="bg-white text-sm border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                                        <td className="p-3 pl-24 text-gray-600 flex items-center gap-2">
                                                                            <span className="text-gray-300">└</span>
                                                                            {item.title}
                                                                        </td>
                                                                        <td className="p-3 font-mono text-gray-500">{item.count}</td>
                                                                        <td className="p-3 text-[11px] text-gray-400 font-mono">
                                                                            {new Date(item.lastAt).toLocaleString()}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                    {groupedData.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="3" className="p-12 text-center text-gray-400">
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

export default AdminInteractionAnalysisPage;
