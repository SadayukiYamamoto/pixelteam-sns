import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 投稿内容をレンダリングするコンポーネント
 * 1. テキスト部分は3行制限（さらに表示で展開）
 * 2. 画像やOGPカードは常に表示
 * 3. 内部リンクはSPA遷移
 */
export const PostContent = ({ content, isExpanded, onToggleExpand, category }) => {
    const navigate = useNavigate();
    const [showFullImage, setShowFullImage] = useState(null);

    if (!content) return null;

    const handleLinkClick = (e) => {
        const target = e.target.closest('a');
        if (!target) {
            // 画像クリックの処理
            const img = e.target.closest('img');
            if (img && img.src) {
                setShowFullImage(img.src);
                return;
            }
            return;
        }

        const href = target.getAttribute('href');
        if (!href) return;

        if (href.startsWith('/') || href.startsWith(window.location.origin)) {
            e.preventDefault();
            const path = href.startsWith('/') ? href : href.replace(window.location.origin, '');
            navigate(path);
        }
    };

    // HTMLをパースしてメディア（画像・OGPカード）とテキストを分離する
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // メディア要素を抽出
    const mediaElements = [];

    // 1. OGPカードを優先的に抽出（ラッパーのみを対象にする）
    const ogpWrappers = doc.querySelectorAll('.ogp-wrapper');
    ogpWrappers.forEach(wrapper => {
        mediaElements.push({ type: 'ogp', html: wrapper.outerHTML });
        wrapper.remove(); // DOMから削除
    });

    // 2. 残った画像（OGPの中身ではない独立した画像）を抽出
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
        mediaElements.push({ type: 'image', src: img.src, alt: img.alt });
        img.remove(); // DOMから削除
    });

    const cleanTextHtml = doc.body.innerHTML;

    return (
        <div className="post-content-container" onClick={handleLinkClick}>
            {category && (
                <div className="post-category-badge mb-2">
                    <span className={`badge-text ${category === '個人報告' ? 'report' : 'chat'}`}>
                        {category}
                    </span>
                </div>
            )}
            {/* テキスト部分：isExpandedによってクラスを切り替え */}
            <div
                className={`post-text-content ${isExpanded ? 'expanded' : 'collapsed'}`}
                dangerouslySetInnerHTML={{ __html: cleanTextHtml }}
            />

            {!isExpanded && cleanTextHtml.length > 100 && (
                <button
                    className="show-more-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand();
                    }}
                >
                    ... <span>さらに表示</span>
                </button>
            )}

            {/* メディア部分：常に表示 */}
            <div className="post-media-content mt-2">
                {mediaElements.map((media, i) => {
                    if (media.type === 'image') {
                        return (
                            <img
                                key={i}
                                src={media.src}
                                alt={media.alt}
                                className="post-media-image"
                                style={{ cursor: 'pointer' }}
                            />
                        );
                    } else {
                        return (
                            <div
                                key={i}
                                className="post-media-ogp"
                                dangerouslySetInnerHTML={{ __html: media.html }}
                            />
                        );
                    }
                })}
            </div>

            {/* 画像拡大モーダル（簡易版） */}
            {showFullImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100]"
                    onClick={() => setShowFullImage(null)}
                >
                    <img src={showFullImage} className="max-w-[95%] max-h-[95%] object-contain" alt="Full view" />
                    <button className="absolute top-4 right-4 text-white text-3xl">&times;</button>
                </div>
            )}
        </div>
    );
};

export const renderPostContent = (text, isExpanded, onToggleExpand, category) => {
    return <PostContent content={text} isExpanded={isExpanded} onToggleExpand={onToggleExpand} category={category} />;
};
