import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoImageOutline } from "react-icons/io5";
import { FiCamera } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { storage, auth } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInAnonymously } from "firebase/auth";
import { optimizeImage } from "../utils/imageOptimizer";

// 🟦 Tiptap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import suggestion from "./tiptap/suggestion";
import { OGPCard } from "../extentions/OGPCard";

// 🟦 アバターコンポーネント (画像がない・エラー時にフォールバックを表示)
const CommentAvatar = ({ src, name, size = "w-8 h-8" }) => {
  const [hasError, setHasError] = React.useState(false);

  // Tailwindクラスが動的に解決されない場合への対策としてstyleも併用
  const sizeValue = size.includes("w-10") ? "40px" : size.includes("w-8") ? "32px" : size.includes("w-6") ? "24px" : "18px";

  if (!src || hasError) {
    return (
      <div
        className={`${size} rounded-full flex items-center justify-center text-white font-bold text-[12px] shadow-sm shrink-0`}
        style={{ backgroundColor: '#84cc16', width: sizeValue, height: sizeValue }}
      >
        {(name || "名")[0]}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="avatar"
      className={`${size} rounded-full object-cover shadow-sm bg-white p-0.5 shrink-0`}
      style={{ width: sizeValue, height: sizeValue }}
      onError={() => setHasError(true)}
    />
  );
};

const CommentBottomSheet = ({ postId, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, display_name }
  const [expandedReplies, setExpandedReplies] = useState({}); // { parentId: boolean }

  const fileInputRef = React.useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "";
  const navigate = useNavigate();

  // 🟦 Tiptap Editor 設定
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      OGPCard,
      Placeholder.configure({
        placeholder: "コメントを追加...",
        emptyNodeClass: "editor-placeholder",
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: suggestion,
      }),
    ],
    content: "",
    onUpdate({ editor }) {
      setEditorContent(editor.getHTML());
      const text = editor.getText();
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = [...text.matchAll(urlRegex)];

      if (matches.length > 0) {
        matches.forEach(async (m) => {
          const url = m[0];
          if (editor.getHTML().includes(`ogp-card`)) return;
          const pos = editor.state.doc.textBetween(0, editor.state.doc.content.size).indexOf(url);
          if (pos === -1) return;
          editor
            .chain()
            .focus()
            .deleteRange({ from: pos + 1, to: pos + url.length + 1 })
            .run();
          await editor.commands.insertOGP(url);
        });
      }
    },
  });

  // 🔹 コメント一覧取得関数
  const fetchComments = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${API_URL}/api/posts/${postId}/comments/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setComments(res.data);
    } catch (err) {
      console.error("コメント取得エラー:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 画像選択ハンドラ
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const optimizedFile = await optimizeImage(file, 240);
      if (!auth.currentUser) await signInAnonymously(auth);

      const storageRef = ref(storage, `comments/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, optimizedFile);
      const url = await getDownloadURL(storageRef);
      setSelectedImage(url);
    } catch (err) {
      console.error("画像アップロードエラー:", err);
      alert("画像のアップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // 🔹 コメント送信
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!editor || editor.isEmpty || isSubmitting) return;

    setIsSubmitting(true);
    const htmlContent = editor.getHTML();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API_URL}/api/posts/${postId}/comments/`,
        {
          content: htmlContent,
          image_url: selectedImage,
          parent: replyingTo?.id || null
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      editor.commands.clearContent();
      setEditorContent("");
      setSelectedImage(null);
      setReplyingTo(null);
      await fetchComments();
      window.dispatchEvent(new Event("comment-updated"));
    } catch (err) {
      console.error("コメント送信エラー:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentClick = (e) => {
    const target = e.target.closest('span.mention');
    if (target) {
      const userId = target.getAttribute('data-id');
      if (userId) {
        navigate(`/mypage/${userId}`);
        onClose();
      }
    }
  };

  // 再帰的に返信を取得し、階層構造（ツリー）を構築する
  const getCommentTree = (parentId = null) => {
    return comments
      .filter(c => c.parent === parentId)
      .reverse() // 時系列（古い順）
      .map(c => ({
        ...c,
        replies: getCommentTree(c.id)
      }));
  };

  const commentTree = getCommentTree(null);

  const toggleReplies = (parentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }));
  };

  const handleReplyBtnClick = (comment) => {
    setReplyingTo({
      id: comment.id,
      display_name: comment.display_name,
      content: comment.content,
      profile_image: comment.profile_image
    });
    editor.commands.focus();
  };

  // 再帰的にレンダリングするコンポーネント
  const CommentNode = ({ comment, depth = 0, hasNextSibling = false }) => {
    const isExpanded = expandedReplies[comment.id];
    const replies = comment.replies || [];
    const hasReplies = replies.length > 0;

    // このスレッド以下の全ての返信者アイコンをユニークに取得（最大3名）
    const getAllDescendants = (node) => {
      let list = [];
      node.replies?.forEach(r => {
        list.push(r);
        list = list.concat(getAllDescendants(r));
      });
      return list;
    };
    const allDescendants = getAllDescendants(comment);
    const replierAvatars = Array.from(new Set(allDescendants.map(r => r.profile_image).filter(Boolean))).slice(0, 3);

    return (
      <div className="relative bg-white">
        <div
          className="flex items-start group/item"
          style={{
            padding: '12px',
            gap: '14px',
            position: 'relative',
            marginLeft: depth > 0 ? '30px' : '0'
          }}
        >
          {/* ツリー線 (コネクタ) */}
          {depth > 0 && (
            <div className="absolute left-[-16px] top-[-12px] w-[30px] h-[36px]">
              <div className="absolute left-0 top-0 bottom-[4px] w-[1.5px] bg-slate-300" />
              <div className="absolute left-0 bottom-[4px] w-[26px] h-[10px] border-b-[1.5px] border-l-[1.5px] border-slate-300" style={{ borderBottomLeftRadius: '8px' }} />
            </div>
          )}

          {/* 親から子へ続く縦線 (深度1以上で、さらに兄弟または開かれた子がある場合) */}
          {((depth > 0 && hasNextSibling) || (depth > 0 && hasReplies && isExpanded)) && (
            <div className="absolute left-[-16px] top-[24px] bottom-0 w-[1.5px] bg-slate-300" />
          )}

          {/* 第一階層(depth=0)から子へ繋ぐ線 */}
          {depth === 0 && (hasReplies && isExpanded) && (
            <div className="absolute left-[28px] top-[44px] bottom-0 w-[1.5px] bg-slate-200" />
          )}

          <div className="flex-shrink-0 relative z-10">
            <CommentAvatar src={comment.profile_image} name={comment.display_name} size={depth > 0 ? "w-6 h-6" : "w-8 h-8"} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center" style={{ gap: '10px', marginBottom: '2px' }}>
              <p className="font-black text-[13px] text-slate-900 truncate tracking-tight">
                {comment.display_name || "匿名"}
              </p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <div
              className="text-slate-600 text-[13px] leading-relaxed comment-body-html"
              onClick={handleCommentClick}
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
            {comment.image_url && (
              <div className="mt-2.5 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] max-w-[180px] border-none">
                <img
                  src={comment.image_url}
                  alt="comment attachment"
                  className="w-full h-auto cursor-pointer"
                  onClick={() => window.open(comment.image_url, '_blank')}
                />
              </div>
            )}

            {/* アクション: 返信 + 展開ボタン */}
            <div className="mt-1 flex items-center gap-4">
              <button
                onClick={() => handleReplyBtnClick(comment)}
                style={{ color: '#10b981' }}
                className="text-[11px] font-black hover:opacity-70 transition-colors bg-transparent border-none p-0 cursor-pointer"
              >
                返信する
              </button>

              {hasReplies && !isExpanded && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center gap-2 hover:opacity-70 transition-all bg-transparent border-none p-0 cursor-pointer"
                >
                  <div className="flex -space-x-1">
                    {replierAvatars.map((url, i) => (
                      <div key={i} className="rounded-full overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.12)] bg-white flex-shrink-0" style={{ width: '18px', height: '18px' }}>
                        <img src={url} alt="replier" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {replierAvatars.length === 0 && <div className="rounded-full bg-slate-100 shadow-sm" style={{ width: '18px', height: '18px' }} />}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    他{allDescendants.length}件の返信を表示
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 子要素（再帰） */}
        <AnimatePresence>
          {hasReplies && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="relative" style={{ paddingLeft: '30px' }}>
                {replies.map((r, idx) => (
                  <CommentNode
                    key={r.id}
                    comment={r}
                    depth={depth + 1}
                    hasNextSibling={idx < replies.length - 1}
                  />
                ))}
                <div style={{ paddingLeft: '44px' }} className="py-1">
                  <button
                    onClick={() => toggleReplies(comment.id)}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                  >
                    返信を閉じる
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div key="comment-bottom-sheet-root" className="fixed inset-0 flex justify-center items-end z-[10000]">
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="relative bg-white w-full max-w-[480px] rounded-t-[32px] overflow-hidden shadow-2xl flex flex-col"
          style={{ height: '85vh' }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 250, mass: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between" style={{ height: '70px', padding: '0 20px', marginTop: '10px' }}>
            <h3 className="font-black text-[20px] text-slate-800 tracking-tight" style={{ margin: 0 }}>コメント</h3>
            <button
              onClick={onClose}
              className="bg-white rounded-full text-slate-600 hover:bg-slate-50 transition-all active:scale-90 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.16)] border border-slate-200 z-10"
              style={{ width: '40px', height: '40px' }}
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* コメント一覧 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ backgroundColor: '#f3f4f6' }}>
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent"></div>
              </div>
            ) : commentTree.length > 0 ? (
              <div className="py-2">
                {commentTree.map((c, idx) => (
                  <CommentNode
                    key={c.id}
                    comment={c}
                    depth={0}
                    hasNextSibling={idx < commentTree.length - 1}
                  />
                ))}
                <div className="h-20" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-30 py-20">
                <div className="relative mb-8 flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-slate-200 rounded-full flex items-center justify-center">
                    <IoClose size={24} className="text-slate-200" />
                  </div>
                </div>
                <p className="text-slate-400 text-sm font-bold text-center leading-loose">
                  まだコメントはありません。<br />
                  最初のコメントを投稿してみましょう！
                </p>
              </div>
            )}
          </div>

          {/* 固定入力フォーム */}
          <div className="bg-white shrink-0 flex flex-col items-center shadow-[0_-10px_40px_rgba(0,0,0,0.08)] relative z-[11]" style={{ padding: '16px 20px 32px' }}>
            {/* 返信先インジケーター (Google Chat スタイル改善版) */}
            {replyingTo && (
              <div className="w-full max-w-[429.333px] relative mb-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white rounded-2xl p-3 pr-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-none relative">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CommentAvatar src={replyingTo.profile_image} name={replyingTo.display_name} size="w-4 h-4" />
                    <span className="text-[12px] font-black text-slate-700">{replyingTo.display_name}</span>
                  </div>

                  <div
                    className="text-[11px] text-slate-400 line-clamp-1 opacity-90 pl-0"
                    dangerouslySetInnerHTML={{ __html: replyingTo.content }}
                  />

                  <button
                    onClick={() => setReplyingTo(null)}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-all active:scale-90 border-none cursor-pointer"
                  >
                    <IoClose size={16} />
                  </button>
                </div>
              </div>
            )}

            {selectedImage && (
              <div className="w-full max-w-[429.333px] mb-4 animate-in fade-in slide-in-from-bottom-2 px-2">
                <div className="relative inline-block group">
                  <div className="relative rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
                    <img src={selectedImage} alt="preview" className="w-[120px] h-[120px] object-cover" />
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-white text-slate-500 hover:text-red-500 rounded-full shadow-lg border-none p-1 z-30"
                  >
                    <IoClose size={18} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center bg-white transition-all shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden"
              style={{
                width: '100%',
                maxWidth: '429.333px',
                height: '60px',
                borderRadius: '30px',
                padding: '5px',
                position: 'relative',
                gap: '6px'
              }}>

              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />

              <button
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading || isSubmitting}
                className="flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all shrink-0 bg-slate-50 rounded-full border-none"
                style={{ width: '46px', height: '46px' }}
              >
                {isUploading ? <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : <IoImageOutline size={24} />}
              </button>

              <div className="tiptap-comment-editor flex-1 notranslate" translate="no">
                <EditorContent editor={editor} />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!editor || (editor.isEmpty && editorContent === "") || isSubmitting}
                className="font-black transition-all text-[14px] border-none flex items-center justify-center shrink-0"
                style={{
                  height: '48px',
                  width: '76px',
                  borderRadius: '24px',
                  backgroundColor: (!editor || (editor.isEmpty && editorContent === "") || isSubmitting) ? '#f3f4f6' : '#10b981',
                  color: (!editor || (editor.isEmpty && editorContent === "") || isSubmitting) ? '#94a3b8' : '#ffffff',
                }}
              >
                {isSubmitting ? "..." : "投稿"}
              </button>
            </div>
          </div>
          <style jsx="true">{`
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            .tiptap-comment-editor { position: relative; width: 100%; height: 100%; display: flex; align-items: center; }
            .tiptap-comment-editor .ProseMirror { outline: none; font-size: 14px; color: #1e293b; width: 100%; padding: 0 12px; line-height: 1.2; }
            .tiptap-comment-editor .ProseMirror p { margin: 0; }
            .tiptap-comment-editor .ProseMirror p.is-editor-empty:first-child::before {
              content: attr(data-placeholder);
              float: left;
              color: #cbd5e1;
              pointer-events: none;
              height: 0;
            }
            .comment-body-html .mention { color: #1d9bf0; background-color: rgba(29, 155, 240, 0.1); border-radius: 4px; padding: 0px 4px; font-weight: 500; cursor: pointer; }
            .comment-body-html .mention:hover { text-decoration: underline; }
          `}</style>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommentBottomSheet;
