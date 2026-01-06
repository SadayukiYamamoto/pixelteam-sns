// src/utils/uploadImageToFirebase.js
import { storage, auth } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInAnonymously } from "firebase/auth";

/**
 * 任意の画像を Firebase Storage にアップロードして、
 * 公開URL を返すヘルパー関数
 *
 * @param {File} file - アップロードするファイル
 * @param {string} folder - 保存先フォルダ名（例："notices"）
 * @returns {Promise<string>} - 公開URL
 */
export async function uploadImageToFirebase(file, folder = "uploads") {
  if (!file) {
    throw new Error("ファイルがありません");
  }

  // Path: notices/xxxxxx.jpg
  const fileName = `${folder}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, fileName);

  // 🔥 認証チェック & 自動匿名ログイン
  // Storageルールが "allow write: if request.auth != null" の場合、
  // ログインしていないと 403 になるため。
  if (!auth.currentUser) {
    try {
      console.log("⚠️ Firebase未認証のため、匿名ログインを試みます...");
      await signInAnonymously(auth);
    } catch (error) {
      console.error("❌ 匿名ログイン失敗:", error);
      if (error.code === 'auth/admin-restricted-operation') {
        alert("Firebaseの匿名認証が無効になっています。\nFirebase Console > Authentication > Sign-in method で「匿名 (Anonymous)」を有効にしてください。");
      }
      // 失敗してもそのまま進むが、おそらくこの後のアップロードで失敗する
    }
  }

  // 画像のアップロード
  await uploadBytes(storageRef, file);

  // ダウンロードURL（公開URL）
  const url = await getDownloadURL(storageRef);

  return url;
}
