import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import '../admin/AdminCommon.css';
import './PostAdminPage.css';

const PostAdminPage = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('token');
    const API_BASE = '/api';

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/posts/`, {
                headers: { Authorization: `Token ${token}` }
            });
            // Some API might return differently, adjust if needed
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFeatured = async (post) => {
        try {
            const res = await axios.post(`${API_BASE}/admin/posts/${post.id}/toggle_featured/`, {}, {
                headers: { Authorization: `Token ${token}` }
            });
            setPosts(posts.map(p => p.id === post.id ? { ...p, is_featured: res.data.is_featured } : p));
        } catch (error) {
            console.error('Error toggling featured status:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    };

    const filteredPosts = posts.filter(post =>
        (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.display_name && post.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="admin-page-container">
            <Header title="管理" />
            <div className="admin-wrapper bg-[#f8fafc]">
                <div className="post-pickup-container">

                    {/* Header with Search */}
                    <div className="post-pickup-header">
                        <h1>投稿ピックアップ</h1>
                        <div className="pickup-search-wrapper">
                            <FiSearch className="search-icon-fixed" size={18} />
                            <input
                                type="text"
                                className="pickup-search-input"
                                placeholder="投稿内容やユーザー名で検索..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-gray-400 font-bold">読み込み中...</div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="p-20 text-center text-gray-300 font-black tracking-widest uppercase">投稿が見つかりません</div>
                    ) : (
                        <div className="pickup-list">
                            {filteredPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className={`pickup-card ${post.is_featured ? 'is-featured' : ''}`}
                                    onClick={() => toggleFeatured(post)}
                                >
                                    <div className="pickup-checkbox">
                                        {post.is_featured && <FiCheck size={18} />}
                                    </div>

                                    <div className="pickup-card-body">
                                        <div className="pickup-user-row">
                                            <img
                                                src={post.profile_image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(post.display_name || "User") + "&background=random"}
                                                className="pickup-avatar"
                                                alt=""
                                            />
                                            <div className="pickup-user-info">
                                                <span className="pickup-username">{post.display_name}</span>
                                                <span className="pickup-date">{formatDate(post.created_at)}</span>
                                            </div>
                                        </div>

                                        <div
                                            className="pickup-content"
                                            dangerouslySetInnerHTML={{ __html: post.content }}
                                        />

                                        {post.media && post.media.length > 0 && (
                                            <div className="pickup-media-grid">
                                                {post.media.map((item, idx) => (
                                                    <img key={idx} src={item.url} className="pickup-media-item" alt="" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default PostAdminPage;
