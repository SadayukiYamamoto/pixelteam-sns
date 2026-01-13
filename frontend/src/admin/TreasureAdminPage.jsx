import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Search, Calendar, Filter, MapPin, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import "./TreasureAdminPage.css";

const TreasureAdminPage = () => {
    const [posts, setPosts] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        keyword: '',
        shop_name: '',
        start_date: '',
        end_date: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchShops();
        fetchPosts();
    }, []);

    const fetchShops = async () => {
        try {
            const res = await axiosClient.get('/admin/shops/list/');
            setShops(res.data);
        } catch (error) {
            console.error("Error fetching shops:", error);
        }
    };

    const fetchPosts = async (params = filters) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (params.keyword) queryParams.append('keyword', params.keyword);
            if (params.shop_name) queryParams.append('shop_name', params.shop_name);
            if (params.start_date) queryParams.append('start_date', params.start_date);
            if (params.end_date) queryParams.append('end_date', params.end_date);

            const res = await axiosClient.get(`/admin/treasure_posts/list/?${queryParams.toString()}`);
            setPosts(res.data);
        } catch (error) {
            console.error("Error fetching treasure posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("本当にこの投稿を削除しますか？")) return;
        try {
            await axiosClient.delete(`/api/treasure_posts/${postId}/`);
            setPosts(posts.filter(p => p.id !== postId));
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("削除に失敗しました");
        }
    };

    const handleEdit = (postId) => {
        navigate(`/treasure/edit/${postId}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts();
    };

    const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    return (
        <div className="treasure-admin-container">
            <Header />
            <div className="treasure-admin-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-page-content"
                >
                    <header className="treasure-admin-header">
                        <h1>知恵袋管理</h1>
                        <p>全てのノウハウ投稿を分析・管理できます。店舗ごとの提出状況の把握にご利用ください。</p>
                    </header>

                    {/* フィルターセクション */}
                    <div className="premium-filter-card">
                        <form onSubmit={handleSearch}>
                            <div className="filter-grid">
                                <div className="filter-item">
                                    <label>キーワード</label>
                                    <div className="filter-input-wrapper">
                                        <Search size={18} className="filter-icon" />
                                        <input
                                            type="text"
                                            placeholder="内容やタイトルで検索..."
                                            className="premium-filter-input with-icon"
                                            value={filters.keyword}
                                            onChange={e => setFilters({ ...filters, keyword: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="filter-item">
                                    <label>店舗選択</label>
                                    <div className="filter-input-wrapper">
                                        <MapPin size={18} className="filter-icon" />
                                        <select
                                            className="premium-filter-input with-icon"
                                            value={filters.shop_name}
                                            onChange={e => setFilters({ ...filters, shop_name: e.target.value })}
                                        >
                                            <option value="">全ての店舗</option>
                                            {shops.map(shop => (
                                                <option key={shop} value={shop}>{shop}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="filter-item">
                                    <label>開始日</label>
                                    <div className="filter-input-wrapper">
                                        <input
                                            type="date"
                                            className="premium-filter-input"
                                            value={filters.start_date}
                                            onChange={e => setFilters({ ...filters, start_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="filter-item">
                                    <label>終了日</label>
                                    <div className="filter-input-wrapper">
                                        <input
                                            type="date"
                                            className="premium-filter-input"
                                            value={filters.end_date}
                                            onChange={e => setFilters({ ...filters, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="search-submit-btn">
                                <Filter size={22} className="stroke-[3]" />
                                データを抽出する
                            </button>
                        </form>
                    </div>

                    {/* リストセクション */}
                    <div className="premium-results-card">
                        <div className="results-summary">
                            <span className="results-count">
                                投稿件数: <span className="count-number">{posts.length}</span> 件
                            </span>
                        </div>

                        <div className="premium-table-wrapper">
                            <table className="premium-mgmt-table">
                                <thead>
                                    <tr>
                                        <th className="w-[140px]">日付</th>
                                        <th className="w-[160px]">カテゴリー</th>
                                        <th className="w-[200px]">投稿者</th>
                                        <th className="w-[200px]">タイトル</th>
                                        <th className="w-[100px]">年齢</th>
                                        <th className="w-[80px]">性別</th>
                                        <th className="w-[150px]">端末</th>
                                        <th className="w-[250px]">不安要素・ニーズ</th>
                                        <th className="w-[250px]">訴求ポイント</th>
                                        <th className="w-[300px]">トークの流れ</th>
                                        <th className="text-center w-[120px]">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="11" className="p-20 text-center font-bold text-gray-400">読み込み中...</td>
                                        </tr>
                                    ) : posts.length > 0 ? (
                                        posts.map(post => (
                                            <tr key={post.id}>
                                                <td className="cell-datetime">
                                                    <div className="date">{new Date(post.created_at).toLocaleDateString()}</div>
                                                    <div className="time">{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td>
                                                    <span className="mgmt-category-badge green">
                                                        {post.category || '未分類'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="cell-user">
                                                        <img
                                                            src={post.profile_image || "/default-avatar.png"}
                                                            className="user-avatar"
                                                            alt=""
                                                        />
                                                        <div className="user-info-text">
                                                            <span className="user-name">{post.display_name}</span>
                                                            <span className="user-shop">{post.shop_name || "店舗未設定"}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="font-bold text-slate-700">{post.title}</td>
                                                <td><span className="cell-pill">{post.age || "-"}</span></td>
                                                <td><span className="cell-pill">{post.gender || "-"}</span></td>
                                                <td><span className="cell-pill">{post.device_used || "-"}</span></td>
                                                <td><p className="cell-content-text" title={post.anxiety_needs}>{post.anxiety_needs || "-"}</p></td>
                                                <td><p className="cell-content-text" title={post.appeal_points}>{post.appeal_points || "-"}</p></td>
                                                <td>
                                                    <p className="cell-content-text" title={stripHtml(post.content)}>
                                                        {stripHtml(post.content)}
                                                    </p>
                                                </td>
                                                <td>
                                                    <div className="mgmt-action-btns">
                                                        <button
                                                            onClick={() => handleEdit(post.id)}
                                                            className="action-icon-btn edit"
                                                            title="編集"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(post.id)}
                                                            className="action-icon-btn delete"
                                                            title="削除"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="11" className="p-32 text-center text-gray-400 font-bold">
                                                条件に一致する投稿が見つかりませんでした
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

export default TreasureAdminPage;
