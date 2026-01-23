import React, { useState } from "react";
import { TextField, Button, Typography, Container, Box, Divider, Alert, Checkbox, FormControlLabel, Link as MuiLink } from "@mui/material";
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
    const [logoClickCount, setLogoClickCount] = useState(0);
    const [showAdminFields, setShowAdminFields] = useState(false);
    const [agreed, setAgreed] = useState(false);
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

        /*
        // ✅ 規約同意チェック (新規登録時に同意させるため、ここはスキップ)
        localStorage.setItem("terms_agreed", data.terms_agreed ? "true" : "false");
        const hasAgreed = data.terms_agreed === true;

        if (!hasAgreed) {
            console.log("➡️ 規約同意が必要なため TermsAgreement へ遷移");
            navigate("/terms-agreement", {
                state: {
                    nextPath: !data.team ? `/profile-edit/${data.user_id}` : "/mypage",
                    userId: data.user_id
                },
                replace: true
            });
            return;
        }
        */
        localStorage.setItem("terms_agreed", "true"); // 同意済みとして扱う

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
        if (!agreed) {
            alert("利用規約とプライバシーポリシーへの同意が必要です。");
            return;
        }
        setError("");
        console.log("🚀 Google登録を開始します...");

        try {
            let idToken = "";

            if (Capacitor.isNativePlatform()) {
                const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
                try {
                    console.log("📱 Native platform detected, calling FirebaseAuthentication.signInWithGoogle...");
                    const result = await FirebaseAuthentication.signInWithGoogle({
                        googleClientId: "237007524936-cglimuthved1b2rg19pnm73qo1k8eofq.apps.googleusercontent.com"
                    });

                    const tokenResult = await FirebaseAuthentication.getIdToken();
                    idToken = tokenResult.token;
                    console.log("📱 Firebase ID Token obtained:", !!idToken);
                } catch (nativeErr) {
                    console.error("❌ Native Sign-In Error:", nativeErr);
                    setError(`Google登録(Native)でエラーが発生しました: ${nativeErr.message || JSON.stringify(nativeErr)}`);
                    return;
                }
            } else {
                console.log("🌐 Web platform detected, calling signInWithPopup...");
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                idToken = await result.user.getIdToken();
            }

            if (!idToken) {
                throw new Error("GoogleからIDトークンを取得できませんでした。");
            }

            console.log("📡 バックエンドにIDトークンを送信中...");
            const res = await axiosClient.post(
                "login/google/",
                {
                    id_token: idToken,
                    action: 'signup'
                }
            );

            if (res.data.token) {
                handleAuthSuccess(res.data);
            } else {
                setError("サーバー認証に失敗しました。");
            }
        } catch (err) {
            console.error("Google Signup Error:", err);
            setError(`Googleでの登録に失敗しました: ${err.message || "不明なエラー"}`);
        }
    };

    const handleLogoClick = () => {
        const newCount = logoClickCount + 1;
        setLogoClickCount(newCount);
        if (newCount >= 10) {
            setShowAdminFields(true);
            console.log("🔓 Admin signup fields revealed");
        }
    };

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        if (!agreed) {
            alert("利用規約とプライバシーポリシーへの同意が必要です。");
            return;
        }
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
                <Box
                    display="flex"
                    justifyContent="center"
                    mb={2}
                    onClick={handleLogoClick}
                    sx={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        '& img': {
                            height: '40px',
                            width: 'auto'
                        }
                    }}
                >
                    <img src="/images/pikumaru-logo3.webp" alt="Pikumaru Logo" />
                </Box>
                <Typography variant="h5" align="center" fontWeight="bold">アカウント作成</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body2">
                                <MuiLink
                                    component="button"
                                    type="button"
                                    variant="body2"
                                    onClick={() => window.open("/terms-of-service", "_blank")}
                                    sx={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', verticalAlign: 'baseline' }}
                                >
                                    利用規約
                                </MuiLink>
                                {" と "}
                                <MuiLink
                                    component="button"
                                    type="button"
                                    variant="body2"
                                    onClick={() => window.open("/privacy-policy", "_blank")}
                                    sx={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', verticalAlign: 'baseline' }}
                                >
                                    プライバシーポリシー
                                </MuiLink>
                                {" に同意する"}
                            </Typography>
                        }
                    />
                </Box>

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

                <Box sx={{ display: showAdminFields ? 'flex' : 'none', flexDirection: 'column', gap: 2 }}>
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
                </Box>

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
