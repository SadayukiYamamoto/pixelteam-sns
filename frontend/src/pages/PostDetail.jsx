import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import PostItem from '../components/PostItem';
import CommentBottomSheet from '../components/CommentBottomSheet';
import { ArrowLeft } from 'lucide-react';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCommentSheet, setShowCommentSheet] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Token ${token}` } } : {};
                const res = await axios.get(`/api/posts/${id}/`, config);

                // PostItemが期待する形式にデータを整形
                const formattedPost = {
                    id: res.data.id,
                    content: res.data.content,
                    time: new Date(res.data.created_at).toLocaleDateString(),
                    image: res.data.image_url || res.data.image,
                    user: res.data.display_name || "名無しさん",
                    profileImage: res.data.profile_image,
                    likes: res.data.likes_count,
                    comments: res.data.comments_count,
                    liked: res.data.liked
                };

                setPost(formattedPost);
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleLike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('ログインが必要です');
                return;
            }
            const res = await axios.post(`/api/posts/${postId}/like/`, {}, {
                headers: { Authorization: `Token ${token}` }
            });

            setPost(prev => ({
                ...prev,
                likes: res.data.likes_count,
                liked: res.data.liked
            }));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleComment = () => {
        setShowCommentSheet(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#f6f7f9]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#f6f7f9]">
                <p className="text-gray-500">投稿が見つかりませんでした。</p>
            </div>
        );
    }

    return (
        <div className="bg-[#f6f7f9] min-h-screen pb-24">
            {/* ヘッダーの代わりに戻るボタン付きのヘッダー風エリア */}
            <div className="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-50 flex items-center px-4 max-w-[480px] mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <span className="ml-2 font-bold text-lg text-gray-800">投稿詳細</span>
            </div>

            <div className="pt-20 px-4 max-w-[480px] mx-auto">
                <PostItem
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                />
            </div>

            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {showCommentSheet && (
                <CommentBottomSheet
                    postId={id}
                    onClose={() => setShowCommentSheet(false)}
                />
            )}
        </div>
    );
};

export default PostDetail;
