import React, { useState } from 'react';

/**
 * Shared Avatar component that shows an image or the first character of the name.
 * 
 * @param {string} src - Image URL
 * @param {string} name - User's display name
 * @param {string} size - Tailwind size class (e.g., "w-10 h-10")
 * @param {string} className - Additional CSS classes
 */
const Avatar = ({ src, name, size = "w-10 h-10", className = "" }) => {
    const [hasError, setHasError] = useState(false);

    // Reset hasError if src changes
    React.useEffect(() => {
        setHasError(false);
    }, [src]);

    // Extract first character of the name or fallback to "U"
    const firstChar = (name || "匿名").trim().charAt(0).toUpperCase();

    // Background colors for the fallback
    const bgColors = [
        '#4285F4', // Google Blue
        '#EA4335', // Google Red
        '#FBBC05', // Google Yellow
        '#34A853', // Google Green
        '#8E24AA', // Purple
        '#F06292', // Pink
        '#4DB6AC', // Teal
    ];

    // Pick a color based on the first character
    const charCode = firstChar.charCodeAt(0);
    const bgColor = bgColors[charCode % bgColors.length];

    // Helper to extract numeric size from tailwind class if needed for inline styles
    // Defaulting to 40px if unknown
    const sizeMap = {
        'w-4': '16px', 'h-4': '16px',
        'w-6': '24px', 'h-6': '24px',
        'w-8': '32px', 'h-8': '32px',
        'w-10': '40px', 'h-10': '40px',
        'w-12': '48px', 'h-12': '48px',
        'w-16': '64px', 'h-16': '64px',
        'w-20': '80px', 'h-20': '80px',
        'w-24': '96px', 'h-24': '96px',
        'w-32': '128px', 'h-32': '128px',
    };

    const widthVal = size.split(' ').find(c => c.startsWith('w-')) || 'w-10';
    const heightVal = size.split(' ').find(c => c.startsWith('h-')) || 'h-10';
    const inlineSize = {
        width: sizeMap[widthVal] || '40px',
        height: sizeMap[heightVal] || '40px'
    };

    const isFalsySrc = !src || src === "/default-avatar.png" || src === "null" || src === "undefined" || src === "";

    if (isFalsySrc || hasError) {
        return (
            <div
                className={`${size} rounded-full inline-flex items-center justify-center text-white font-black shadow-sm shrink-0 select-none ${className}`}
                style={{
                    backgroundColor: bgColor,
                    fontSize: `calc(${inlineSize.width} * 0.45)`,
                    ...inlineSize
                }}
            >
                {firstChar}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name}
            className={`${size} rounded-full object-cover shadow-sm bg-slate-100 shrink-0 ${className}`}
            style={inlineSize}
            onError={() => setHasError(true)}
        />
    );
};

export default Avatar;
