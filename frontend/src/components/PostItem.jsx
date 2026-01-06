import React from 'react';
import { Heart, MessageCircleMore, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { processHtmlContent } from '../utils/contentHelper';
import { logInteraction } from '../utils/analytics';

const PostItem = ({ post, onLike, onComment, hideReactions = false, className = "", variant = "default" }) => {
  const navigate = useNavigate();
  const isFeatured = variant === "featured";

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) onLike(post.id);
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
          {/* 軽量化のため画像ではなく黄緑色のUアイコンを表示 */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
            style={{ backgroundColor: '#84cc16' }} // Tailwind lime-500相当
          >
            U
          </div>
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
            <span className="text-[13px] font-bold">{post.likes}</span>
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
  );
};

export default PostItem;
