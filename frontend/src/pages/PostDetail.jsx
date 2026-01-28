import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import PostItem from '../components/PostItem';
import CommentBottomSheet from '../components/CommentBottomSheet';
import { ArrowLeft } from 'lucide-react';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCommentSheet, setShowCommentSheet] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    // 最初に画面トップにスクロール
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Token ${token}` } } : {};
                const res = await axios.get(`/api/posts/${id}/`, config);

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

                // URLパラメータに showComments があればシートを開く
                const params = new URLSearchParams(location.search);
                if (params.get('openComments') === 'true') {
                    setShowCommentSheet(true);
                }
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, location.search]);

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
        <div className="home-container">
            <div className="home-wrapper">
                <Header />

                <div
                    className="overflow-y-auto px-4 pb-[100px]"
                    style={{
                        height: "calc(100vh - 120px)",
                        paddingTop: "calc(112px + env(safe-area-inset-top, 0px))",
                        backgroundColor: "#f6f7f9"
                    }}
                >
                    <div className="max-w-[548px] mx-auto">
                        <PostItem
                            post={post}
                            onLike={handleLike}
                            onComment={handleComment}
                            disableCardClick={true}
                        />
                    </div>
                </div>

                <Navigation activeTab="home" />

                {showCommentSheet && (
                    <CommentBottomSheet
                        postId={id}
                        onClose={() => setShowCommentSheet(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default PostDetail;
