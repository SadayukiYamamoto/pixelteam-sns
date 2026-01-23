import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (!token) {
        // ログイン画面へリダイレクト
        return <Navigate
            to="/login"
            state={{
                from: location,
                message: "ログインが必要です。ログインして続きをお楽しみください。"
            }}
            replace
        />;
    }

    // ✅ 規約同意チェック (既存ユーザーも入れるようにコメントアウト、または削除)
    // ユーザー要望により、同意しなくてもOKにする
    /*
    const hasAgreed = localStorage.getItem("terms_agreed") === "true";
    const isAgreementPath = ["/terms-agreement", "/terms-of-service", "/privacy-policy"].includes(location.pathname);

    if (!hasAgreed && !isAgreementPath) {
        return <Navigate to="/terms-agreement" state={{ from: location }} replace />;
    }
    */

    return children;
};

export default ProtectedRoute;
