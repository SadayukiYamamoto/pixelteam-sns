// src/admin/NoticeAdminEditor.jsx
import React, { useEffect, useState, useRef } from "react";
import "./NoticeAdminEditor.css";
import { uploadImageToFirebase } from "../utils/uploadImageToFirebase";
import NoticePreviewModal from "../components/NoticePreviewModal";
import { auth } from "../firebase";
import axiosClient from "../api/axiosClient";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

// Tiptap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

// React Icons
import { FiBold, FiUnderline, FiLink, FiImage, FiMessageSquare, FiCode, FiEye, FiSave } from "react-icons/fi";

// Colors for palette
const colors = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#000000"];

export default function NoticeAdminEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [authLoaded, setAuthLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Notice fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("事務局だより");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePosition, setImagePosition] = useState("header");
  const [body, setBody] = useState("");

  const fileRef = useRef(null);

  // Firebase Auth ロード
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthLoaded(true);
    });
    return () => unsub();
  }, []);

  // Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: true,
        codeBlock: true,
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          style: "max-width:100%; height:auto; border-radius:12px; margin:24px auto; display:block;",
        },
      }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder: "お知らせの本文を入力してください...",
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setBody(editor.getHTML());
    },
  });

  // 編集モードの読み込み
  useEffect(() => {
    if (isEdit && authLoaded) loadNotice();
  }, [isEdit, authLoaded]);

  const loadNotice = async () => {
    try {
      const res = await axiosClient.get(`notices/${id}/`);
      const n = res.data;

      setTitle(n.title);
      setCategory(n.category);
      setImageUrl(n.image_url || "");
      setImagePosition(n.image_position || "header");

      if (editor) editor.commands.setContent(n.body || "");
    } catch (err) {
      console.error("編集データ取得エラー:", err);
    }
  };

  // 本文画像挿入
  const triggerImageSelect = () => fileRef.current.click();

  const handleInsertImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadImageToFirebase(file, "notice-body-images");
    editor.chain().focus().setImage({ src: url }).run();
  };

  // サムネイルアップロード
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImageToFirebase(file, "notice-thumbnails");
    setImageUrl(url);
  };

  // 投稿 or 更新
  const handleSubmit = async () => {
    const payload = {
      title,
      category,
      body,
      image_url: imageUrl,
      image_position: imagePosition,
      text_color: "#000000",
      admin_name: "事務局",
    };

    try {
      if (isEdit) {
        await axiosClient.put(`notices/${id}/`, payload);
        alert("更新しました！");
      } else {
        await axiosClient.post(`notices/`, payload);
        alert("投稿しました！");
      }
      navigate("/admin/notices");
    } catch (err) {
      console.error(err);
      alert("投稿に失敗しました");
    }
  };

  return (
    <div className="home-container">
      <div className="admin-wrapper">
        <Header title={isEdit ? "お知らせ編集" : "お知らせ作成"} />
        <div className="max-w-4xl mx-auto pt-10 px-4">
          {!authLoaded ? (
            <div className="p-10 text-center">読み込み中...</div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-3xl">📢</span> お知らせ{isEdit ? "編集" : "作成"}
                </h1>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-none text-gray-700 font-bold rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
                  >
                    <FiEye /> プレビュー
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all hover:shadow-lg transform active:scale-95"
                  >
                    <FiSave /> {isEdit ? "更新する" : "公開する"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/40 border-none">
                    <label className="block text-sm font-bold text-gray-700 mb-2">タイトル <span className="text-red-500">*</span></label>
                    <input
                      className="w-full text-xl font-bold px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-gray-50/30 outline-none transition-all shadow-inner"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="お知らせのタイトルを入力"
                    />
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border-none overflow-hidden">
                    <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-50 flex flex-wrap gap-2 items-center">
                      {editor && (
                        <>
                          <button className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600'}`} onClick={() => editor.chain().focus().toggleBold().run()} title="太字">
                            <FiBold size={18} />
                          </button>
                          <button className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('underline') ? 'bg-gray-200 text-black' : 'text-gray-600'}`} onClick={() => editor.chain().focus().toggleUnderline().run()} title="下線">
                            <FiUnderline size={18} />
                          </button>
                          <div className="w-px h-6 bg-gray-300 mx-1"></div>
                          <button className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('blockquote') ? 'bg-gray-200 text-black' : 'text-gray-600'}`} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="引用">
                            <FiMessageSquare size={18} />
                          </button>
                          <button className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('codeBlock') ? 'bg-gray-200 text-black' : 'text-gray-600'}`} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="コード">
                            <FiCode size={18} />
                          </button>
                          <button className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600" onClick={() => {
                            const url = prompt("リンクURLを入力");
                            if (url) editor.chain().focus().setLink({ href: url }).run();
                          }} title="リンク">
                            <FiLink size={18} />
                          </button>
                          <button className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600" onClick={triggerImageSelect} title="画像挿入">
                            <FiImage size={18} />
                          </button>
                          <div className="w-px h-6 bg-gray-300 mx-1"></div>
                          <div className="flex gap-1">
                            {colors.map(c => (
                              <button
                                key={c}
                                type="button"
                                className={`w-5 h-5 rounded-full border border-gray-200 transition-transform hover:scale-110 ${editor.isActive('textStyle', { color: c }) ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                                style={{ background: c }}
                                onClick={() => editor.chain().focus().setColor(c).run()}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleInsertImage}
                      />
                    </div>
                    <div className="p-6 min-h-[400px]">
                      <EditorContent editor={editor} className="prose max-w-none focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl shadow-xl shadow-gray-200/40 border-none">
                    <label className="block text-sm font-bold text-gray-700 mb-3">カテゴリー</label>
                    <select
                      className="w-full px-4 py-2.5 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-gray-50 shadow-inner"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>事務局だより</option>
                      <option>イベント</option>
                      <option>キャンペーン</option>
                      <option>PixelDrop</option>
                      <option>商品情報</option>
                      <option>アップデート</option>
                      <option>その他</option>
                    </select>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-3">ヘッダー画像</label>
                    <div className="mb-4">
                      {imageUrl ? (
                        <div className="relative group rounded-xl overflow-hidden border border-gray-200">
                          <img src={imageUrl} alt="Thumbnail settings" className="w-full h-auto object-cover" />
                          <button
                            onClick={() => document.getElementById('thumb-upload').click()}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                          >
                            変更する
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => document.getElementById('thumb-upload').click()}
                          className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <FiImage size={24} className="mb-2" />
                          <span className="text-xs font-bold">画像を選択 / D&D</span>
                        </div>
                      )}
                      <input id="thumb-upload" type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                    </div>

                    {imageUrl && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">表示位置</label>
                        <div className="grid grid-cols-2 gap-2">
                          {["header", "top", "bottom", "hidden"].map((pos) => (
                            <button
                              key={pos}
                              onClick={() => setImagePosition(pos)}
                              className={`px-2 py-1.5 text-xs font-bold rounded-lg border transition-all ${imagePosition === pos
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                              {pos === "header" && "ヘッダー(背景)"}
                              {pos === "top" && "記事上部"}
                              {pos === "bottom" && "記事下部"}
                              {pos === "hidden" && "表示しない"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Navigation activeTab="mypage" />
      {showPreview && (
        <NoticePreviewModal
          title={title}
          category={category}
          image_url={imageUrl}
          body={body}
          image_position={imagePosition}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
