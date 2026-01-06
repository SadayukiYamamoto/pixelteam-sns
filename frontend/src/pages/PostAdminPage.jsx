import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckSquare, Square, Search } from 'lucide-react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import './PostAdminPage.css';

const PostAdminPage = () => {
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

    const filteredPosts = posts.filter(post =>
        (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.display_name && post.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="admin-loading">読み込み中...</div>;

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header title="投稿ピックアップ" />
                <div className="max-w-7xl mx-auto p-4 md:p-10">
                    <header className="admin-header">
                        <h1>投稿ピックアップ</h1>
                        <div className="search-bar">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="投稿内容やユーザー名で検索..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </header>

                    <div className="posts-admin-list">
                        {filteredPosts.map((post) => (
                            <div key={post.id} className={`post-admin-card ${post.is_featured ? 'featured' : ''}`}>
                                <div className="post-admin-checkbox" onClick={() => toggleFeatured(post)}>
                                    {post.is_featured ? <CheckSquare size={24} color="#10b981" fill="#10b981" fillOpacity={0.1} /> : <Square size={24} color="#cbd5e1" />}
                                </div>

                                <div className="post-admin-main">
                                    <div className="post-user">
                                        <img src={post.profile_image || '/default-avatar.png'} alt="" />
                                        <span className="user-name">{post.display_name}</span>
                                        <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
                                    {post.image_url && <img src={post.image_url} alt="" className="post-image-preview" />}
                                </div>

                                <div className="post-admin-badge">
                                    {post.is_featured && <span className="featured-badge">ピックアップ中</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default PostAdminPage;
