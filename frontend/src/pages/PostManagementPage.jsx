import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Search } from 'lucide-react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';

const PostManagementPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        keyword: '',
        category: '',
        user_id: '',
        shop_name: '',
        start_date: '', // Added
        end_date: ''    // Added
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
            if (filters.start_date) params.append('start_date', filters.start_date); // Added
            if (filters.end_date) params.append('end_date', filters.end_date);       // Added

            const res = await axios.get(`/api/admin/posts/list/?${params.toString()}`, {
                headers: { Authorization: `Token ${token}` }
            });
            setPosts(res.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
            alert("投稿の取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("本当にこの投稿を削除しますか？")) return;
        try {
            const token = localStorage.getItem('token');
            // Assuming the delete endpoint is the same as the user's delete endpoint but accessible by admin
            // Check urls.py: path("posts/<uuid:pk>/delete/", views.delete_post) uses delete_post view.
            // We need to ensure delete_post allows admins.
            // If not, we might need a specific admin delete endpoint or modify delete_post.
            // Let's try the standard one first.
            await axios.delete(`/api/posts/${postId}/delete/`, {
                headers: { Authorization: `Token ${token}` }
            });
            setPosts(posts.filter(p => p.id !== postId));
            alert("削除しました");
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("削除に失敗しました（権限がない可能性があります）");
        }
    };

    const handleEdit = (postId) => {
        navigate(`/post/${postId}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts();
    };

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header />
                <div className="max-w-7xl mx-auto p-4 md:p-10">

                    {/* ページタイトルと説明 */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">投稿管理</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            全ての投稿を検索・編集・削除できます。不適切な投稿の管理にご利用ください。
                        </p>
                    </div>

                    {/* フィルター */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 mb-8 overflow-visible">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
                            <div className="flex-1 w-full min-w-[200px]">
                                <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">キーワード</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="投稿内容やタイトルで検索..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all bg-gray-50 focus:bg-white shadow-inner hover:shadow-md focus:shadow-md border-none"
                                        value={filters.keyword}
                                        onChange={e => setFilters({ ...filters, keyword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-32">
                                <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">ユーザーID</label>
                                <input
                                    type="text"
                                    placeholder="User ID"
                                    className="w-full px-4 py-3 rounded-xl outline-none transition-all bg-gray-50 focus:bg-white text-sm shadow-inner hover:shadow-md focus:shadow-md border-none"
                                    value={filters.user_id}
                                    onChange={e => setFilters({ ...filters, user_id: e.target.value })}
                                />
                            </div>

                            <div className="w-full md:w-36">
                                <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">店舗名</label>
                                <input
                                    type="text"
                                    placeholder="店舗名"
                                    className="w-full px-4 py-3 rounded-xl outline-none transition-all bg-gray-50 focus:bg-white text-sm shadow-inner hover:shadow-md focus:shadow-md border-none"
                                    value={filters.shop_name}
                                    onChange={e => setFilters({ ...filters, shop_name: e.target.value })}
                                />
                            </div>

                            <div className="w-full md:w-32">
                                <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">カテゴリー</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl outline-none transition-all bg-gray-50 focus:bg-white text-sm appearance-none cursor-pointer shadow-inner hover:shadow-md focus:shadow-md border-none"
                                    value={filters.category}
                                    onChange={e => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="">全て表示</option>
                                    <option value="雑談">雑談</option>
                                    <option value="個人報告">個人報告</option>
                                </select>
                            </div>

                            <div className="w-full md:w-auto flex items-center gap-2">
                                {/* Date Inputs - Fixed Layout */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">開始日</label>
                                    <input
                                        type="date"
                                        className="w-[145px] px-3 py-3 rounded-xl outline-none transition-all bg-gray-50 focus:bg-white text-sm shadow-inner hover:shadow-md focus:shadow-md border-none"
                                        value={filters.start_date}
                                        onChange={e => setFilters({ ...filters, start_date: e.target.value })}
                                    />
                                </div>
                                <span className="text-gray-300 mt-6 text-sm">~</span>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">終了日</label>
                                    <input
                                        type="date"
                                        className="w-[145px] px-3 py-3 rounded-xl outline-none transition-all bg-gray-50 focus:bg-white text-sm shadow-inner hover:shadow-md focus:shadow-md border-none"
                                        value={filters.end_date}
                                        onChange={e => setFilters({ ...filters, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full md:w-auto px-10 py-3 bg-[#84cc16] hover:bg-[#a3e635] text-white font-bold rounded-xl shadow-lg shadow-lime-200/50 hover:shadow-xl hover:shadow-lime-300/50 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <Search size={18} /> 検索
                            </button>
                        </form>
                    </div>

                    {/* 投稿リスト */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border-none">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                                検索結果: <span className="text-[#84cc16] text-lg">{posts.length}</span> 件
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                        <th className="p-4 font-semibold w-32">日時</th>
                                        <th className="p-4 font-semibold w-48">ユーザー</th>
                                        <th className="p-4 font-semibold w-32">カテゴリー</th>
                                        <th className="p-4 font-semibold">内容</th>
                                        <th className="p-4 font-semibold text-center w-24">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {posts.map(post => (
                                        <tr key={post.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="p-4 text-gray-500 text-sm whitespace-nowrap">
                                                {new Date(post.created_at).toLocaleDateString()}
                                                <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={post.profile_image || "/default-avatar.png"}
                                                        alt=""
                                                        className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-sm"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800 text-sm">{post.display_name}</span>
                                                        <span className="text-xs text-gray-400 font-mono">{post.user_uid?.substring(0, 8)}...</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${post.category === '個人報告'
                                                    ? 'bg-orange-50 text-orange-700 border-orange-100'
                                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                    {post.category || '未分類'}
                                                </span>
                                            </td>
                                            <td className="p-4 max-w-sm">
                                                <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
                                                    {post.content.replace(/<[^>]+>/g, '')}
                                                </p>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(post.id)}
                                                        className="p-2 text-blue-600 bg-white hover:bg-blue-50 rounded-lg shadow-sm hover:shadow transition-all border-none"
                                                        title="確認・編集"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="p-2 text-red-500 bg-white hover:bg-red-50 rounded-lg shadow-sm hover:shadow transition-all border-none"
                                                        title="削除"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {posts.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                                                    <Search size={48} className="text-gray-200" />
                                                    <p className="font-medium">条件に一致する投稿が見つかりませんでした</p>
                                                    <p className="text-xs">別のキーワードで検索してみてください</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {loading && (
                                <div className="p-10 text-center text-gray-400 text-sm">読み込み中...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default PostManagementPage;
