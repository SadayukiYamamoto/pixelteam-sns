import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';

const ShopManagementPage = () => {
    const [shopsData, setShopsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/analytics/shops/', {
                headers: { Authorization: `Token ${token}` }
            });
            setShopsData(res.data);
            if (res.data.length > 0) {
                setActiveTab(0);
            }
        } catch (error) {
            console.error("Error fetching shop analytics:", error);
            alert("データの取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const currentShop = shopsData.length > 0 ? shopsData[activeTab] : null;

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header title="店舗管理（週報・ノウハウ）" />
                <div className="max-w-6xl mx-auto p-4 md:p-10">
                    {loading ? (
                        <div className="p-10 text-center">Loading...</div>
                    ) : shopsData.length === 0 ? (
                        <div className="p-10 text-center">店舗データがありません</div>
                    ) : currentShop ? (
                        <>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-800">店舗管理レポート</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    各店舗の週間レポート提出状況とノウハウ共有状況を確認できます。
                                </p>
                            </div>

                            <div className="bg-white p-3 rounded-t-3xl shadow-sm flex overflow-x-auto gap-3 scrollbar-none">
                                {shopsData.map((shop, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTab(index)}
                                        className={`px-6 py-3 font-bold whitespace-nowrap rounded-2xl transition-all flex flex-col items-center min-w-[140px] border-none ${activeTab === index
                                            ? 'bg-[#84cc16] text-white shadow-lg shadow-lime-200/50 transform scale-100'
                                            : 'bg-white text-gray-500 hover:bg-gray-50 shadow-sm hover:shadow-md scale-95 hover:scale-100'
                                            }`}
                                    >
                                        <span className="text-sm">{shop.shop_name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white rounded-b-3xl rounded-tr-3xl shadow-xl shadow-gray-200/50 overflow-hidden border-none min-h-[500px]">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-2 h-8 bg-[#84cc16] rounded-full"></span>
                                        {currentShop.shop_name} の活動状況
                                    </h2>
                                    <span className="text-xs text-gray-400">過去8週間のデータ</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                                <th className="p-5 font-semibold w-64">対象期間</th>
                                                <th className="p-5 font-semibold w-1/2">個人報告 (提出者)</th>
                                                <th className="p-5 font-semibold w-1/3">ノウハウ提出 (週1必須)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {currentShop.weeks.map((week, idx) => (
                                                <tr key={idx} className="hover:bg-blue-50/10 transition-colors">
                                                    <td className="p-5 align-top">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-700 text-base">{week.label}</span>
                                                            <span className="text-xs text-gray-400 mt-1">Week {8 - idx}</span>
                                                        </div>
                                                    </td>

                                                    <td className="p-5 align-top bg-white">
                                                        <div className="flex flex-wrap gap-2">
                                                            {week.personal_reports.length > 0 ? (
                                                                week.personal_reports.map(rep => (
                                                                    <Link
                                                                        key={rep.id}
                                                                        to={`/posts/${rep.id}`}
                                                                        target="_blank"
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 hover:shadow-sm border border-blue-100 transition-all"
                                                                        title={`投稿日: ${new Date(rep.created_at).toLocaleDateString()}`}
                                                                    >
                                                                        {rep.user_name}
                                                                        <ExternalLink size={12} className="opacity-50" />
                                                                    </Link>
                                                                ))
                                                            ) : (
                                                                <div className="w-full py-4 flex justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                                    <span className="text-gray-400 text-xs">- 提出なし -</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className={`p-5 align-top border-l border-gray-100 ${week.know_how_submitted ? 'bg-green-50/30' : 'bg-red-50/30'}`}>
                                                        <div className="flex items-start gap-4">
                                                            <div className={`mt-1 p-1 rounded-full ${week.know_how_submitted ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                                                {week.know_how_submitted ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className={`font-bold text-base mb-2 ${week.know_how_submitted ? 'text-green-700' : 'text-red-500'}`}>
                                                                    {week.know_how_submitted ? '提出済み' : '未提出'}
                                                                </div>

                                                                {week.know_hows.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        {week.know_hows.map(k => (
                                                                            <div key={k.id} className="bg-white p-2 rounded border border-green-100 shadow-sm text-sm">
                                                                                <div className="font-bold text-gray-700 text-xs mb-0.5">{k.user_name}</div>
                                                                                <Link to={`/treasure-posts/${k.id}`} className="text-blue-600 hover:underline line-clamp-1 block" title={k.title}>
                                                                                    {k.title || "無題"}
                                                                                </Link>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default ShopManagementPage;
