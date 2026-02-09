import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Play } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import PostItem from './PostItem';
import { logInteraction } from '../utils/analytics';


import PullToRefresh from './PullToRefresh';

const MainContent = ({ setActiveTab }) => {
  const navigate = useNavigate();
  const [data, setData] = React.useState({
    news: [],
    shorts: [],
    featured_posts: [],
    trending_hashtags: [],
    active_users: []
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    try {
      const res = await axiosClient.get('admin/home/content/');
      if (res.data) {
        setData({
          news: res.data.news || [],
          shorts: res.data.shorts || [],
          featured_posts: res.data.featured_posts || [],
          trending_hashtags: res.data.trending_hashtags || [],
          active_users: res.data.active_users || []
        });
      }
    } catch (error) {
      console.error('Error fetching home content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchHomeContent();
  };

  const handleLike = async (postId) => {
    try {
      const res = await axiosClient.post(`posts/${postId}/like/`, {});
      setData(prev => ({
        ...prev,
        featured_posts: prev.featured_posts.map(p =>
          p.id === postId ? { ...p, likes_count: res.data.likes_count, liked: res.data.liked } : p
        )
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = (postId) => {
    navigate(`/posts?highlight=${postId}&comments=1`);
  };

  // 過去ボタン共通スタイル
  const historyButtonStyle = `
    w-full h-14 bg-white rounded-3xl shadow-md border border-gray-100/50
    flex items-center justify-center text-[15px] font-black
    text-gray-700 hover:bg-gray-50 transition-all active:scale-95
    hover:shadow-lg hover:translate-y-[-1px]
  `;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-10 min-h-screen pb-24 p-4" style={{ backgroundColor: '#f6f7f9' }}>
        <div className="mx-auto space-y-10">
          {/* 1. 事務局おすすめの投稿 */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <div
                className="pokepoke-label z-10 relative -mb-6"
                style={{
                  width: '100%',
                  maxWidth: '264px',
                  textAlign: 'center'
                }}
              >
                事務局おすすめの投稿
              </div>
            </div>

            <div className="space-y-6">
              {data.featured_posts.map((post) => (
                <PostItem
                  key={post.id}
                  post={{
                    id: post.id,
                    content: post.content,
                    time: new Date(post.created_at).toLocaleDateString(),
                    image: post.image_url || post.image,
                    user: post.display_name || "名無しさん",
                    user_uid: post.user_uid,
                    profileImage: post.profile_image,
                    likes: post.likes_count,
                    comments: post.comments_count,
                    liked: post.liked,
                    shop_name: post.shop_name
                  }}
                  onLike={handleLike}
                  onComment={handleComment}
                  variant="featured"
                />
              ))}
              {data.featured_posts.length === 0 && (
                <div className="py-20 text-center bg-white rounded-[32px] shadow-sm">
                  <p className="text-gray-400 font-medium text-[15px]">おすすめの投稿はありません</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. 事務局だより＆ショート - 左右2列に配置 */}
          <div className="grid grid-cols-2 gap-5 mt-10">
            {/* 事務局だより */}
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center">
                <div
                  className="pokepoke-label z-10 relative -mb-6"
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '12px'
                  }}
                >
                  事務局だより
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {data.news.map((n) => (
                  <a
                    key={n.id}
                    href={n.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => logInteraction('news', n.id, n.title)}
                    className="pokepoke-card block group"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-gray-50">
                      {n.thumbnail ? (
                        <img src={n.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Archive size={20} className="text-gray-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-center min-h-[4.5rem]">
                      <h3 className="text-[12px] font-bold text-gray-800 leading-snug line-clamp-2 text-center group-hover:text-[#059669] transition-colors">
                        {n.title}
                      </h3>
                    </div>
                  </a>
                ))}
              </div>

              <button
                onClick={() => {
                  logInteraction('news', 'archive_news', '過去の事務局だより');
                  navigate('/past-secretariat-news');
                }}
                className="archive-button"
              >
                <span>過去の事務局だより</span>
              </button>
            </div>

            {/* ショート動画 */}
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center">
                <div
                  className="pokepoke-label z-10 relative -mb-6"
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '12px'
                  }}
                >
                  最新の動画
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {data.shorts.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      logInteraction('video', v.id, v.title);
                      navigate(`/video/${v.id}`);
                    }}
                    className="pokepoke-card block group cursor-pointer"
                  >
                    <div className="aspect-video w-full overflow-hidden relative bg-gray-50">
                      <img src={v.thumb} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/5 backdrop-blur-[1px]">
                        <div className="bg-white/90 p-3 rounded-full shadow-md text-[#059669]"><Play size={20} fill="currentColor" /></div>
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-center min-h-[4.5rem]">
                      <h3 className="text-[12px] font-bold text-gray-800 leading-snug line-clamp-2 text-center group-hover:text-[#059669] transition-colors">
                        {v.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  logInteraction('video', 'archive_videos', '過去の動画');
                  navigate('/videos');
                }}
                className="archive-button"
              >
                <span>過去の動画</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>

  );
};


export default MainContent;
