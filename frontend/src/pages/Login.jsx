import React, { useState } from "react";
import { TextField, Button, Typography, Container, Box, Divider } from "@mui/material";
import axiosClient from "../api/axiosClient";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { auth, GoogleAuthProvider, signInWithPopup } from "../firebase"; // Import Firebase
import { FcGoogle } from "react-icons/fc"; // Optional: Google Icon
import { initializePushNotifications } from "../utils/push-notifications"; // ✅ 追加
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdminFields, setShowAdminFields] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ProtectedRoute から渡されたメッセージ、またはURLパラメータの expired を取得
  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get("expired") === "true";

  const message = isExpired
    ? "セッションの期限が切れました。再度ログインしてください。"
    : location.state?.message;

  const from = location.state?.from?.pathname || "/mypage";

  const handleLoginSuccess = (data) => {
    console.log("✅ ログイン成功:", data.display_name);

    // 🔹 ローカルストレージに保存
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user_id);
    localStorage.setItem("display_name", data.display_name);
    localStorage.setItem("profile_image", data.profile_image);

    const userInfo = {
      userId: data.user_id,
      displayName: data.display_name,
      email: data.email,
      profileImage: data.profile_image,
      team: data.team,
      token: data.token
    };

    localStorage.setItem("user", JSON.stringify(userInfo));

    // 🔹 複数アカウント管理用
    const existingAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    const accountIndex = existingAccounts.findIndex(acc => acc.userId === userInfo.userId);
    if (accountIndex > -1) {
      existingAccounts[accountIndex] = userInfo; // 更新
    } else {
      existingAccounts.push(userInfo); // 追加
    }
    localStorage.setItem("accounts", JSON.stringify(existingAccounts));

    // ✅ 規約同意チェック（既存ユーザーは同意不要に変更）
    localStorage.setItem("terms_agreed", data.terms_agreed ? "true" : "false");
    /*
    const hasAgreed = data.terms_agreed === true;

    if (!hasAgreed) {
      console.log("➡️ 規約同意が必要なため TermsAgreement へ遷移");
      navigate("/terms-agreement", {
        state: {
          nextPath: !data.team ? `/profile-edit/${data.user_id}` : from,
          userId: data.user_id
        },
        replace: true
      });
      return;
    }
    */

    if (!data.team) {
      console.log("➡️ チーム未設定のためプロフィール編集へ遷移");
      navigate(`/profile-edit/${data.user_id}`);
    } else {
      // 元々行こうとしていたページ、またはマイページへ
      navigate(from, { replace: true });
    }

    // ✅ ログイン直後に通知初期化（トークンのバックエンド同期）を実行
    if (Capacitor.isNativePlatform()) {
      initializePushNotifications().catch(err => console.error("Login push init error:", err));
    }
  };

  const handleGoogleLogin = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError("");
    console.log("🚀 Googleログインを開始します...");

    try {
      let idToken = "";

      if (Capacitor.isNativePlatform()) {
        try {
          console.log("📱 Native platform detected, calling FirebaseAuthentication.signInWithGoogle...");
          const result = await FirebaseAuthentication.signInWithGoogle({
            googleClientId: "237007524936-cglimuthved1b2rg19pnm73qo1k8eofq.apps.googleusercontent.com"
          });
          console.log("📱 Native Google login result received:", !!result);

          // ⬇️ ここが重要！Firebase用のIDトークンを再取得します
          const tokenResult = await FirebaseAuthentication.getIdToken();
          idToken = tokenResult.token;
          console.log("📱 Firebase ID Token obtained:", !!idToken);
        } catch (nativeErr) {
          console.error("❌ Native Sign-In Error:", nativeErr);
          setError(`Googleログイン(Native)でエラーが発生しました: ${nativeErr.message || JSON.stringify(nativeErr)}`);
          throw nativeErr;
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
      try {
        const res = await axiosClient.post(
          "login/google/",
          {
            id_token: idToken,
            action: 'login'
          }
        );

        if (res.data.token) {
          handleLoginSuccess(res.data);
        } else {
          setError("サーバー認証に失敗しました。レスポンスにトークンがありません。");
        }
      } catch (axiosErr) {
        console.error("❌ Backend Error:", axiosErr.response?.data || axiosErr.message);
        setError(`サーバー認証エラー: ${axiosErr.response?.data?.error || axiosErr.message}`);
      }

    } catch (err) {
      console.error("Google Login Error:", err);
      const errorMsg = err.message || JSON.stringify(err);
      setError(`Googleログインに失敗しました: ${errorMsg}`);
      // alert(`詳細なエラー: ${errorMsg}`);
    }
  };

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    if (newCount >= 10) {
      setShowAdminFields(true);
      console.log("🔓 Admin fields revealed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    console.log("🚀 ログイン開始");

    try {
      const res = await axiosClient.post(
        "login/",
        {
          user_id: userId.trim(),
          password: password.trim(),
        }
      );

      console.log("📥 レスポンス受信:", res.status, res.data);

      if (res.data.status === "success" || res.data.message === "ログイン成功") {
        handleLoginSuccess(res.data);
      } else {
        setError(res.data.error || "ログインに失敗しました。");
      }
    } catch (err) {
      // ... (Error handling remains same, reusing logic)
      if (err.response) {
        console.error("❌ ログインエラー詳細:", err.response.data);
      } else {
        console.error("❌ ログインエラー詳細:", err);
      }
      if (err.response) {
        setError(err.response.data.error || `ログイン失敗 (${err.response.status})`);
      } else {
        setError("ログインエラーが発生しました。");
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 5 }}>
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box
          display="flex"
          justifyContent="center"
          mt={{ xs: 2, sm: 4 }}
          mb={{ xs: 3, sm: 6 }}
          onClick={handleLogoClick}
          sx={{
            cursor: 'pointer',
            userSelect: 'none',
            '& img': {
              height: { xs: '40px', sm: '60px' },
              width: 'auto'
            }
          }}
        >
          <img src="/images/pikumaru-logo3.webp" alt="Pikumaru Logo" />
        </Box>

        {message && (
          <Box sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', p: 2, borderRadius: 2, border: '1px solid #ff9800' }}>
            <Typography color="#e65100" variant="body2" align="center" fontWeight="bold">
              {message}
            </Typography>
          </Box>
        )}

        <Button
          type="button" // ⬅️ 重要：送信ボタンとして動かないようにする
          variant="outlined"
          fullWidth
          onClick={(e) => handleGoogleLogin(e)}
          sx={{
            py: 1.5,
            borderColor: '#dadce0',
            color: '#3c4043',
            textTransform: 'none',
            fontWeight: 500,
            display: 'flex',
            gap: 1,
            '&:hover': {
              borderColor: '#d2e3fc',
              backgroundColor: 'rgba(66, 133, 244, 0.04)'
            }
          }}
        >
          <FcGoogle size={20} />
          Googleでログイン
        </Button>

        <Box sx={{ display: showAdminFields ? 'flex' : 'none', flexDirection: 'column', gap: 2 }}>
          <Divider>または</Divider>

          {error && <Typography color="error" align="center">{error}</Typography>}
          <TextField
            label="ユーザーID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <TextField
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" sx={{ py: 1.5 }}>
            ログイン
          </Button>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              アカウントをお持ちでないですか？ <Link to="/signup" style={{ textDecoration: 'none', color: '#1976d2' }}>新規作成</Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
