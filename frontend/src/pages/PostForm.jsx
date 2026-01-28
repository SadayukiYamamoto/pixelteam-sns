import React, { useState, useRef } from 'react';
import { FaImage } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// Quill removed
import './PostForm.css';
import { useNavigate } from "react-router-dom";
import MentionInput from '../components/MentionInput';

import axiosClient from '../api/axiosClient';

const formats = ['image'];

const PostForm = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [scheduleDate, setScheduleDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  // Sanitize removed as we use plain text now
  const sanitizeContent = (text) => text;

  // Quill modules removed

  // 画像をリサイズしてBase64へ変換
  const resizeImage = (file, maxWidth = 1250, maxHeight = 500) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

        width *= ratio;
        height *= ratio;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg"));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Quill image logic removed


  const insertFileToEditor = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = async (isScheduled = false) => {
    if (!content.trim()) {
      alert("投稿内容を入力してください！");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", sanitizeContent(content));
      formData.append("category", category);
      formData.append("user_name", "綱島"); // 💡仮のユーザー名（あとでAuth連携OK）
      formData.append("user_uid", "user123"); // 💡仮のUID
      formData.append("is_scheduled", isScheduled);
      if (scheduleDate) formData.append("scheduled_at", scheduleDate.toISOString());
      if (imageFile) formData.append("image", imageFile);

      const res = await axiosClient.post("posts/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200 || res.status === 201) {
        alert(isScheduled ? "投稿を予約しました！" : "投稿しました！");
        setTitle('');
        setContent('');
        setCategory('');
        setImagePreview(null);
        navigate('/pitter');
      } else {
        console.error(await res.text());
        alert("投稿に失敗しました。");
      }
    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-form-container">
      <div className="post-header-bar">
        <button className="close-button" onClick={() => navigate('/pitter')}>×</button>
        <button className="submit-button-top" onClick={() => handleSubmit(false)} disabled={loading}>
          {loading ? "投稿中…" : "投稿する"}
        </button>
      </div>

      <label>カテゴリー</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      >
        <option value="雑談">雑談</option>
        <option value="個人報告">個人報告</option>
      </select>


      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
      />

      <input
        type="text"
        placeholder="カテゴリ"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
      />

      {/* ReactQuill Removed. Using MentionInput */}
      <div style={{ marginBottom: '16px' }}>
        <MentionInput
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="いまどうしてる？"
          style={{ minHeight: '120px' }}
        />
      </div>


      <input
        type="file"
        id="fileUpload"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
          }
        }}
        style={{ display: 'none' }}
      />
      {imagePreview && (
        <div className="preview-wrapper">
          <img src={imagePreview} alt="プレビュー画像" className="preview-image" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          <button className="remove-preview" onClick={handleRemoveImage}>×</button>
        </div>
      )}

      <div className="icon-upload">
        <label htmlFor="fileUpload" title="画像を挿入">
          <FaImage size={20} style={{ cursor: 'pointer', marginTop: '10px' }} />
        </label>
      </div>

      <div className="schedule">
        <label>投稿予約日時：</label>
        <DatePicker
          selected={scheduleDate}
          onChange={(date) => setScheduleDate(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="yyyy/MM/dd HH:mm"
          placeholderText="日時を選択"
        />
      </div>

      <div className="post-actions">
        <button className="submit-button" onClick={() => handleSubmit(false)} disabled={loading}>
          {loading ? '投稿中...' : '投稿する'}
        </button>
        <button className="reserve-button" onClick={() => handleSubmit(true)}>
          投稿を予約する
        </button>
      </div>
    </div>
  );
};

export default PostForm;
