import axios from "axios";

import { Capacitor } from '@capacitor/core';

// Webでは相対パス、モバイル(Capacitor)では絶対パスを使用する
const isMobile = Capacitor.isNativePlatform();

// ローカルテスト用のフラグ（エミュレータなら10.0.2.2、実機ならPCのIPアドレス）
// 本番公開時は false にするか、環境変数で管理するのが理想
const IS_LOCAL_TEST = true;
const LOCAL_API_URL = "http://10.0.2.2:8000/api/";
const PROD_API_URL = "https://pixelteamsns.web.app/api/";

const baseURL = isMobile
  ? (IS_LOCAL_TEST ? LOCAL_API_URL : PROD_API_URL)
  : "/api/";

console.log("Axios initialized with baseURL:", baseURL, "isMobile:", isMobile);

const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
});

// リクエスト時に localStorage の accessToken を Authorization ヘッダに付与
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // ログインやサインアップ時はトークンを送らない
  // url.endsWith または完全一致で判定し、user/login-popup などが誤判定されないようにする
  const isPublicEndpoint = config.url && (
    config.url.endsWith("/login/") ||
    config.url.endsWith("/signup/") ||
    config.url === "login/" ||
    config.url === "signup/" ||
    config.url === "login" ||
    config.url === "signup"
  );

  if (token && !isPublicEndpoint) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Token ${token}`;
    console.log(`[Axios] Request to ${config.url}: Sending token`);
  } else {
    console.log(`[Axios] Request to ${config.url}: Token skipped (Public: ${isPublicEndpoint})`);
  }
  return config;
});

// 401エラーのグローバルハンドリング
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("🚨 401 Unauthorized: トークンが無効か、ログインが必要です。");

      // トークンを削除
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // ログインページへリダイレクト（リロードを伴うが確実）
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
