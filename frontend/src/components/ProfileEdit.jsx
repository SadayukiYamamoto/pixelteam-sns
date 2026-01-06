import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInAnonymously } from "firebase/auth";
import { app, auth, storage } from "../firebase";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCamera, FiCheck, FiUsers, FiShoppingBag, FiActivity } from "react-icons/fi";
import "./ProfileEdit.css";

const ProfileEdit = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [team, setTeam] = useState("");
  const [shopName, setShopName] = useState("");
  const [introduction, setIntroduction] = useState(""); // 🆕 自己紹介
  const [uploading, setUploading] = useState(false);
  const [isTeamLocked, setIsTeamLocked] = useState(false); // ← ロック状態
  const fileInputRef = useRef(null);
  // storage は ../firebase から直接インポートしたものを使用

  // 🔹 Django API から現在のプロフィール情報を取得
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get(`mypage/${userId}/`);
        setProfile(res.data);
        setDisplayName(res.data.display_name || "");
        setProfileImage(res.data.profile_image || "");
        setIntroduction(res.data.introduction || ""); // 🆕

        // チームが既に設定されている場合はロックする
        if (res.data.team) {
          setTeam(res.data.team);
          setIsTeamLocked(true);
        } else {
          setTeam("");
          setIsTeamLocked(false);
        }

        setShopName(res.data.shop_name || "");
      } catch (err) {
        console.error("❌ プロフィール取得失敗:", err);
      }
    };
    fetchProfile();
  }, [userId]);


  // 🔹 画像の最適化 (リサイズ & WebP変換)
  const processImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 400; // プロフィール用なら400pxあれば十分

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
              const webpFile = new File([blob], fileName, { type: "image/webp" });
              resolve(webpFile);
            },
            "image/webp",
            0.8 // 品質
          );
        };
      };
    });
  };

  // 🔹 画像アップロード処理（Firebase）
  const handleImageUpload = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    // 画像の最適化を実行
    file = await processImage(file);

    // 🔥 認証チェック & 自動匿名ログイン
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("❌ 匿名ログイン失敗:", error);
      }
    }

    const storageRef = ref(storage, `profileImages/${profile?.user_id || userId}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    setProfileImage(url);
    setUploading(false);
  };


  // 🔹 Django API に PATCH 送信
  const handleSave = async () => {
    try {
      const response = await axiosClient.patch(
        "update_profile/",
        {
          display_name: displayName,
          profile_image: profileImage,
          team: team,
          shop_name: team === "shop" ? shopName : "",
          introduction: introduction, // 🆕
        }
      );
      alert("✅ プロフィールを更新しました！");
      console.log("Updated:", response.data);
      navigate("/mypage");
    } catch (error) {
      console.error("❌ 更新エラー:", error);
      alert("更新に失敗しました");
    }
  };

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-header">
        <button onClick={() => navigate(-1)} className="back-circle-btn">
          <FiArrowLeft />
        </button>
        <h2 className="profile-edit-title">プロフィール編集</h2>
        <div style={{ width: "40px" }}></div> {/* balance */}
      </div>

      <div className="profile-edit-card">
        {/* アバター編集エリア */}
        <div className="avatar-edit-section">
          <div className="avatar-wrapper" onClick={() => fileInputRef.current.click()}>
            <img
              src={profileImage || "/default-avatar.png"}
              alt="avatar"
              className="avatar-main"
            />
            <div className="avatar-overlay">
              <FiCamera />
            </div>
            {uploading && <div className="avatar-active-loader"></div>}
          </div>
          <p className="avatar-hint">タップして画像を変更</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
        </div>

        {/* フォームエリア */}
        <div className="form-content">
          <div className="input-field-group">
            <label className="field-label">表示名</label>
            <input
              className="modern-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="あなたの名前"
            />
          </div>

          <div className="input-field-group">
            <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>自己紹介 (4行以内)</span>
              <span style={{ fontSize: "12px", color: introduction.length > 160 ? "red" : "#aaa" }}>
                {introduction.length} / 160
              </span>
            </label>
            <textarea
              className="modern-input"
              value={introduction}
              onChange={(e) => {
                const val = e.target.value;
                const lineCount = (val.match(/\n/g) || []).length + 1;
                if (lineCount <= 4) {
                  setIntroduction(val);
                }
              }}
              placeholder="160文字以内・4行以内で自己紹介を入力してください"
              maxLength={160}
              style={{ minHeight: "100px", resize: "none", lineHeight: "1.5" }}
            />
          </div>

          <div className="input-field-group">
            <label className="field-label">
              所属チーム
              {isTeamLocked && <span style={{ fontSize: "0.8em", color: "#666", marginLeft: "10px" }}>※変更できません（管理者に問い合わせてください）</span>}
            </label>
            <div className={`team-tiles-container ${isTeamLocked ? "locked-team-selection" : ""}`}>
              {[
                { id: "shop", label: "Pixel-Shop", icon: <FiShoppingBag /> },
                { id: "event", label: "Pixel-Event", icon: <FiActivity /> },
                { id: "training", label: "Pixel-Training", icon: <FiUsers /> },
              ].map((t) => (
                <div
                  key={t.id}
                  className={`team-selection-tile ${team === t.id ? "is-selected" : ""} ${isTeamLocked ? "disabled-tile" : ""}`}
                  onClick={() => !isTeamLocked && setTeam(t.id)}
                >
                  <div className="tile-icon-box">{t.icon}</div>
                  <span className="tile-name">{t.label}</span>
                  {team === t.id && <div className="tile-selected-indicator"><FiCheck /></div>}
                </div>
              ))}
            </div>
          </div>

          {team === "shop" && (
            <div className="input-field-group animate-slide-down">
              <label className="field-label">所属店舗</label>
              <div className="modern-select-box">
                <select
                  className="modern-form-select"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                >
                  <option value="">店舗を選択してください</option>
                  {[
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
                  ].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          <button onClick={handleSave} className="submit-btn-premium">
            編集を確定する
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
