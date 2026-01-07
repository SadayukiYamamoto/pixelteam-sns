import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FiSearch, FiChevronRight, FiChevronDown, FiMousePointer, FiTarget, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import "./AdminInteractionAnalysisPage.css";

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
            mission: 'ミッション',
            notice: 'NOTICE'
        };
        return labels[cat] || cat;
    };

    return (
        <div className="interaction-analysis-container">
            <Header />
            <main className="interaction-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="interaction-header"
                >
                    <div className="interaction-header-title">
                        <FiTarget className="title-icon" size={28} />
                        <h1>インタラクション分析</h1>
                    </div>
                    <p>どのチームの誰が、何のコンテンツを何回クリックしたかを確認できます。</p>
                </motion.div>

                {/* フィルターセクション */}
                <div className="interaction-filter-card">
                    <form onSubmit={handleSearch} className="interaction-filter-form">
                        <div className="filter-grid">
                            <div className="filter-item">
                                <label>チーム</label>
                                <select
                                    value={filters.team}
                                    onChange={e => setFilters({ ...filters, team: e.target.value })}
                                >
                                    <option value="">全て</option>
                                    <option value="shop">Pixel-Shop</option>
                                    <option value="event">Pixel-Event</option>
                                    <option value="training">Pixel-Training</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label>カテゴリー</label>
                                <select
                                    value={filters.category}
                                    onChange={e => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="">全て</option>
                                    <option value="post">投稿</option>
                                    <option value="video">動画</option>
                                    <option value="knowhow">ノウハウ</option>
                                    <option value="task">業務</option>
                                    <option value="mission">ミッション</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label>ユーザーID</label>
                                <input
                                    type="text"
                                    placeholder="User ID"
                                    value={filters.user_id}
                                    onChange={e => setFilters({ ...filters, user_id: e.target.value })}
                                />
                            </div>
                            <div className="filter-item">
                                <label>期間指定</label>
                                <div className="date-range-group">
                                    <input
                                        type="date"
                                        value={filters.start_date}
                                        onChange={e => setFilters({ ...filters, start_date: e.target.value })}
                                    />
                                    <span className="date-separator">~</span>
                                    <input
                                        type="date"
                                        value={filters.end_date}
                                        onChange={e => setFilters({ ...filters, end_date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn-search-interaction">
                            <FiSearch size={20} />
                            検索
                        </button>
                    </form>
                </div>

                {/* データ表示セクション */}
                <div className="interaction-results-card">
                    <div className="interaction-summary-header">
                        <h3>総計: <span className="total-count-highlight">{logs.length}</span> インタラクション</h3>
                    </div>

                    <table className="interaction-tree-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60%' }}>対象・項目</th>
                                <th style={{ width: '15%' }}>クリック数</th>
                                <th style={{ width: '25%' }}>最終ログ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedData.map(team => (
                                <React.Fragment key={team.name}>
                                    <tr
                                        className={`row-team ${expandedTeams[team.name] ? 'expanded' : ''}`}
                                        onClick={() => toggleTeam(team.name)}
                                    >
                                        <td className="team-cell">
                                            <div className="team-content">
                                                <div className="expand-icon">
                                                    {expandedTeams[team.name] ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                                                </div>
                                                <span className="team-badge">TEAM</span>
                                                <span className="team-name">{team.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="count-badge-blue">{team.totalCount}</span>
                                        </td>
                                        <td className="last-log-time no-log-dash">-</td>
                                    </tr>

                                    <AnimatePresence>
                                        {expandedTeams[team.name] && Object.values(team.users).map(user => (
                                            <React.Fragment key={user.id}>
                                                <tr
                                                    className="row-user"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleUser(user.id);
                                                    }}
                                                >
                                                    <td>
                                                        <div className="user-content">
                                                            <div className="expand-icon-sm">
                                                                {expandedUsers[user.id] ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
                                                            </div>
                                                            <div className="user-profile-icon">
                                                                <FiUser size={18} />
                                                            </div>
                                                            <div className="user-info-group">
                                                                <span className="user-display-name">{user.name}</span>
                                                                <span className="user-uid-badge">ID: {user.id.substring(0, 16)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="font-bold text-slate-400">{user.totalCount}</td>
                                                    <td className="last-log-time no-log-dash">-</td>
                                                </tr>

                                                {expandedUsers[user.id] && Object.values(user.categories).map(cat => {
                                                    const catKey = `${user.id}-${cat.name}`;
                                                    const isExpanded = expandedCategories[catKey];
                                                    return (
                                                        <React.Fragment key={cat.name}>
                                                            <tr
                                                                className="row-category"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleCategory(user.id, cat.name);
                                                                }}
                                                            >
                                                                <td>
                                                                    <div className="category-content">
                                                                        {isExpanded ? <FiChevronDown size={10} /> : <FiChevronRight size={10} />}
                                                                        <span className="category-bracket-label">[{getCategoryLabel(cat.name)}]</span>
                                                                    </div>
                                                                </td>
                                                                <td className="font-bold text-slate-400">{cat.totalCount}</td>
                                                                <td className="last-log-time no-log-dash">-</td>
                                                            </tr>
                                                            {isExpanded && Object.values(cat.items).map((item, idx) => (
                                                                <tr key={idx} className="row-item">
                                                                    <td>
                                                                        <div className="item-content">
                                                                            <span className="item-connector">└</span>
                                                                            <span>{item.title}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="font-bold text-slate-400">{item.count}</td>
                                                                    <td className="last-log-time">
                                                                        {new Date(item.lastAt).toLocaleString('ja-JP', {
                                                                            year: 'numeric',
                                                                            month: 'numeric',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                            second: '2-digit'
                                                                        })}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </AnimatePresence>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    {logs.length === 0 && !loading && (
                        <div className="p-32 text-center text-gray-300 font-bold uppercase tracking-widest">
                            <FiMousePointer size={48} className="mx-auto mb-4 opacity-10" />
                            ログが見つかりませんでした
                        </div>
                    )}
                </div>
            </main>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default AdminInteractionAnalysisPage;
