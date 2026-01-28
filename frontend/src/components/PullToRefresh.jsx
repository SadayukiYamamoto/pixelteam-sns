import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

const PullToRefresh = ({ onRefresh, children, className = "", style = {} }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullProgress, setPullProgress] = useState(0);
    const controls = useAnimation();
    const y = useMotionValue(0);
    const startY = useRef(null);
    const containerRef = useRef(null);

    const refreshThreshold = 80; // Distance to pull for refresh
    const maxPull = 120; // Maximum distance to pull

    const handleTouchStart = (e) => {
        // Only allow pull to refresh when at the top
        if (window.scrollY > 0) return;
        startY.current = e.touches[0].pageY;
    };

    const handleTouchMove = (e) => {
        if (startY.current === null || isRefreshing) return;

        const currentY = e.touches[0].pageY;
        const diff = currentY - startY.current;

        if (diff > 0 && window.scrollY === 0) {
            // Prevent browser from doing its own pull-to-refresh (especially on mobile browsers)
            if (e.cancelable) {
                // e.preventDefault(); // Commented out to avoid breaking native scroll behavior if diff is small
            }

            const rubberBandDiff = Math.min(diff * 0.4, maxPull); // Apply resistance
            y.set(rubberBandDiff);
            setPullProgress(Math.min(rubberBandDiff / refreshThreshold, 1));

            // If we've started pulling, prevent scroll
            if (rubberBandDiff > 5) {
                if (e.cancelable) e.preventDefault();
            }
        } else if (diff < 0) {
            // If we pull up, just reset
            y.set(0);
            setPullProgress(0);
        }
    };

    const handleTouchEnd = async () => {
        if (startY.current === null || isRefreshing) return;

        const finalY = y.get();
        if (finalY >= refreshThreshold) {
            setIsRefreshing(true);
            setPullProgress(1);

            // Stay at refresh position
            await controls.start({ y: 50, transition: { type: 'spring', stiffness: 300, damping: 30 } });

            try {
                await onRefresh();
            } catch (err) {
                console.error("Refresh failed", err);
            } finally {
                setIsRefreshing(false);
                setPullProgress(0);
                await controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
                y.set(0);
            }
        } else {
            // Snap back
            await controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
            y.set(0);
            setPullProgress(0);
        }
        startY.current = null;
    };

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ ...style, touchAction: 'pan-x pan-y' }}
        >
            <motion.div
                className="absolute top-0 left-0 right-0 flex justify-center items-center h-[50px] z-[10000]"
                animate={controls}
                style={{
                    y,
                    opacity: pullProgress,
                    scale: pullProgress * 0.5 + 0.5
                }}
            >
                <div className="bg-white rounded-full p-2 shadow-lg border border-gray-100">
                    <motion.div
                        className="w-6 h-6 border-b-2 border-green-500 rounded-full"
                        animate={isRefreshing ? { rotate: 360 } : { rotate: pullProgress * 360 }}
                        transition={isRefreshing ? { repeat: Infinity, ease: "linear", duration: 1 } : { type: "tween" }}
                    />
                </div>
            </motion.div>

            <motion.div
                animate={controls}
                style={{ y }}
                className="will-change-transform"
            >
                {children}
            </motion.div>
        </div >
    );
};

export default PullToRefresh;
