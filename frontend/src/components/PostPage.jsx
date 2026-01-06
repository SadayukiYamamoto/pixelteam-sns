// src/components/PostPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInAnonymously } from "firebase/auth";
import { app, auth } from "../firebase";

// 🟦 Tiptap 必要最低限
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Mention from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import suggestion from "./tiptap/suggestion";
import hashtagSuggestion from "./tiptap/hashtagSuggestion";
import { OGPCard } from "../extentions/OGPCard";
import Placeholder from "@tiptap/extension-placeholder";
import "./PostPage.css";

// 🟦 React Icons
import {
  FiBold,
  FiUnderline,
  FiCode,
  FiLink,
  FiImage,
  FiMessageSquare,
  FiArrowLeft,
  FiLayout,
  FiMoreHorizontal,
} from "react-icons/fi";




export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const storage = getStorage(app);
  const [category, setCategory] = useState("雑談");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const currentUserId = localStorage.getItem("userId");


  // 🟦 Editor 設定
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: true,
        codeBlock: true,
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          style:
            "max-width:100%; height:auto; border-radius:10px; margin:12px 0;",
        },
      }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Underline, // Add Underline extension
      Link.configure({ // Add Link extension
        openOnClick: false,
        autolink: true,
      }),
      OGPCard,
      Placeholder.configure({
        placeholder: "今日はどうする？",
        emptyNodeClass: "editor-placeholder",
      }),
      // メンション（@）
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: suggestion,
      }),
      // ハッシュタグ（#）
      Mention.extend({
        name: 'hashtag',
      }).configure({
        HTMLAttributes: {
          class: 'hashtag',
        },
        suggestion: hashtagSuggestion,
      }),
    ],

    content: "",

    onUpdate({ editor }) {
      setContent(editor.getHTML());

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

  // 🔹 Django API から現在の投稿情報を取得（編集時）
  useEffect(() => {
    const fetchPost = async () => {
      if (!id || !editor) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axiosClient.get(`posts/${id}/`);
        // 🔹 既に内容がある場合は上書きしない（基本は初期ロードのみ）
        if (editor.isEmpty) {
          editor.commands.setContent(res.data.content);
        }
        setCategory(res.data.category || "雑談");
      } catch (err) {
        console.error("❌ 投稿取得失敗:", err);
      }
    };
    fetchPost();
  }, [id, editor]);

  // 🔹 プロフィール取得 (is_secretaryチェック用)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUserId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axiosClient.get(`mypage/${currentUserId}/`);
        setUserProfile(res.data);
      } catch (err) {
        console.error("❌ プロフィール取得失敗:", err);
      }
    };
    fetchProfile();
  }, [currentUserId]);


  // Firebase Upload
  const uploadImage = async (file) => {
    // 🔥 認証チェック & 自動匿名ログイン
    if (!auth.currentUser) {
      try {
        console.log("🔐 非ログインのため匿名認証を開始します...");
        await signInAnonymously(auth);
      } catch (error) {
        console.error("❌ 匿名ログイン失敗:", error);
      }
    }

    const fileRef = ref(storage, `posts/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  // WebP変換 & リサイズ
  const convertToWebP = (file) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1000; // 投稿用なら1000pxあれば十分

        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([blob], fileName, { type: "image/webp" });
            resolve(webpFile);
          },
          "image/webp",
          0.8 // 品質
        );
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleInsertImage = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    // WebPへ変換
    file = await convertToWebP(file);

    const tempId = `temp-${Date.now()}`;

    // プレースホルダー（imgとして挿入）
    editor
      .chain()
      .focus()
      .setImage({
        src: "",
        alt: tempId,
        style: "width:100%;height:230px;background:#e5e7eb;border-radius:12px;object-fit:cover;"
      })
      .run();

    // Firebase アップロード
    const url = await uploadImage(file);

    // プレースホルダー置換
    replacePlaceholderImage(editor, tempId, url);
  };

  const replacePlaceholderImage = (editor, tempId, realUrl) => {
    const { state } = editor;
    const tr = state.tr;
    state.doc.descendants((node, pos) => {
      if (node.type.name === "image" && node.attrs.alt === tempId) {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          src: realUrl,
          alt: "",
          style: "max-width:100%;height:auto;border-radius:12px;margin:12px 0;"
        });
      }
    });
    editor.view.dispatch(tr);
  };

  // 投稿処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("title", "Pixtter");

    // Transform HTML content for persistence
    let finalContent = content;

    // Use DOMParser to handle HTML robustly
    const parser = new DOMParser();
    const doc = parser.parseFromString(finalContent, "text/html");

    // 1. Convert Tiptap Mentions
    // Note: Tiptap mentions are spans with data-type="mention"
    const mentions = doc.querySelectorAll('span[data-type="mention"]');
    mentions.forEach(mention => {
      const id = mention.getAttribute('data-id');
      const label = mention.innerText; // @name

      if (id === 'ALL') {
        const span = document.createElement('span');
        span.className = 'mention';
        span.style.color = '#1d9bf0';
        span.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
        span.style.borderRadius = '4px';
        span.style.padding = '0 4px';
        span.innerText = '@ALL';
        mention.replaceWith(span);
      } else {
        const link = document.createElement('a');
        link.href = `/mypage/${id}`;
        link.className = 'mention-link';
        link.style.color = '#1d9bf0';
        link.style.textDecoration = 'none';
        link.innerText = label;
        mention.replaceWith(link);
      }
    });

    // 2. Convert Tiptap Hashtags (using Mention extension named 'hashtag')
    // They are also spans with class="hashtag" based on our config
    const hashtags = doc.querySelectorAll('span.hashtag');
    hashtags.forEach(tag => {
      const label = tag.innerText; // #tag
      // remove # from ID if needed, or keep it. Search usually needs plain text.
      // label is "#test", we want "test" for url query
      const tagName = label.replace(/^#/, '');

      const link = document.createElement('a');
      link.href = `/search?tag=${tagName}`;
      link.className = 'hashtag-link';
      link.style.color = '#1d9bf0';
      link.style.textDecoration = 'none';
      link.innerText = label;

      tag.replaceWith(link);
    });

    // 3. Serialize back to HTML string
    // doc.body.innerHTML gives the content
    finalContent = doc.body.innerHTML;

    formData.append("content", finalContent);
    formData.append("category", category);

    try {
      if (id) {
        await axiosClient.put(
          `posts/${id}/update/`,
          formData
        );
        alert("投稿を更新しました！");
      } else {
        await axiosClient.post("posts/", formData);
        alert("投稿しました！");
      }
      navigate("/posts");
    } catch (err) {
      console.error(err);
      alert("投稿に失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const colors = [
    "#ff0000", "#0000ff", "#ffff00", "#00ff00",
    "#ff69b4", "#ffa500", "#00e5ff", "#8b4513", "#000000",
  ];

  if (!editor) {
    return null;
  }

  return (
    <div className="post-page-container">
      <div className="post-page-header">
        <button onClick={() => navigate(-1)} className="post-back-btn">
          <FiArrowLeft />
        </button>
        <h2 className="post-page-title">{id ? "投稿を編集" : "新規投稿"}</h2>
        <div style={{ width: "40px" }}></div>
      </div>

      <div className="post-page-card">
        <form onSubmit={handleSubmit} className="post-form">
          {/* カテゴリー選択 */}
          <div className="post-category-section">
            <div className="category-select-wrapper">
              <FiLayout className="category-icon" />
              <select
                className="premium-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="雑談">☕ 雑談</option>
                <option value="個人報告">📊 個人報告</option>
              </select>
            </div>
          </div>

          {/* ツールバー */}
          <div className="premium-editor-toolbar">
            <div className="toolbar-group">
              <button type="button" className="t-btn" onClick={() => editor.chain().focus().toggleBold().run()} title="太字">
                <FiBold />
              </button>
              <button type="button" className="t-btn" onClick={() => editor.chain().focus().toggleUnderline().run()} title="下線">
                <FiUnderline />
              </button>
              <button type="button" className="t-btn t-msg" onClick={() => editor.chain().focus().toggleBlockquote().run()} title="引用">
                <FiMessageSquare />
              </button>
              <button type="button" className="t-btn" onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="コード">
                <FiCode />
              </button>
              <button type="button" className="t-btn" onClick={() => {
                const url = prompt("リンクURLを入力してください");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }} title="リンク">
                <FiLink />
              </button>
              <button type="button" className="t-btn t-img" onClick={() => fileInputRef.current.click()} title="画像を追加">
                <FiImage />
              </button>
            </div>

            <div className="toolbar-divider"></div>

            <div className="color-palette">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="color-dot"
                  style={{ background: c }}
                  onClick={() => editor.chain().focus().setColor(c).run()}
                />
              ))}
            </div>
          </div>

          {/* 画像 input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleInsertImage}
          />

          {/* エディタ */}
          <div className="editor-wrapper-premium">
            <EditorContent editor={editor} className="premium-editor-content" />
          </div>

          <button type="submit" disabled={uploading} className="post-submit-btn">
            {uploading ? (
              <span className="btn-loading">
                <div className="spinner-small"></div>
                投稿中…
              </span>
            ) : (
              <span>{id ? "更新を保存する" : "今すぐ投稿する"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
