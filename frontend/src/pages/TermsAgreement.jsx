import React, { useState } from "react";
import { Container, Typography, Box, Button, Checkbox, FormControlLabel, Link, Paper } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const TermsAgreement = () => {
    const [agreed, setAgreed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // 次の遷移先（デフォルトはプロフィール編集またはホーム）
    const nextPath = location.state?.nextPath || "/home";
    const userId = location.state?.userId;

    const handleSubmit = async () => {
        if (!agreed) return;

        try {
            // ✅ バックエンドに反映
            await axiosClient.post("agree_terms/");

            // ✅ 同意済みフラグを保存
            localStorage.setItem("terms_agreed", "true");

            // ユーザー情報のオブジェクトも更新
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                user.terms_agreed = true;
                localStorage.setItem("user", JSON.stringify(user));
            }

            console.log("✅ 利用規約に同意しました");

            // 次の画面へ
            navigate(nextPath, { state: { userId }, replace: true });
        } catch (error) {
            console.error("同意の更新に失敗しました:", error);
            alert("通信エラーが発生しました。もう一度お試しください。");
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
                <Box mb={4}>
                    <img src="/images/pikumaru-logo3.webp" alt="Pikumaru Logo" style={{ height: '50px' }} />
                </Box>

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    規約への同意
                </Typography>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                    サービスをご利用いただくには、以下の内容をご確認の上、同意していただく必要があります。
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                            id="terms-checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            color="primary"
                        />
                        <Typography variant="body2">
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate("/terms-of-service")}
                                sx={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                利用規約
                            </Link>
                            {" と "}
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate("/privacy-policy")}
                                sx={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                プライバシーポリシー
                            </Link>
                            {" に同意する"}
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!agreed}
                    onClick={handleSubmit}
                    sx={{
                        py: 1.5,
                        fontWeight: 'bold',
                        borderRadius: '30px',
                        boxShadow: agreed ? '0 4px 14px 0 rgba(0,118,255,0.39)' : 'none'
                    }}
                >
                    送信
                </Button>
            </Paper>
        </Container>
    );
};

export default TermsAgreement;
