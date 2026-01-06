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

const TreasureCommentBottomSheet = ({ postId, onClose, onCommentAdded }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editorContent, setEditorContent] = useState("");
    const API_URL = import.meta.env.VITE_API_URL || "";
    const user = JSON.parse(localStorage.getItem("user")) || {};
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
                placeholder: "メッセージを送る...",
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

    // 🔹 コメント一覧取得
    const fetchComments = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`${API_URL}/api/treasure_posts/${postId}/comments/`, {
                headers: { Authorization: `Token ${token}` }
            });
            setComments(res.data);
        } catch (err) {
            console.error("コメント取得エラー:", err);
        } finally {
            setLoading(false);
        }
    };

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
                `${API_URL}/api/treasure_posts/${postId}/comments/`,
                {
                    content: htmlContent,
                    user_name: user.displayName || "匿名"
                },
                {
                    headers: { Authorization: `Token ${token}` }
                }
            );

            editor.commands.clearContent();
            setEditorContent("");
            await fetchComments();
            if (onCommentAdded) onCommentAdded();
        } catch (err) {
            console.error("コメント送信エラー:", err);
        }
    };

    // コメント内のリンク処理
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
            <motion.div
                className="fixed inset-0 flex justify-center items-end z-[2000]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                {/* 背景（半透明＋ぼかし） */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                {/* コメントボックス */}
                <motion.div
                    className="relative bg-white w-full max-w-lg rounded-t-[32px] p-8 shadow-2xl"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", stiffness: 220, damping: 28 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ドラッグハンドル */}
                    <div className="w-10 h-1 bg-gray-100 rounded-full mx-auto mb-8" />

                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-xl text-slate-800 tracking-tight">コメント</h3>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-green-50 transition-all active:scale-95 border-none"
                        >
                            <IoClose size={24} className="text-green-500" />
                        </button>
                    </div>

                    {/* コメント一覧 */}
                    <div className="max-h-[55vh] overflow-y-auto mb-8 pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
                            </div>
                        ) : comments.length > 0 ? (
                            <div className="space-y-6">
                                {comments.map((c, i) => (
                                    <div key={i} className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm overflow-hidden flex-shrink-0 border border-slate-50 shadow-sm">
                                            {c.user_name?.charAt(0) || "U"}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2 mb-1.5">
                                                <p className="font-bold text-[14px] text-slate-700">
                                                    {c.user_name || "匿名"}
                                                </p>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(c.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                                                <div
                                                    className="text-[13px] text-slate-600 leading-relaxed comment-body-html"
                                                    onClick={handleCommentClick}
                                                    dangerouslySetInnerHTML={{ __html: c.content }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-slate-400 text-[13px] font-medium leading-loose">
                                    まだコメントはありません。
                                </p>
                            </div>
                        )}
                    </div>

                    {/* コメント入力 */}
                    <div className="flex items-end gap-3 bg-green-50/50 p-2 rounded-2xl border border-green-100 focus-within:border-green-300 focus-within:bg-white transition-all">
                        <div className="flex-1 min-h-[44px] tiptap-treasure-editor">
                            <EditorContent editor={editor} />
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!editor || (editor.isEmpty && editorContent === "")}
                            className="bg-green-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-green-600 disabled:opacity-30 disabled:grayscale transition-all transform active:scale-95 shadow-lg shadow-green-200 text-sm border-none mb-1"
                        >
                            送信
                        </button>
                    </div>
                </motion.div>
            </motion.div>
            <style jsx="true">{`
                .tiptap-treasure-editor .ProseMirror {
                    min-height: 44px;
                    padding: 10px 12px;
                    outline: none;
                    font-size: 14px;
                    line-height: 1.5;
                    color: #334155;
                }
                .tiptap-treasure-editor .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #94a3b8;
                    pointer-events: none;
                    height: 0;
                }
                .comment-body-html .mention {
                    color: #16a34a;
                    background-color: rgba(22, 163, 74, 0.1);
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

export default TreasureCommentBottomSheet;
