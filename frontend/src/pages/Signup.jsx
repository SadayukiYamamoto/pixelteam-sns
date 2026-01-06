import React, { useState } from "react";
import { TextField, Button, Typography, Container, Box, Divider, Alert } from "@mui/material";
import axiosClient from "../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";
import { auth, GoogleAuthProvider, signInWithPopup } from "../firebase";
import { FcGoogle } from "react-icons/fc";
import { initializePushNotifications } from "../utils/push-notifications"; // ✅ 追加
import { Capacitor } from "@capacitor/core";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleAuthSuccess = (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user_id);
        localStorage.setItem("display_name", data.display_name);
        localStorage.setItem("profile_image", data.profile_image);

        localStorage.setItem("user", JSON.stringify({
            userId: data.user_id,
            displayName: data.display_name,
            email: data.email,
            team: data.team, // ← 保存
        }));

        if (!data.team) {
            console.log("➡️ チーム未設定のためプロフィール編集へ遷移");
            navigate(`/profile-edit/${data.user_id}`);
        } else {
            navigate("/mypage");
        }

        // ✅ 会員登録直後に通知初期化（トークンのバックエンド同期）を実行
        if (Capacitor.isNativePlatform()) {
            initializePushNotifications().catch(err => console.error("Signup push init error:", err));
        }
    };

    const handleGoogleSignup = async () => {
        setError("");
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken();

            // Google認証はLoginと同じエンドポイントでOK（自動作成されるため）
            const res = await axiosClient.post(
                "login/google/",
                { id_token: idToken }
            );

            if (res.data.token) {
                handleAuthSuccess(res.data);
            } else {
                setError("サーバー認証に失敗しました。");
            }
        } catch (err) {
            console.error("Google Signup Error:", err);
            setError("Googleでの登録に失敗しました。");
        }
    };

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axiosClient.post(
                "signup/",
                {
                    email: email.trim(),
                    user_id: userId.trim(),
                    password: password.trim(),
                    display_name: displayName.trim()
                }
            );

            if (res.data.status === "success" || res.status === 201) {
                handleAuthSuccess(res.data);
            }
        } catch (err) {
            console.error("Signup Error:", err);
            if (err.response) {
                setError(err.response.data.error || "登録に失敗しました。");
            } else {
                setError("サーバーに接続できません。");
            }
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 5, mb: 5 }}>
            <Box
                component="form"
                onSubmit={handleEmailSignup}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
                <Typography variant="h5" align="center" fontWeight="bold">アカウント作成</Typography>

                <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleGoogleSignup}
                    sx={{
                        py: 1.5,
                        borderColor: '#dadce0',
                        color: '#3c4043',
                        textTransform: 'none',
                        fontWeight: 500,
                        display: 'flex',
                        gap: 1,
                        mb: 1
                    }}
                >
                    <FcGoogle size={20} />
                    Googleで登録
                </Button>

                <Divider>または</Divider>

                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                    label="ユーザーID (半角英数)"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    helperText="ログインに使用します"
                />
                <TextField
                    label="表示名 (ニックネーム)"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                />
                <TextField
                    label="メールアドレス"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <TextField
                    label="パスワード"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <Button type="submit" variant="contained" color="primary" sx={{ py: 1.5, mt: 1 }}>
                    アカウント作成
                </Button>

                <Box textAlign="center" mt={2}>
                    <Typography variant="body2">
                        既にアカウントをお持ちですか？ <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>ログイン</Link>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default Signup;
