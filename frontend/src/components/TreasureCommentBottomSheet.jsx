import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoImageOutline } from "react-icons/io5";
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

const TreasureCommentBottomSheet = ({ postId, onClose, onCommentAdded }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editorContent, setEditorContent] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef(null);
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

    // 🔹 画像選択ハンドラ
    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // ユーザー要望により240pxに制限
            const optimizedFile = await optimizeImage(file, 240);

            if (!auth.currentUser) {
                await signInAnonymously(auth);
            }

            const storageRef = ref(storage, `treasure_comments/${Date.now()}_${file.name}`);
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
        if (!editor || editor.isEmpty) return;

        const htmlContent = editor.getHTML();
        const token = localStorage.getItem("token");

        try {
            await axios.post(
                `${API_URL}/api/treasure_posts/${postId}/comments/`,
                {
                    content: htmlContent,
                    user_name: user.displayName || "匿名",
                    image_url: selectedImage
                },
                {
                    headers: { Authorization: `Token ${token}` }
                }
            );

            editor.commands.clearContent();
            setEditorContent("");
            setSelectedImage(null);
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
                                                {c.image_url && (
                                                    <div className="mt-2 rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] max-w-[200px] border-none">
                                                        <img
                                                            src={c.image_url}
                                                            alt="comment attachment"
                                                            className="w-full h-auto cursor-pointer"
                                                            onClick={() => window.open(c.image_url, '_blank')}
                                                        />
                                                    </div>
                                                )}
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
                    <div className="flex flex-col gap-3">
                        {selectedImage && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 px-1 mb-4">
                                <div className="relative inline-block group">
                                    <div className="relative rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-none">
                                        <img src={selectedImage} alt="preview" className="w-[140px] h-[140px] object-cover" />
                                    </div>
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-white text-slate-500 hover:text-red-500 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-none p-1.5 transition-all active:scale-90 z-30"
                                    >
                                        <IoClose size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-end gap-3 bg-green-50/50 p-2 rounded-2xl border border-green-100 focus-within:border-green-300 focus-within:bg-white transition-all relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden-mobile-input"
                                accept="image/*"
                                onChange={handleImageSelect}
                            />

                            <button
                                onClick={() => fileInputRef.current.click()}
                                disabled={isUploading}
                                className="p-2.5 text-green-500 transition-all shrink-0 outline-none mb-0.5 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-full hover:shadow-md border-none"
                            >
                                {isUploading ? (
                                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <IoImageOutline size={28} />
                                )}
                            </button>

                            <div className="flex-1 min-h-[44px] tiptap-treasure-editor notranslate" translate="no">
                                <EditorContent editor={editor} />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!editor || (editor.isEmpty && editorContent === "")}
                                className="bg-green-500 text-white font-black px-6 py-2.5 rounded-xl hover:bg-green-600 disabled:opacity-30 disabled:grayscale transition-all transform active:scale-95 shadow-lg shadow-green-200 text-sm border-none mb-0.5 min-w-[70px]"
                            >
                                送信
                            </button>
                        </div>
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
