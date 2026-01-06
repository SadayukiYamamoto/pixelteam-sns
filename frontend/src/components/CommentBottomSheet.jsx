import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🟦 Tiptap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import suggestion from "./tiptap/suggestion";
import { OGPCard } from "../extentions/OGPCard";

const CommentBottomSheet = ({ postId, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState("");
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

  // 初回ロード
  useEffect(() => {
    fetchComments();
  }, [postId]);

  // 🔹 コメント送信
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!editor || editor.isEmpty) return;

    const htmlContent = editor.getHTML();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API_URL}/api/posts/${postId}/comments/`,
        { content: htmlContent },
        { headers: { Authorization: `Token ${token}` } }
      );

      editor.commands.clearContent();
      setEditorContent("");
      await fetchComments();
      window.dispatchEvent(new Event("comment-updated"));
    } catch (err) {
      console.error("コメント送信エラー:", err);
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex justify-center items-end z-[101]">
        {/* 背景 */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* コメントボックス */}
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
          <div className="shrink-0 flex items-center justify-between" style={{ height: '78px', padding: '0 20px', marginTop: '20px', marginBottom: '20px' }}>
            <h3 className="font-black text-[22px] text-slate-800 tracking-tight" style={{ margin: 0 }}>コメント</h3>
            <button
              onClick={onClose}
              className="bg-white rounded-full text-slate-600 hover:bg-slate-50 transition-all active:scale-90 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.16)] border border-slate-200 z-10"
              style={{ width: '44px', height: '44px' }}
            >
              <IoClose size={26} />
            </button>
          </div>

          {/* コメント一覧 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ backgroundColor: '#f3f4f6' }}>
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent"></div>
              </div>
            ) : comments.length > 0 ? (
              <div className="py-2">
                {comments.map((c, i) => (
                  <div key={i} className="flex items-start bg-white mb-0.5 last:mb-0" style={{ padding: '12px', gap: '16px' }}>
                    <img
                      src={c.profile_image || "/default-avatar.png"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover shadow-sm bg-white p-0.5"
                      style={{ marginLeft: '12px' }}
                      onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center" style={{ gap: '12px', marginBottom: '6px' }}>
                        <p className="font-black text-[14px] text-slate-900 truncate tracking-tight">
                          {c.display_name || "匿名"}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div
                        className="text-slate-600 text-[14px] leading-relaxed comment-body-html"
                        onClick={handleCommentClick}
                        dangerouslySetInnerHTML={{ __html: c.content }}
                      />
                    </div>
                  </div>
                ))}
                <div className="h-20" /> {/* 余白 */}
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
          <div className="bg-white shrink-0 flex justify-center" style={{ padding: '16px 0 32px' }}>
            <div className="flex items-center bg-slate-50 transition-all shadow-inner overflow-hidden"
              style={{
                width: '429.333px',
                height: '69px',
                border: `1.333px solid ${(!editor || (editor.isEmpty && editorContent === "")) ? '#f1f5f9' : '#10b981'}`,
                borderRadius: '34.5px',
                padding: '8px',
                position: 'relative'
              }}>
              <div className="tiptap-comment-editor" style={{ width: '330px' }}>
                <EditorContent editor={editor} />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!editor || (editor.isEmpty && editorContent === "")}
                className="font-black transition-all text-sm border-none flex items-center justify-center shrink-0"
                style={{
                  height: '53px',
                  width: '80px',
                  borderRadius: '26.5px',
                  padding: '0',
                  backgroundColor: (!editor || (editor.isEmpty && editorContent === "")) ? '#e5e7eb' : '#10b981',
                  color: '#ffffff',
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                投稿
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        
        .tiptap-comment-editor .ProseMirror {
          min-height: 53px;
          outline: none;
          font-size: 15px;
          color: #1e293b;
          display: flex;
          align-items: center;
          padding: 0 16px;
          line-height: 1.2;
        }
        
        .tiptap-comment-editor .ProseMirror p {
          margin: 0;
          width: 100%;
        }
        
        .tiptap-comment-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        .comment-body-html .mention {
          color: #1d9bf0;
          background-color: rgba(29, 155, 240, 0.1);
          border-radius: 4px;
          padding: 0px 4px;
          font-weight: 500;
          cursor: pointer;
        }
        .comment-body-html .mention:hover {
          text-decoration: underline;
        }
      `}</style>
    </AnimatePresence>
  );
};

export default CommentBottomSheet;
