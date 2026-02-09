// src/components/PostPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInAnonymously } from "firebase/auth";
import { app, auth } from "../firebase";
import { optimizeImage } from "../utils/imageOptimizer";

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
  const [shopName, setShopName] = useState("");
  // 🔹 一度キャンセル（拒否）したURLを記録するリスト
  const dismissedUrls = useRef(new Set());

  const STORES = [
    "ヨドバシカメラ マルチメディアAkiba",
    "ヨドバシカメラ マルチメディア横浜",
    "ヨドバシカメラ マルチメディア梅田",
    "ヨドバシカメラ マルチメディア京都",
    "ヨドバシカメラ マルチメディア博多",
    "ヨドバシカメラ マルチメディア仙台",
    "ヨドバシカメラ新宿西口本店",
    "ヨドバシカメラ マルチメディア吉祥寺",
    "ヨドバシカメラ マルチメディア川崎ルフロン",
    "ヨドバシカメラ マルチメディア札幌"
  ];


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

          // 既にカード化されている、または「このセッションで拒否した」URLは無視する
          if (editor.getHTML().includes(`data-url="${url}"`) || dismissedUrls.current.has(url)) return;

          // ユーザーに確認
          const shouldConvert = window.confirm(`リンクカードを作成しますか？\n${url}`);

          if (shouldConvert) {
            const pos = editor.state.doc.textBetween(0, editor.state.doc.content.size).indexOf(url);
            if (pos === -1) return;
            editor
              .chain()
              .focus()
              .deleteRange({ from: pos + 1, to: pos + url.length + 1 })
              .run();
            await editor.commands.insertOGP(url);
          } else {
            // ❌ キャンセルされた場合、無視リストに追加して二度と聞かないようにする
            dismissedUrls.current.add(url);
          }
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
        setShopName(res.data.shop_name || "");
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

  // handleInsertImage
  const handleInsertImage = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      // WebPへ変換 & リサイズ (1000px)
      file = await optimizeImage(file, 1000);

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
    } catch (err) {
      console.error("画像アップロード失敗:", err);
      alert("画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
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

    // 3. Robust conversion for plain text hashtags (for cases where suggestion dropdown isn't used)
    // We only do this for hashtags where we don't need a specific ID (just the tag name).
    // iterate over text nodes that are not inside links
    const textNodes = [];
    const walk = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
    let n;
    while (n = walk.nextNode()) {
      if (n.parentElement.closest('a') || n.parentElement.closest('.mention') || n.parentElement.closest('.hashtag')) {
        continue;
      }
      textNodes.push(n);
    }

    textNodes.forEach(node => {
      const text = node.nodeValue;
      const combinedRegex = /(^|\s)(#[^\s!@#$%^&*()=+.\/,\[\]{};:'"?><]+|@[^\s!@#$%^&*()=+.\/,\[\]{};:'"?><]+)/g;

      if (combinedRegex.test(text)) {
        const span = document.createElement('span');
        span.innerHTML = text.replace(combinedRegex, (match, space, tag) => {
          if (tag.startsWith('#')) {
            const tagName = tag.replace(/^#/, '');
            return `${space}<a href="/search?tag=${tagName}" class="hashtag-link" style="color:#1d9bf0; text-decoration:none;">${tag}</a>`;
          } else {
            // Plain text mention (fallback)
            const name = tag.replace(/^@/, '');
            return `${space}<a href="/search?q=${name}" class="mention" style="color:#1d9bf0; background-color:rgba(29,155,240,0.1); border-radius:4px; padding:0 4px; text-decoration:none;">${tag}</a>`;
          }
        });

        // Replace node with span's children
        while (span.firstChild) {
          node.parentNode.insertBefore(span.firstChild, node);
        }
        node.parentNode.removeChild(node);
      }
    });

    // 4. Serialize back to HTML string
    finalContent = doc.body.innerHTML;

    formData.append("content", finalContent);
    formData.append("category", category);
    if (category === "個人報告") {
      formData.append("shop_name", shopName);
    }

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
            <div className="category-row">
              <div className="category-select-wrapper">
                <FiLayout className="category-icon" />
                <select
                  className="premium-category-select notranslate"
                  translate="no"
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setCategory(newCat);
                    if (newCat === "個人報告" && userProfile?.shop_name && !shopName) {
                      setShopName(userProfile.shop_name);
                    }
                  }}
                >
                  <option value="雑談">雑談</option>
                  <option value="個人報告">個人報告</option>
                </select>
              </div>

              {category === "個人報告" && (
                <div className="shop-select-wrapper animate-fade-in">
                  <select
                    className="premium-shop-select"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  >
                    <option value="">店舗を選択</option>
                    {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
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
            className="hidden-mobile-input"
            onChange={handleInsertImage}
          />

          {/* エディタ */}
          <div className="editor-wrapper-premium notranslate" translate="no">
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
