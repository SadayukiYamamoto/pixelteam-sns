import { storage, auth } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInAnonymously } from "firebase/auth";
import { optimizeImage } from "./imageOptimizer";

/**
 * 任意の画像を Firebase Storage にアップロードして、
 * 公開URL を返すヘルパー関数
 *
 * @param {File} file - アップロードするファイル
 * @param {string} folder - 保存先フォルダ名
 * @param {number} maxDim - 最大サイズ（デフォルト1000px）
 * @returns {Promise<string>} - 公開URL
 */
export async function uploadImageToFirebase(file, folder = "uploads", maxDim = 1000) {
  if (!file) {
    throw new Error("ファイルがありません");
  }

  // 🔹 画像の最適化 (WebP, Resize)
  let fileToUpload = file;
  if (file.type.startsWith("image/")) {
    try {
      fileToUpload = await optimizeImage(file, maxDim);
    } catch (err) {
      console.error("画像最適化失敗、元のファイルをアップロードします:", err);
    }
  }

  // Path: notices/xxxxxx.webp
  const fileName = `${folder}/${Date.now()}_${fileToUpload.name}`;
  const storageRef = ref(storage, fileName);

  // 🔥 認証チェック & 自動匿名ログイン
  if (!auth.currentUser) {
    try {
      console.log("⚠️ Firebase未認証のため、匿名ログインを試みます...");
      await signInAnonymously(auth);
    } catch (error) {
      console.error("❌ 匿名ログイン失敗:", error);
    }
  }

  // 画像のアップロード
  await uploadBytes(storageRef, fileToUpload);

  // ダウンロードURL（公開URL）
  const url = await getDownloadURL(storageRef);

  return url;
}
