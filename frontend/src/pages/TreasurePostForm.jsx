import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app, auth } from "../firebase";
import { optimizeImage } from "../utils/imageOptimizer";

// 🟦 Tiptap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { OGPCard } from "../extentions/OGPCard";

import "./TreasurePostForm.css";
import { FiBold, FiUnderline, FiLink, FiImage, FiMessageSquare, FiCode, FiChevronLeft } from "react-icons/fi";

export default function TreasurePostForm() {
  const { id } = useParams(); // For edit mode
  const navigate = useNavigate();
  const location = useLocation();
  const parentCategory = location.state?.parentCategory;
  const fixedCategory = location.state?.category || "";
  const API_URL = import.meta.env.VITE_API_URL || "";
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(fixedCategory || "");
  const [pCategory, setPCategory] = useState(parentCategory || "");
  const [loading, setLoading] = useState(false);

  // 🔹 新規フィールドステート
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [deviceUsed, setDeviceUsed] = useState("");
  const [anxietyNeeds, setAnxietyNeeds] = useState("");
  const [appealPoints, setAppealPoints] = useState("");
  const storage = getStorage(app);
  const user = JSON.parse(localStorage.getItem("user"));
  // 🔹 一度キャンセル（拒否）したURLを記録するリスト
  const dismissedUrls = useRef(new Set());

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
      OGPCard,
      Placeholder.configure({
        placeholder: "知恵袋を共有しましょう...",
      }),
    ],
    content: "",

    onUpdate({ editor }) {
      const text = editor.getText();
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = [...text.matchAll(urlRegex)];

      if (matches.length > 0) {
        matches.forEach(async (m) => {
          const url = m[0];
          const html = editor.getHTML();

          // Check if card for this URL already exists in editor or was dismissed
          if (html.includes(`data-url="${url}"`) || dismissedUrls.current.has(url)) return;

          // ユーザーに確認
          const shouldConvert = window.confirm(`リンクカードを作成しますか？\n${url}`);

          if (!shouldConvert) {
            // ❌ キャンセルされた場合、記録して二度と聞かない
            dismissedUrls.current.add(url);
            return;
          }

          // Find the exact position of the URL text
          const { from, to } = findUrlPosition(editor, url);
          if (from === null) return;

          // Delete the text URL and insert card
          editor.chain().focus()
            .deleteRange({ from, to })
            .run();

          await editor.commands.insertOGP(url);
        });
      }
    },
  });

  // Helper to find URL position in Tiptap doc
  function findUrlPosition(editor, url) {
    let result = { from: null, to: null };
    editor.state.doc.descendants((node, pos) => {
      if (node.isText && node.text.includes(url)) {
        const start = pos + node.text.indexOf(url);
        result = { from: start, to: start + url.length };
        return false;
      }
    });
    return result;
  }

  // Fetch data if editing
  useEffect(() => {
    if (id && editor) {
      const fetchPost = async () => {
        try {
          const res = await fetch(`${API_URL}/api/treasure_posts/${id}/`);
          const data = await res.json();
          setTitle(data.title);
          setCategory(data.category);
          setPCategory(data.parent_category);
          setAge(data.age || "");
          setGender(data.gender || "");
          setDeviceUsed(data.device_used || "");
          setAnxietyNeeds(data.anxiety_needs || "");
          setAppealPoints(data.appeal_points || "");
          editor.commands.setContent(data.content);
        } catch (err) {
          console.error("Fetch error:", err);
        }
      };
      fetchPost();
    }
  }, [id, editor]);

  const uploadImage = async (file) => {
    if (!auth.currentUser) {
      const { signInAnonymously } = await import("firebase/auth");
      await signInAnonymously(auth);
    }
    const fileRef = ref(storage, `treasure_posts/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  // WebP conversion & Resize (using optimizer)
  const handleInsertImage = async (e) => {
    let file = e.target.files[0];
    if (!file || !editor) return;

    try {
      setLoading(true);
      file = await optimizeImage(file, 1200);

      const tempId = `temp-${Date.now()}`;
      // Placeholder with shimmer-like appearance
      editor.chain().focus().setImage({
        src: "",
        alt: tempId,
        style: "width:100%; height:200px; background:#f1f5f9; border-radius:12px; margin:24px auto; display:block; border: 2px dashed #e2e8f0;"
      }).run();

      const url = await uploadImage(file);

      // Replace placeholder
      const { state } = editor;
      const tr = state.tr;
      state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.alt === tempId) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            src: url,
            alt: "",
            style: "max-width:100%; height:auto; border-radius:12px; margin:24px auto; display:block;"
          });
        }
      });
      editor.view.dispatch(tr);
    } catch (err) {
      console.error("Upload error:", err);
      alert("画像の挿入に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editor) return;
    setLoading(true);

    const payload = {
      title,
      category,
      parent_category: pCategory,
      content: editor.getHTML(),
      user_uid: user?.userId || null,
      age,
      gender,
      device_used: deviceUsed,
      anxiety_needs: anxietyNeeds,
      appeal_points: appealPoints,
    };

    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `${API_URL}/api/treasure_posts/${id}/` : `${API_URL}/api/treasure_posts/`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(id ? "更新しました！" : "投稿しました！");
        if (pCategory) {
          navigate("/treasure-categories", { state: { parentCategory: pCategory } });
        } else {
          navigate("/treasure");
        }
      } else {
        alert("投稿に失敗しました。");
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const colors = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#000000"];

  if (!editor) return null;

  return (
    <div className="treasure-form-container">
      <div className="post-page-header" style={{ maxWidth: '640px', width: '100%', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <button className="post-back-btn" onClick={() => navigate(-1)} style={{ marginRight: '16px' }}>
          <FiChevronLeft size={24} />
        </button>
        <h2 className="treasure-form-title" style={{ margin: 0 }}>{id ? "ノウハウを編集" : "新規ノウハウ投稿"}</h2>
      </div>

      <div className="treasure-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-field-item">
              <label className="field-label">カテゴリー</label>
              <select
                className="treasure-select notranslate"
                translate="no"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={!!fixedCategory}
              >
                <option value="">選択してください</option>
                <option value="Google-Pixel">Google Pixel</option>
                <option value="iOS-Switch">iOS Switch</option>
                <option value="Gemini">Gemini</option>
                <option value="Google-AI">Google AI</option>
                <option value="Design-talk">Design Talk</option>
                <option value="Portfolio">Portfolio</option>
              </select>
            </div>

            <div className="form-field-item">
              <label className="field-label">タイトル</label>
              <input
                type="text"
                className="treasure-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タイトルを入力"
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-field-item">
              <label className="field-label">年齢</label>
              <select
                className="treasure-select"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="10代">10代</option>
                <option value="20代">20代</option>
                <option value="30代">30代</option>
                <option value="40代">40代</option>
                <option value="50代">50代</option>
                <option value="60代">60代</option>
              </select>
            </div>

            <div className="form-field-item">
              <label className="field-label">性別</label>
              <select
                className="treasure-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>

            <div className="form-field-item">
              <label className="field-label">使用端末</label>
              <select
                className="treasure-select"
                value={deviceUsed}
                onChange={(e) => setDeviceUsed(e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="iPhone Proシリーズ">iPhone Proシリーズ</option>
                <option value="iPhone Normal シリーズ">iPhone Normal シリーズ</option>
                <option value="iPhone SE・Plus・Air シリーズ">iPhone SE・Plus・Air シリーズ</option>
                <option value="Galaxy ハイエンドモデル">Galaxy ハイエンドモデル</option>
                <option value="Galaxy ミドルレンズモデル">Galaxy ミドルレンズモデル</option>
                <option value="Xperia ハイエンドモデル">Xperia ハイエンドモデル</option>
                <option value="Xperia ミドルレンズモデル">Xperia ミドルレンズモデル</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-field-item">
              <label className="field-label">不安要素 & ニーズ</label>
              <textarea
                className="treasure-textarea"
                value={anxietyNeeds}
                onChange={(e) => setAnxietyNeeds(e.target.value)}
                placeholder="お客様の不安やニーズを入力してください"
                rows={5}
              />
            </div>

            <div className="form-field-item">
              <label className="field-label">訴求ポイント</label>
              <textarea
                className="treasure-textarea"
                value={appealPoints}
                onChange={(e) => setAppealPoints(e.target.value)}
                placeholder="提案した訴求ポイントを入力してください"
                rows={5}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">トークの流れ</label>
            <div className="treasure-editor-toolbar">
              <button type="button" className={`t-btn ${editor.isActive('bold') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleBold().run()}>
                <FiBold />
              </button>
              <button type="button" className={`t-btn ${editor.isActive('underline') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                <FiUnderline />
              </button>
              <button type="button" className="t-btn" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                <FiMessageSquare />
              </button>
              <button type="button" className="t-btn" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                <FiCode />
              </button>
              <button type="button" className="t-btn" onClick={() => {
                const url = prompt("リンクを入力:");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}>
                <FiLink />
              </button>
              <button type="button" className="t-btn" onClick={() => fileInputRef.current.click()}>
                <FiImage />
              </button>

              <div className="toolbar-divider"></div>

              <div className="color-palette">
                {colors.map(c => (
                  <button key={c} type="button" className="color-dot" style={{ background: c }} onClick={() => editor.chain().focus().setColor(c).run()} />
                ))}
              </div>
            </div>

            <div className="treasure-editor-wrapper notranslate" translate="no">
              <EditorContent editor={editor} className="treasure-editor-content" />
            </div>
          </div>

          <input type="file" ref={fileInputRef} className="hidden-mobile-input" accept="image/*" onChange={handleInsertImage} />

          <button type="submit" className="treasure-submit-btn" disabled={loading}>
            {loading ? <div className="loading-spinner"></div> : (id ? "更新する" : "投稿する")}
          </button>
        </form>
      </div>
    </div>
  );
}
