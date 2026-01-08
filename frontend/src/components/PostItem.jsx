import React, { useState } from 'react';
import { Heart, MessageCircleMore, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { processHtmlContent } from '../utils/contentHelper';
import { logInteraction } from '../utils/analytics';
import axiosClient from '../api/axiosClient';

const PostItem = ({ post, onLike, onComment, hideReactions = false, className = "", variant = "default" }) => {
  const navigate = useNavigate();
  const isFeatured = variant === "featured";
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [likeList, setLikeList] = useState([]);
  const [likeListLoading, setLikeListLoading] = useState(false);

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
  const featuredStyles = {
    card: {
      backgroundAttachment: 'scroll',
      backgroundClip: 'border-box',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      backgroundImage: 'linear-gradient(135deg, rgb(255, 255, 255), rgb(249, 250, 251))',
      backgroundOrigin: 'padding-box',
      backgroundPosition: '0% 0%',
      backgroundRepeat: 'repeat',
      backgroundSize: 'auto',
      borderBottomColor: 'rgba(255, 255, 255, 0.9)',
      borderBottomLeftRadius: '35.2px',
      borderBottomRightRadius: '35.2px',
      borderBottomStyle: 'solid',
      borderBottomWidth: '1.33333px',
      borderLeftColor: 'rgba(255, 255, 255, 0.9)',
      borderLeftStyle: 'solid',
      borderLeftWidth: '1.33333px',
      borderRightColor: 'rgba(255, 255, 255, 0.9)',
      borderRightStyle: 'solid',
      borderRightWidth: '1.33333px',
      borderTopColor: 'rgba(255, 255, 255, 0.9)',
      borderTopLeftRadius: '35.2px',
      borderTopRightRadius: '35.2px',
      borderTopStyle: 'solid',
      borderTopWidth: '1.33333px',
      boxShadow: 'rgba(0, 0, 0, 0.08) 0px 15px 45px -12px, rgba(0, 0, 0, 0.05) 0px 8px 15px -8px',
      cursor: 'pointer',
      display: 'block',
      fontFamily: '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      height: '223.833px',
      marginBottom: '20px',
      overflow: 'hidden',
      padding: '20px',
      position: 'relative',
      transitionDuration: '0.25s',
      transitionProperty: 'all',
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      unicodeBidi: 'isolate',
      width: '100%',
      WebkitFontSmoothing: 'antialiased'
    },
    profileWrapper: {
      alignItems: 'center',
      cursor: 'pointer',
      display: 'flex',
      fontFamily: '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      height: '87.6667px',
      justifyContent: 'space-between',
      marginBottom: '16px',
      unicodeBidi: 'isolate',
      width: '100%',
      WebkitFontSmoothing: 'antialiased'
    },
    profileButton: {
      alignItems: 'center',
      appearance: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      border: 'none',
      borderRadius: '12px',
      boxSizing: 'border-box',
      color: 'rgb(0, 0, 0)',
      cursor: 'pointer',
      display: 'flex',
      fontFamily: 'Arial',
      fontSize: '13.3333px',
      height: '87.6667px',
      marginBottom: '0px',
      marginLeft: '-4px',
      marginRight: '0px',
      marginTop: '0px',
      maxWidth: '85%',
      padding: '6px',
      position: 'relative',
      textAlign: 'left',
      transitionDuration: '0.2s',
      transitionProperty: 'all',
      transitionTimingFunction: 'ease',
      width: '124px',
      zIndex: 20,
      WebkitFontSmoothing: 'antialiased'
    },
    iconContainer: {
      backgroundColor: 'rgb(255, 255, 255)',
      borderRadius: '44739200px',
      boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px',
      color: 'rgb(0, 0, 0)',
      cursor: 'pointer',
      display: 'block',
      fontFamily: 'Arial',
      height: '42.6667px',
      marginInlineEnd: '8px',
      marginInlineStart: '0px',
      padding: '2px',
      textAlign: 'left',
      unicodeBidi: 'isolate',
      width: '40px',
      WebkitFontSmoothing: 'antialiased'
    },
    displayName: {
      color: 'rgb(0, 0, 0)',
      cursor: 'pointer',
      display: 'block',
      fontFamily: 'Arial',
      fontSize: '13.3333px',
      height: '75.6667px',
      textAlign: 'left',
      unicodeBidi: 'isolate',
      width: '60px',
      WebkitFontSmoothing: 'antialiased'
    },
    content: {
      color: 'oklch(0.373 0.034 259.733)',
      cursor: 'pointer',
      display: 'block',
      fontFamily: '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      fontSize: '14px',
      height: '59.5px',
      lineHeight: '22.75px',
      marginBottom: '16px',
      paddingInlineEnd: '4px',
      paddingInlineStart: '4px',
      textWrap: 'wrap',
      unicodeBidi: 'isolate',
      whiteSpaceCollapse: 'preserve',
      width: '100%',
      WebkitFontSmoothing: 'antialiased'
    },
    reactionContainer: {
      alignItems: 'center',
      cursor: 'pointer',
      display: 'flex',
      fontFamily: '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      height: '36.6667px',
      justifyContent: 'space-between',
      paddingTop: '8px',
      unicodeBidi: 'isolate',
      width: '505.333px',
      WebkitFontSmoothing: 'antialiased'
    },
    reactionButton: {
      cursor: 'pointer',
      display: 'flex',
      fontFamily: '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      height: '36.6667px',
      unicodeBidi: 'isolate',
      width: '143.833px',
      WebkitFontSmoothing: 'antialiased'
    }
  };

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
            {post.profileImage ? (
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-md flex-shrink-0">
                <img
                  src={post.profileImage}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white font-bold text-lg" style="background-color: #84cc16">U</div>';
                  }}
                />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0"
                style={{ backgroundColor: '#84cc16' }}
              >
                U
              </div>
            )}
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
          <div
            className="post-text-content text-[14px] text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed [&_a]:text-[#1d9bf0] [&_a]:no-underline line-clamp-3"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
            dangerouslySetInnerHTML={{ __html: processHtmlContent(post.content) }}
          />
        </div>

        {/* 画像 */}
        {post.image && (
          <div className="mb-4 rounded-3xl overflow-hidden border border-slate-50 shadow-sm">
            <img
              src={post.image}
              alt=""
              className="w-full h-auto object-cover max-h-[400px]"
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

            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="pokepoke-btn-circle border-none shadow-sm text-slate-400"
            >
              <Send size={18} />
            </button>
          </div>
        )}
      </div>

      {/* いいねしたユーザーモーダル */}
      {showLikeModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[10000] p-4"
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
                      <div className="w-10 h-10 rounded-full overflow-hidden shadow-md flex-shrink-0 ml-5">
                        <img
                          src={user.profile_image || "/default-avatar.png"}
                          alt="avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                        />
                      </div>
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
