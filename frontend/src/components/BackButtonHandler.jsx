import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';

const BackButtonHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleBackButton = async () => {
            // ログインページ、ホーム、規約などのルートページでは、戻るボタンでアプリを閉じる（あるいは何もしない）
            const rootPaths = ['/home', '/', '/login', '/terms-agreement'];

            if (rootPaths.includes(location.pathname)) {
                // 現在のページがルート的なページならアプリを終了させる（Androidの場合）
                App.exitApp();
            } else {
                // それ以外のページならブラウザバック（React Routerの履歴を戻る）
                navigate(-1);
            }
        };

        const listener = App.addListener('backButton', () => {
            handleBackButton();
        });

        return () => {
            listener.then(l => l.remove());
        };
    }, [location, navigate]);

    return null;
};

export default BackButtonHandler;
