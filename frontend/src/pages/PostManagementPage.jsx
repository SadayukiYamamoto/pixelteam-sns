import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Search, User, Filter, Calendar, MapPin, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import "./PostManagementPage.css";

const PostManagementPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        keyword: '',
        category: '',
        user_id: '',
        shop_name: '',
        start_date: '',
        end_date: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.keyword) params.append('keyword', filters.keyword);
            if (filters.category) params.append('category', filters.category);
            if (filters.user_id) params.append('user_id', filters.user_id);
            if (filters.shop_name) params.append('shop_name', filters.shop_name);
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);

            const res = await axiosClient.get(`admin/posts/list/?${params.toString()}`);
            setPosts(res.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("本当にこの投稿を削除しますか？")) return;
        try {
            const token = localStorage.getItem('token');
            await axiosClient.delete(`posts/${postId}/delete/`);
            fetchPosts(); // リフレッシュ
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("削除に失敗しました");
        }
    };

    const handleEdit = (postId) => {
        navigate(`/post/${postId}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts();
    };

    const handleExportCSV = () => {
        if (posts.length === 0) {
            alert("エクスポートするデータがありません");
            return;
        }

        const headers = ["日時", "ユーザー名", "ユーザーID", "カテゴリー", "内容", "ステータス"];
        const csvRows = [headers.join(",")];

        posts.forEach(post => {
            const date = new Date(post.created_at).toLocaleString();
            const userName = `"${(post.display_name || '').replace(/"/g, '""')}"`;
            const userId = `"${(post.user_uid || '').replace(/"/g, '""')}"`;
            const category = `"${(post.category || '').replace(/"/g, '""')}"`;
            const content = `"${(post.content || '').replace(/<[^>]+>/g, '').replace(/"/g, '""')}"`;

            const status = post.is_deleted ? "削除済み" : "公開中";

            csvRows.push([date, userName, userId, category, content, status].join(","));
        });

        const csvContent = "\ufeff" + csvRows.join("\n"); // Add BOM for Excel
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `posts_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSyncToSheets = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.post('admin/posts/export_gsheet/', {});
            alert("スプレッドシートへの同期が完了しました！");
            console.log("Sheet sync success:", res.data);
        } catch (error) {
            console.error("Error syncing to sheets:", error);
            alert("スプレッドシートへの同期に失敗しました: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-mgmt-container">
            <Header />
            <div className="post-mgmt-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-page-content"
                >
                    <header className="post-mgmt-header">
                        <h1>投稿管理</h1>
                        <p>全ての投稿を検索・編集・削除できます。不適切な投稿の管理にご利用ください。</p>
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
                                            placeholder="投稿内容やタイトルで検索..."
                                            className="premium-filter-input with-icon"
                                            value={filters.keyword}
                                            onChange={e => setFilters({ ...filters, keyword: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="filter-item">
                                    <label>ユーザーID</label>
                                    <div className="filter-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="User ID"
                                            className="premium-filter-input"
                                            value={filters.user_id}
                                            onChange={e => setFilters({ ...filters, user_id: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="filter-item">
                                    <label>店舗名</label>
                                    <div className="filter-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="店舗名"
                                            className="premium-filter-input"
                                            value={filters.shop_name}
                                            onChange={e => setFilters({ ...filters, shop_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="filter-item">
                                    <label>カテゴリー</label>
                                    <div className="filter-input-wrapper">
                                        <select
                                            className="premium-filter-input"
                                            value={filters.category}
                                            onChange={e => setFilters({ ...filters, category: e.target.value })}
                                        >
                                            <option value="">全て表示</option>
                                            <option value="雑談">雑談</option>
                                            <option value="個人報告">個人報告</option>
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
                                <Search size={22} className="stroke-[3]" />
                                検索
                            </button>
                        </form>
                    </div>

                    {/* リストセクション */}
                    <div className="premium-results-card">
                        <div className="results-summary flex justify-between items-center">
                            <span className="results-count">
                                検索結果: <span className="count-number">{posts.length}</span> 件
                            </span>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSyncToSheets}
                                    className="sync-sheets-btn"
                                    disabled={loading}
                                    title="Googleスプレッドシートに直接書き出し"
                                >
                                    <MapPin size={18} />
                                    シート同期
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="export-csv-btn"
                                    title="CSV形式でダウンロード"
                                >
                                    <Download size={18} />
                                    CSV出力
                                </button>
                            </div>
                        </div>

                        <div className="premium-table-wrapper">
                            <table className="premium-mgmt-table">
                                <thead>
                                    <tr>
                                        <th className="w-[180px]">日時</th>
                                        <th className="w-[200px]">ユーザー</th>
                                        <th className="w-[180px]">店舗</th>
                                        <th className="w-[140px]">カテゴリー</th>
                                        <th>内容</th>
                                        <th className="text-center w-[120px]">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="p-20 text-center font-bold text-gray-400">読み込み中...</td>
                                        </tr>
                                    ) : posts.length > 0 ? (
                                        posts.map(post => (
                                            <tr key={post.id}>
                                                <td className="cell-datetime">
                                                    <div className="date">{new Date(post.created_at).toLocaleDateString()}</div>
                                                    <div className="time">{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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
                                                            <span className="user-uid">ID: {post.user_uid?.substring(0, 8)}...</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="mgmt-shop-name">
                                                        {post.shop_name || '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`mgmt-category-badge ${post.category === '個人報告' ? 'orange' : 'blue'}`}>
                                                        {post.category || '未分類'}
                                                    </span>
                                                    {post.is_deleted && (
                                                        <span className="mgmt-status-badge deleted">
                                                            削除済み
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <p className="cell-content-text">
                                                        {post.content?.replace(/<[^>]+>/g, '')}
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
                                            <td colSpan="5" className="p-32 text-center text-gray-400 font-bold">
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

export default PostManagementPage;

