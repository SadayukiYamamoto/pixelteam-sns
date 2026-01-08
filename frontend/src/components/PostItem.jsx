import React, { useState } from 'react';
import { Heart, MessageCircleMore } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { processHtmlContent } from '../utils/contentHelper';
import { logInteraction } from '../utils/analytics';
import axiosClient from '../api/axiosClient';
import Avatar from './Avatar';
import { renderPostContent } from '../utils/textUtils';

const PostItem = ({ post, onLike, onComment, hideReactions = false, className = "", variant = "default" }) => {
  const navigate = useNavigate();
  const isFeatured = variant === "featured";
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [likeList, setLikeList] = useState([]);
  const [likeListLoading, setLikeListLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) onLike(post.id);
  };

  const handleLikesCountClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikeListLoading(true);
    setShowLikeModal(true);
    try {
      const res = await axiosClient.get(`posts/${post.id}/likes/`);
      setLikeList(res.data);
    } catch (error) {
      console.error("いいね一覧取得エラー:", error);
    } finally {
      setLikeListLoading(false);
    }
  };

  const handleCommentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onComment) onComment(post.id);
  };

  const handleCardClick = () => {
    logInteraction('post', post.id, post.title || post.content.substring(0, 30));
    navigate(`/posts?highlight=${post.id}`);
  };

  // Featured Styles
  // Unused featuredStyles removed for clarity

  return (
    <>
      <div
        onClick={handleCardClick}
        className={isFeatured ? "post-card featured cursor-pointer" : "post-card cursor-pointer"}
      >
        {/* ユーザー情報 */}
        <div className="post-user-info">
          <button
            type="button"
            className="flex items-center space-x-2 cursor-pointer p-1.5 -ml-1 rounded-lg hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95 transition-all duration-200 relative z-20 text-left border-none bg-transparent appearance-none w-fit max-w-[85%]"
            onClick={(e) => {
              e.stopPropagation();
              if (post.user_uid) navigate(`/mypage/${post.user_uid}`);
            }}
          >
            <Avatar
              src={post.profileImage}
              name={typeof post.user === 'string' ? post.user : post.user?.displayName}
              size="w-10 h-10"
            />
            <div className="ml-2">
              <p className="font-bold text-sm leading-tight text-gray-800">
                {typeof post.user === 'string' ? post.user : post.user?.displayName}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">{post.time}</p>
            </div>
          </button>
        </div>

        {/* 投稿本文 */}
        <div className="post-content-wrapper">
          {renderPostContent(post.content, isExpanded, () => setIsExpanded(!isExpanded), post.category)}
        </div>

        {/* 画像 */}
        {post.image && (
          <div className="mb-4 rounded-3xl overflow-hidden border border-gray-100/50 shadow-sm">
            <img
              src={post.image}
              alt=""
              className="w-full h-auto object-cover max-h-[400px]"
              onError={(e) => {
                e.target.parentElement.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* リアクション */}
        {!hideReactions && (
          <div className="reaction-bar mt-3">
            <button
              onClick={handleLikeClick}
              className="reaction-btn transition-all active:scale-95 group"
            >
              <Heart
                size={18}
                fill="currentColor"
                className={`heart ${post.liked ? "red" : ""}`}
              />
              <span
                className="text-[13px] font-bold cursor-pointer hover:underline"
                onClick={handleLikesCountClick}
              >
                {post.likes}
              </span>
            </button>

            <button
              onClick={handleCommentClick}
              className="reaction-btn transition-all active:scale-95 group"
            >
              <MessageCircleMore size={18} />
              <span className="text-[13px] font-bold">{post.comments}</span>
            </button>

            <div className="flex-1" />
          </div>
        )}
      </div>

      {/* いいねしたユーザーモーダル */}
      {showLikeModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[110000] p-4"
          onClick={() => setShowLikeModal(false)}
        >
          <div
            className="bg-white rounded-[32px] w-full max-w-[340px] max-h-[70vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pb-2">
              <h3 className="text-lg font-black text-gray-800">いいねしたユーザー</h3>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2">
              {likeListLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
                  <span className="text-gray-500 text-sm">読み込み中...</span>
                </div>
              ) : likeList.length > 0 ? (
                <div className="space-y-4 py-2">
                  {likeList.map((user, i) => (
                    <div
                      key={i}
                      className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-colors"
                      onClick={() => {
                        navigate(`/mypage/${user.user_id || user.id}`);
                        setShowLikeModal(false);
                      }}
                    >
                      < Avatar
                        src={user.profile_image}
                        name={user.display_name}
                        size="w-10 h-10"
                        className="ml-5"
                      />
                      <span className="font-bold text-gray-700 text-[15px] ml-5">{user.display_name || "匿名"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-gray-400 text-sm font-medium">まだ誰もいいねしていません。</p>
                </div>
              )}
            </div>

            <div className="p-6 pt-2">
              <button
                onClick={() => setShowLikeModal(false)}
                className="w-full py-4 bg-white text-gray-700 font-black rounded-2xl shadow-lg active:scale-[0.98] transition-all border-none text-[15px]"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostItem;
