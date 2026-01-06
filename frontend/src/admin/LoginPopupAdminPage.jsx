import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Button,
    Switch,
    FormControlLabel,
    Card,
    CardContent,
    Grid,
    Radio,
    RadioGroup,
    CircularProgress,
    Alert,
    TextField,
    Divider,
    Tab,
    Tabs,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper
} from "@mui/material";
import LoginPopup from "../components/LoginPopup";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { FaPlus, FaListUl } from "react-icons/fa";
import { FiBold, FiUnderline, FiCode, FiLink, FiImage, FiMessageSquare, FiUploadCloud, FiTrash2 } from "react-icons/fi";
import { uploadImageToFirebase } from "../utils/uploadImageToFirebase";

// Tiptap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { OGPCard } from "../extentions/OGPCard";

const colors = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#000000"];
const categories = ["お知らせ", "事務局", "イベント", "アップデート", "キャンペーン", "重要", "その他"];

const LoginPopupAdminPage = () => {
    const [tabValue, setTabValue] = useState(0); // 0: Select, 1: Create
    const [notices, setNotices] = useState([]);
    const [selectedNoticeId, setSelectedNoticeId] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [previewNotice, setPreviewNotice] = useState(null);

    // 新規作成用ステート
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState("お知らせ");
    const [newImageUrl, setNewImageUrl] = useState("");
    const fileInputRef = useRef(null);
    const headerImageInputRef = useRef(null);

    // Tiptap Editor
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                blockquote: true,
                codeBlock: true,
            }),
            TiptapImage.configure({
                HTMLAttributes: {
                    style: "max-width:100%; height:auto; border-radius:12px; margin:12px auto; display:block;",
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
                placeholder: "ポップアップの本文を入力してください...",
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
                    // 既にカード化されているかチェック
                    if (editor.getHTML().includes(`data-url="${url}"`)) return;

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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/admin/login-popup/", {
                headers: { Authorization: `Token ${token}` }
            });
            setNotices(res.data.notices);
            setSelectedNoticeId(res.data.current_setting.notice_id || "");
            setIsActive(res.data.current_setting.is_active);
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "データの取得に失敗しました。" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedNoticeId) {
            setMessage({ type: "error", text: "表示するお知らせを選択してください。" });
            return;
        }

        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const token = localStorage.getItem("token");
            await axios.post("/api/admin/login-popup/", {
                notice_id: selectedNoticeId,
                is_active: isActive
            }, {
                headers: { Authorization: `Token ${token}` }
            });
            setMessage({ type: "success", text: "設定を保存しました。" });
            fetchData(); // リストを更新
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "保存に失敗しました。" });
        } finally {
            setSaving(false);
        }
    };

    const handleCreateAndSet = async () => {
        const bodyContent = editor?.getHTML() || "";
        if (!newTitle || !bodyContent || bodyContent === "<p></p>") {
            setMessage({ type: "error", text: "タイトルと本文は必須です。" });
            return;
        }

        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const token = localStorage.getItem("token");
            // 1. お知らせを作成
            const noticeRes = await axios.post("/api/notices/", {
                title: newTitle,
                category: newCategory,
                body: bodyContent,
                image_url: newImageUrl,
                image_position: "header",
                is_login_popup: true // ログインポップアップ専用として作成
            }, {
                headers: { Authorization: `Token ${token}` }
            });

            // 2. ポップアップとして設定
            await axios.post("/api/admin/login-popup/", {
                notice_id: noticeRes.data.id,
                is_active: true
            }, {
                headers: { Authorization: `Token ${token}` }
            });

            setMessage({ type: "success", text: "新しくポップアップを作成して有効化しました！" });

            // フォームのリセット
            setNewTitle("");
            editor.commands.setContent("");
            setNewImageUrl("");
            setTabValue(0); // 一覧タブへ戻す
            fetchData(); // リストを更新
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "作成に失敗しました。" });
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = (isNew = false) => {
        if (isNew) {
            setPreviewNotice({
                title: newTitle || "タイトルプレビュー",
                category: newCategory,
                body: editor?.getHTML() || "本文プレビュー",
                image_url: newImageUrl
            });
        } else {
            const notice = notices.find(n => n.id === selectedNoticeId);
            if (notice) {
                setPreviewNotice(notice);
            } else {
                setMessage({ type: "error", text: "お知らせを選択してください。" });
            }
        }
    };

    const handleInsertImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const url = await uploadImageToFirebase(file, "popup-body-images");
            editor.chain().focus().setImage({ src: url }).run();
        } catch (error) {
            console.error("Image upload failed:", error);
            setMessage({ type: "error", text: "画像のアップロードに失敗しました。" });
        }
    };

    const handleHeaderImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const url = await uploadImageToFirebase(file, "popup-headers");
            setNewImageUrl(url);
        } catch (error) {
            console.error("Header image upload failed:", error);
            setMessage({ type: "error", text: "ヘッダー画像のアップロードに失敗しました。" });
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
        </Box>
    );

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header title="ログインPOPUP管理" />
                <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", margin: "0 auto" }}>
                    <Typography variant="body1" sx={{ mb: 4, color: "text.secondary", fontWeight: 500 }}>
                        ログイン時に表示されるプレミアムなポップアップを管理・作成します。
                    </Typography>

                    {message.text && (
                        <Alert severity={message.type} sx={{ mb: 3, borderRadius: 3, fontWeight: "bold" }}>
                            {message.text}
                        </Alert>
                    )}

                    <Paper elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
                        <Tabs
                            value={tabValue}
                            onChange={(e, v) => setTabValue(v)}
                            sx={{
                                px: 3, pt: 2,
                                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
                            }}
                        >
                            <Tab
                                icon={<FaListUl />}
                                iconPosition="start"
                                label="既存から選択"
                                sx={{ fontWeight: "bold", textTransform: "none", fontSize: "1rem" }}
                            />
                            <Tab
                                icon={<FaPlus />}
                                iconPosition="start"
                                label="新しく作る"
                                sx={{ fontWeight: "bold", textTransform: "none", fontSize: "1rem" }}
                            />
                        </Tabs>

                        <Divider />

                        <Box sx={{ p: { xs: 2, md: 4 } }}>
                            {tabValue === 0 ? (
                                <Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                                        <Typography variant="h6" fontWeight="bold">
                                            現在の設定
                                        </Typography>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={isActive}
                                                    onChange={(e) => setIsActive(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label={<Typography fontWeight="bold">{isActive ? "有効化中" : "無効化中"}</Typography>}
                                        />
                                    </Box>

                                    <RadioGroup
                                        value={selectedNoticeId}
                                        onChange={(e) => setSelectedNoticeId(e.target.value)}
                                    >
                                        <Grid container spacing={2}>
                                            {notices.map((notice) => (
                                                <Grid item xs={12} key={notice.id}>
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            border: '2px solid',
                                                            borderColor: selectedNoticeId === notice.id ? 'primary.main' : 'rgba(0,0,0,0.05)',
                                                            borderRadius: 4,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            cursor: 'pointer',
                                                            transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            backgroundColor: selectedNoticeId === notice.id ? 'primary.50' : '#fff',
                                                            '&:hover': {
                                                                borderColor: selectedNoticeId === notice.id ? 'primary.main' : 'primary.light',
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                                                            }
                                                        }}
                                                        onClick={() => setSelectedNoticeId(notice.id)}
                                                    >
                                                        <Radio value={notice.id} />
                                                        <Box sx={{ ml: 2, flex: 1 }}>
                                                            <Typography variant="body1" fontWeight="800">
                                                                {notice.title}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                                <Typography variant="caption" sx={{ px: 1, py: 0.2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, fontWeight: "bold", color: 'text.secondary' }}>
                                                                    {notice.category}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                                    {new Date(notice.created_at).toLocaleDateString()}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        {notice.image_url && (
                                                            <Box
                                                                component="img"
                                                                src={notice.image_url}
                                                                sx={{ width: 64, height: 64, borderRadius: 3, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.08)' }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </RadioGroup>

                                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => handlePreview(false)}
                                            sx={{ px: 4, borderRadius: 10, fontWeight: "bold", border: '2px solid' }}
                                        >
                                            プレビュー
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSave}
                                            disabled={saving}
                                            sx={{ px: 6, borderRadius: 10, fontWeight: "bold", boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)' }}
                                        >
                                            {saving ? "保存中..." : "設定を適用"}
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box>
                                    <Grid container spacing={4}>
                                        {/* 左側: メイン入力 */}
                                        <Grid item xs={12} lg={7}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: "bold" }}>
                                                        タイトル <span style={{ color: '#ef4444' }}>*</span>
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        placeholder="魅力的なタイトルを入力..."
                                                        value={newTitle}
                                                        onChange={(e) => setNewTitle(e.target.value)}
                                                        variant="outlined"
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
                                                    />
                                                </Box>

                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: "bold" }}>
                                                        本文エディタ <span style={{ color: '#ef4444' }}>*</span>
                                                    </Typography>
                                                    <Box sx={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 4, overflow: 'hidden', bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                                        <Box sx={{ bgcolor: '#fbfcfe', p: 1, borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor?.isActive('bold') ? 'primary' : 'default'}><FiBold size={18} /></IconButton>
                                                            <IconButton size="small" onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor?.isActive('underline') ? 'primary' : 'default'}><FiUnderline size={18} /></IconButton>
                                                            <IconButton size="small" onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor?.isActive('blockquote') ? 'primary' : 'default'}><FiMessageSquare size={18} /></IconButton>
                                                            <IconButton size="small" onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor?.isActive('codeBlock') ? 'primary' : 'default'}><FiCode size={18} /></IconButton>
                                                            <IconButton size="small" onClick={() => {
                                                                const url = prompt("リンクURLを入力");
                                                                if (url) editor.chain().focus().setLink({ href: url }).run();
                                                            }} color={editor?.isActive('link') ? 'primary' : 'default'}><FiLink size={18} /></IconButton>
                                                            <IconButton size="small" onClick={() => fileInputRef.current.click()}><FiImage size={18} /></IconButton>

                                                            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                                                            {colors.map(c => (
                                                                <IconButton
                                                                    key={c}
                                                                    size="small"
                                                                    onClick={() => editor.chain().focus().setColor(c).run()}
                                                                    sx={{ p: 0.5 }}
                                                                >
                                                                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', background: c, border: editor?.isActive('textStyle', { color: c }) ? '2px solid #000' : '1px solid #ccc' }} />
                                                                </IconButton>
                                                            ))}
                                                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleInsertImage} />
                                                        </Box>
                                                        <Box sx={{ p: 2.5, minHeight: '350px', cursor: 'text' }} onClick={() => editor?.chain().focus().run()}>
                                                            <style>{`
                                                        .ProseMirror { outline: none; min-height: 330px; font-size: 16px; color: #334155; }
                                                        .ProseMirror p.is-editor-empty:first-child::before {
                                                            content: attr(data-placeholder);
                                                            float: left;
                                                            color: #94a3b8;
                                                            pointer-events: none;
                                                            height: 0;
                                                        }
                                                        .ProseMirror blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; color: #64748b; margin: 1rem 0; font-style: italic; }
                                                        .ProseMirror code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
                                                    `}</style>
                                                            <EditorContent editor={editor} />
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        {/* 右側: 設定 */}
                                        <Grid item xs={12} lg={5}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', fontWeight: "bold" }}>
                                                        カテゴリー
                                                    </Typography>
                                                    <FormControl fullWidth>
                                                        <Select
                                                            value={newCategory}
                                                            onChange={(e) => setNewCategory(e.target.value)}
                                                            sx={{ borderRadius: 3, bgcolor: '#fff' }}
                                                        >
                                                            {categories.map((cat) => (
                                                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Box>

                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', fontWeight: "bold" }}>
                                                        メインキャッチ画像 (ヘッダー)
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            border: '2px dashed rgba(0,0,0,0.1)',
                                                            borderRadius: 4,
                                                            p: 3,
                                                            textAlign: 'center',
                                                            background: 'rgba(255,255,255,0.5)',
                                                            transition: '0.3s',
                                                            '&:hover': { border: '2px dashed #3b82f6', background: 'rgba(59,130,246,0.02)' }
                                                        }}
                                                    >
                                                        {newImageUrl ? (
                                                            <Box sx={{ position: 'relative' }}>
                                                                <Box
                                                                    component="img"
                                                                    src={newImageUrl}
                                                                    sx={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                                                />
                                                                <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
                                                                    <IconButton
                                                                        size="small"
                                                                        sx={{ bgcolor: '#fff', '&:hover': { bgcolor: '#f1f5f9' }, boxShadow: 2 }}
                                                                        onClick={() => headerImageInputRef.current.click()}
                                                                    >
                                                                        <FiUploadCloud size={16} />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        size="small"
                                                                        sx={{ bgcolor: '#ef4444', color: '#fff', '&:hover': { bgcolor: '#dc2626' }, boxShadow: 2 }}
                                                                        onClick={() => setNewImageUrl("")}
                                                                    >
                                                                        <FiTrash2 size={16} />
                                                                    </IconButton>
                                                                </Box>
                                                            </Box>
                                                        ) : (
                                                            <Box
                                                                onClick={() => headerImageInputRef.current.click()}
                                                                sx={{ cursor: 'pointer', py: 4 }}
                                                            >
                                                                <FiUploadCloud size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                                                                <Typography variant="body2" fontWeight="800" color="text.secondary">
                                                                    画像を選択またはドラッグ
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    PNG, JPG, WEBP (推奨: 4:5 縦長)
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        <input type="file" ref={headerImageInputRef} hidden accept="image/*" onChange={handleHeaderImageUpload} />
                                                    </Box>
                                                </Box>

                                                <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        color="secondary"
                                                        onClick={() => handlePreview(true)}
                                                        sx={{ py: 1.5, borderRadius: 3, fontWeight: "bold", border: '2px solid' }}
                                                    >
                                                        プレビュー表示
                                                    </Button>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={handleCreateAndSet}
                                                        disabled={saving}
                                                        sx={{
                                                            py: 1.5,
                                                            borderRadius: 3,
                                                            fontWeight: "bold",
                                                            background: 'linear-gradient(45deg, #10b981, #3b82f6)',
                                                            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                                                        }}
                                                    >
                                                        {saving ? "作成中..." : "作成して有効化"}
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Box>
                    </Paper>

                    {previewNotice && (
                        <LoginPopup notice={previewNotice} onClose={() => setPreviewNotice(null)} />
                    )}
                </Box>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default LoginPopupAdminPage;
