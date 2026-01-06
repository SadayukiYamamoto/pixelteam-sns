import React, { useEffect, useState } from "react";
import { MentionsInput, Mention } from "react-mentions";
import axios from "axios";
import "./MentionInput.css";
// prop-types は必須ではないが推奨
// import PropTypes from 'prop-types'; 

/**
 * メンション(@user)・ハッシュタグ(#tag) 入力用コンポーネント
 * @param {string} value - 入力値
 * @param {function} onChange - 変更ハンドラ: (e, newValue, newPlainTextValue, mentions) => void
 * @param {string} placeholder - プレースホルダー
 */
const MentionInput = ({ value, onChange, placeholder, style }) => {
    const [users, setUsers] = useState([]);

    // ユーザー候補の取得
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (query = "") => {
        try {
            const token = localStorage.getItem("token");
            // 一般ユーザー検索用API
            const res = await axios.get(`/api/users/search/?q=${query}`, {
                headers: { Authorization: `Token ${token}` },
            });

            const formatted = res.data.map((u) => ({
                id: u.user_id,
                display: u.display_name,
            }));
            setUsers(formatted);
        } catch (err) {
            console.error("ユーザー取得失敗(メンション用):", err);
        }
    };

    return (
        <div className="mention-input-container" style={style}>
            <MentionsInput
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="mentions-input"
                a11ySuggestionsListLabel={"Suggested mentions"}
            >
                {/* メンション (@user_id) */}
                <Mention
                    trigger="@"
                    data={users}
                    markup="@[__id__]"
                    displayTransform={(id, display) => `@${id}`} // 入力欄での見え方
                    className="mention-highlight"
                />

                {/* ハッシュタグ (#tag) - シンプルな候補なしパターン */}
                <Mention
                    trigger="#"
                    data={[]} // 候補なし（入力のみハイライトさせたい場合）
                    markup="#[__display__]"
                    displayTransform={(id, display) => `#${display}`}
                    className="hashtag-highlight"
                    appendSpaceOnAdd={true}
                />
            </MentionsInput>
        </div>
    );
};

export default MentionInput;
