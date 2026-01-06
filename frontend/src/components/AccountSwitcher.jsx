import React, { useState } from 'react';
import { User, Plus, X, Lock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const AccountSwitcher = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState(JSON.parse(localStorage.getItem('accounts') || '[]'));
    const currentUserId = localStorage.getItem('userId');
    const [isVerifying, setIsVerifying] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSwitchClick = (account) => {
        if (account.userId === currentUserId) return;
        setSelectedAccount(account);
        setIsVerifying(true);
        setPassword('');
        setError('');
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axiosClient.post('login/', {
                user_id: selectedAccount.userId,
                password: password
            });

            if (res.data.status === 'success' || res.data.token) {
                // 成功したらセッションを切り替え
                const data = res.data;
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

                // 全アカウントリストも更新
                const newAccounts = accounts.map(acc => acc.userId === data.user_id ? userInfo : acc);
                localStorage.setItem("accounts", JSON.stringify(newAccounts));

                alert('アカウントを切り替えました');
                window.location.reload(); // アプリ全体をリロードして状態をリセット
            }
        } catch (err) {
            setError('パスワードが正しくありません');
        }
    };

    const handleAddAccount = () => {
        navigate('/login');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-800">アカウントを切り替える</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors border-none bg-transparent">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-4">
                    {!isVerifying ? (
                        <div className="space-y-2">
                            {accounts.map((acc) => (
                                <button
                                    key={acc.userId}
                                    onClick={() => handleSwitchClick(acc)}
                                    className={`w-full p-4 flex items-center gap-4 rounded-2xl transition-all border-none text-left ${acc.userId === currentUserId
                                            ? 'bg-green-50 border-2 border-green-200 cursor-default shadow-sm'
                                            : 'bg-white hover:bg-gray-50 active:scale-[0.98]'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-white shadow-sm">
                                        {acc.profileImage ? (
                                            <img src={acc.profileImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-gray-800 truncate">{acc.displayName}</p>
                                        <p className="text-sm text-gray-500 truncate">{acc.userId}</p>
                                    </div>
                                    {acc.userId === currentUserId && (
                                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-md shadow-green-200">
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}

                            <button
                                onClick={handleAddAccount}
                                className="w-full p-4 flex items-center gap-4 rounded-2xl bg-white hover:bg-gray-50 transition-all border-2 border-dashed border-gray-200 text-gray-600 active:scale-[0.98]"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border-2 border-white shadow-sm">
                                    <Plus size={24} />
                                </div>
                                <p className="font-bold flex-1 text-left">別のアカウントを追加</p>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6 p-2">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full overflow-hidden shadow-md">
                                    {selectedAccount.profileImage ? (
                                        <img src={selectedAccount.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            <User size={32} />
                                        </div>
                                    )}
                                </div>
                                <p className="font-black text-gray-800">{selectedAccount.displayName} に切り替える</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 ml-1">パスワードを入力してください</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        autoFocus
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all font-bold"
                                        placeholder="パスワード"
                                        required
                                    />
                                </div>
                                {error && <p className="text-sm text-red-500 font-bold ml-1">{error}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsVerifying(false)}
                                    className="flex-1 py-4 font-black text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors border-none"
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 font-black text-white bg-green-600 rounded-2xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95 border-none"
                                >
                                    認証して切り替える
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountSwitcher;
