import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (!token) {
        // ログイン画面へリダイレクト（元の場所とメッセージを渡す）
        return <Navigate
            to="/login"
            state={{
                from: location,
                message: "ログインが必要です。ログインして続きをお楽しみください。"
            }}
            replace
        />;
    }

    return children;
};

export default ProtectedRoute;
