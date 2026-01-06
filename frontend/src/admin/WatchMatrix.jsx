import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import "./WatchMatrix.css"; // デザイン用（あとで作る）

export default function WatchMatrix() {
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [matrix, setMatrix] = useState({});

  useEffect(() => {
    axios.get("/api/analytics/watch_matrix/")
      .then(res => {
        setUsers(res.data.users);
        setVideos(res.data.videos);
        setMatrix(res.data.matrix);
      })
      .catch(err => console.error("Matrix読み込み失敗:", err));
  }, []);

  return (
    <div className="home-container">
      <div className="admin-wrapper">
        <Header title="視聴マトリクス" />
        <div className="max-w-full mx-auto pt-10 px-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
            視聴マトリクス
          </h1>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4 sticky left-0 bg-gray-50 z-20 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">ユーザー / 動画</th>
                    {videos.map(v => (
                      <th key={v.id} className="p-4 min-w-[160px] whitespace-normal border-l border-gray-100 font-semibold text-gray-700">
                        <div className="line-clamp-2" title={v.title}>{v.title}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-purple-50/20 transition-colors">
                      <td className="p-4 sticky left-0 bg-white z-10 font-bold text-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-transparent">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">{idx + 1}</div>
                          {u.name}
                        </div>
                      </td>

                      {videos.map(v => {
                        const key = `${u.id}_${v.id}`;
                        const data = matrix[key]; // { time: int, views: int }

                        const hasView = data && (data.time > 0 || data.views > 0);

                        return (
                          <td key={v.id} className={`p-3 text-center border-l border-gray-50 ${hasView ? 'bg-green-50/30' : ''}`}>
                            {data ? (
                              <div className="flex flex-col items-center">
                                <span className={`font-bold text-lg ${data.views > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                                  {data.views} <span className="text-xs font-normal text-gray-400">回</span>
                                </span>
                                {data.time > 0 && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded mt-1">
                                    {Math.floor(data.time / 60)}分 {data.time % 60}秒
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-200 text-xs">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Navigation activeTab="mypage" />
    </div>
  );
}
