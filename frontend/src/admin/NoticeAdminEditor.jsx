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
    <div className="notice-editor-container">
      <Header title={isEdit ? "お知らせ編集" : "お知らせ作成"} />
      <div className="admin-wrapper">
        <div className="notice-editor-content">
          {!authLoaded ? (
            <div className="p-10 text-center font-bold text-gray-400">認証情報を読み込み中...</div>
          ) : (
            <>
              <div className="editor-header-bar">
                <div className="editor-title-area">
                  <h1>{isEdit ? "お知らせを編集" : "お知らせを作成"}</h1>
                </div>
                <div className="editor-actions">
                  <button onClick={() => setShowPreview(true)} className="action-btn btn-preview">
                    <FiEye size={18} /> プレビュー
                  </button>
                  <button onClick={handleSubmit} className="action-btn btn-publish">
                    <FiSave size={18} /> {isEdit ? "更新を保存" : "今すぐ公開"}
                  </button>
                </div>
              </div>

              <div className="editor-grid">
                <main className="editor-main-panel">
                  <div className="title-input-card">
                    <input
                      className="title-field"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="お知らせのタイトルを入力してください"
                    />
                  </div>

                  <div className="premium-tiptap-container">
                    <div className="tiptap-toolbar">
                      <div className="toolbar-group">
                        <button
                          type="button"
                          className={`tiptap-btn ${editor && editor.isActive('bold') ? 'is-active' : ''}`}
                          onClick={() => editor.chain().focus().toggleBold().run()}
                          title="太字"
                        >
                          <FiBold />
                        </button>
                        <button
                          type="button"
                          className={`tiptap-btn ${editor && editor.isActive('underline') ? 'is-active' : ''}`}
                          onClick={() => editor.chain().focus().toggleUnderline().run()}
                          title="下線"
                        >
                          <FiUnderline />
                        </button>
                      </div>

                      <div className="toolbar-sep"></div>

                      <div className="toolbar-group">
                        <button
                          type="button"
                          className={`tiptap-btn ${editor && editor.isActive('blockquote') ? 'is-active' : ''}`}
                          onClick={() => editor.chain().focus().toggleBlockquote().run()}
                          title="引用"
                        >
                          <FiMessageSquare />
                        </button>
                        <button
                          type="button"
                          className={`tiptap-btn ${editor && editor.isActive('codeBlock') ? 'is-active' : ''}`}
                          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                          title="コード"
                        >
                          <FiCode />
                        </button>
                      </div>

                      <div className="toolbar-sep"></div>

                      <div className="toolbar-group">
                        <button
                          type="button"
                          className="tiptap-btn"
                          onClick={() => {
                            const url = prompt("リンクURLを入力");
                            if (url) editor.chain().focus().setLink({ href: url }).run();
                          }}
                          title="リンク"
                        >
                          <FiLink />
                        </button>
                        <button
                          type="button"
                          className="tiptap-btn"
                          onClick={triggerImageSelect}
                          title="画像挿入"
                        >
                          <FiImage />
                        </button>
                      </div>

                      <div className="toolbar-sep"></div>

                      <div className="toolbar-group flex gap-2 ml-1">
                        {colors.map(c => (
                          <button
                            key={c}
                            type="button"
                            className={`tiptap-color-dot ${editor && editor.isActive('textStyle', { color: c }) ? 'is-active' : ''}`}
                            style={{ background: c }}
                            onClick={() => editor.chain().focus().setColor(c).run()}
                          />
                        ))}
                      </div>

                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleInsertImage}
                      />
                    </div>

                    <div className="tiptap-editor-content">
                      <EditorContent editor={editor} className="prose prose-slate max-w-none" />
                    </div>
                  </div>
                </main>

                <aside className="editor-sidebar">
                  <div className="sidebar-card">
                    <h3>カテゴリー</h3>
                    <select
                      className="premium-select"
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

                  <div className="sidebar-card">
                    <h3>ヘッダー画像</h3>
                    <div
                      className="sidebar-thumb-picker"
                      onClick={() => document.getElementById('thumb-upload').click()}
                    >
                      {imageUrl ? (
                        <div className="sidebar-thumb-preview">
                          <img src={imageUrl} alt="notice thumnail" />
                          <div className="thumb-change-overlay">画像を更新する</div>
                        </div>
                      ) : (
                        <>
                          <FiImage size={28} className="mb-2" />
                          <span className="text-xs font-bold">サムネイルを設定</span>
                        </>
                      )}
                    </div>
                    <input id="thumb-upload" type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />

                    {imageUrl && (
                      <div className="mt-6">
                        <h3>表示位置</h3>
                        <div className="pos-grid">
                          {[
                            { id: "header", label: "背景" },
                            { id: "top", label: "記事上" },
                            { id: "bottom", label: "記事下" },
                            { id: "hidden", label: "隠す" }
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              onClick={() => setImagePosition(pos.id)}
                              className={`pos-btn ${imagePosition === pos.id ? "active" : ""}`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </aside>
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
