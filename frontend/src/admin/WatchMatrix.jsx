import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import "./AdminCommon.css";
import "./WatchMatrix.css";

export default function WatchMatrix() {
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosClient.get("/analytics/watch_matrix/")
      .then(res => {
        setUsers(res.data.users);
        setVideos(res.data.videos);
        setMatrix(res.data.matrix);
      })
      .catch(err => console.error("Matrix読み込み失敗:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (seconds) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分 ${secs}秒`;
  };

  return (
    <div className="admin-page-container">
      <Header />
      <div className="admin-wrapper">
        <div className="admin-page-content">
          <div className="matrix-title-wrapper">
            <div className="matrix-accent-bar"></div>
            <h1>視聴マトリクス</h1>
          </div>

          <div className="matrix-viewport">
            {loading ? (
              <div className="p-20 text-center font-black text-gray-300 uppercase tracking-widest">
                Loading Matrix Data...
              </div>
            ) : (
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th>ユーザー / 動画</th>
                    {videos.map(v => (
                      <th key={v.id} title={v.title}>
                        {v.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-identity">
                          <div className="user-index">{idx + 1}</div>
                          <span className="user-name">{u.name}</span>
                        </div>
                      </td>

                      {videos.map(v => {
                        const key = `${u.id}_${v.id}`;
                        const data = matrix[key];
                        const views = data?.views || 0;
                        const time = data?.time || 0;

                        return (
                          <td key={v.id}>
                            <div className="matrix-cell-content">
                              {views > 0 ? (
                                <>
                                  <div className="matrix-count">
                                    {views}<span className="matrix-unit">回</span>
                                  </div>
                                  <div className="matrix-time">
                                    {formatTime(time)}
                                  </div>
                                </>
                              ) : (
                                <span className="matrix-empty-cell">-</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={videos.length + 1} className="p-20 text-center text-gray-300">
                        データがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Navigation activeTab="mypage" />
    </div>
  );
}
