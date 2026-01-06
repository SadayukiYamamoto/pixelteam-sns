import React from 'react';

/**
 * PointCard Component
 * Displays user points in a visually appealing card with a gradient background.
 */
const PointCard = ({ points }) => {
    return (
        <div
            className="relative overflow-hidden transition-all duration-300 w-full"
            style={{
                background: 'linear-gradient(135deg, #facc15 0%, #eab308 50%, #ca8a04 100%)',
                borderRadius: '24px',
                padding: '24px',
                color: 'white',
                boxShadow: '0 15px 35px -5px rgba(202, 138, 4, 0.4)',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxSizing: 'border-box'
            }}
        >
            {/* Background Decoration - 右上に配置 */}
            <div
                className="absolute pointer-events-none"
                style={{
                    top: '-20px',
                    right: '-20px',
                    opacity: 0.25,
                    width: '180px',
                    height: '180px',
                }}
            >
                <svg viewBox="0 0 512 512" width="180" height="180" fill="white">
                    <path d="M 0 405.3 V 448 c 0 35.3 86 64 192 64 s 192 -28.7 192 -64 v -42.7 C 342.7 434.4 267.2 448 192 448 S 41.3 434.4 0 405.3 Z M 320 128 c 106 0 192 -28.7 192 -64 S 426 0 320 0 S 128 28.7 128 64 s 86 64 192 64 Z M 0 300.4 V 352 c 0 35.3 86 64 192 64 s 192 -28.7 192 -64 v -51.6 c -41.3 34 -116.9 51.6 -192 51.6 S 41.3 334.4 0 300.4 Z m 416 11 c 57.3 -11.1 96 -31.7 96 -55.4 v -42.7 c -23.2 16.4 -57.3 27.6 -96 34.5 v 63.6 Z M 192 160 C 86 160 0 195.8 0 240 s 86 80 192 80 s 192 -35.8 192 -80 s -86 -80 -192 -80 Z m 219.3 56.3 c 60 -10.8 100.7 -32 100.7 -56.3 v -42.7 c -35.5 25.1 -96.5 38.6 -160.7 41.8 c 29.5 14.3 51.2 33.5 60 57.2 Z" />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center w-full">
                <div
                    style={{
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontSize: '12px',
                        fontWeight: '800',
                        letterSpacing: '0.25em',
                        marginBottom: '4px'
                    }}
                >
                    TOTAL POINTS
                </div>

                <div className="flex items-baseline" style={{ gap: '6px', marginBottom: '4px' }}>
                    <span
                        style={{
                            fontSize: '56px',
                            fontWeight: '900',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                        }}
                    >
                        {points.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.9)' }}>pt</span>
                </div>

                {/* セパレーター */}
                <div
                    style={{
                        width: '100%',
                        height: '1px',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        margin: '12px 0'
                    }}
                />

                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.95)', fontWeight: '600' }}>
                    獲得したすべてのポイント
                </p>
            </div>
        </div>
    );
};

export default PointCard;
