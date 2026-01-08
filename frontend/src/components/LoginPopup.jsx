import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * LoginPopup - Restore (Version from Step 606)
 * - Specific margins: 30px top/bottom, 20px left/right
 * - Category Badge: 14px font, rounded-xl
 * - Close button: top-right
 */
const LoginPopup = ({ notice, onClose }) => {
    if (!notice) return null;

    return (
        <div className="fixed inset-0 z-[110000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />

            {/* Popup Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-[460px] z-10"
            >
                {/* Close Button: Top-Right (Placed Outside the main rounded container to avoid clipping) */}
                <button
                    onClick={onClose}
                    className="absolute flex items-center justify-center bg-white rounded-full shadow-xl hover:scale-110 transition-all cursor-pointer"
                    style={{
                        top: '20px',
                        right: '20px',
                        width: '44px',
                        height: '44px',
                        zIndex: 999,
                        border: 'none',
                        appearance: 'none',
                        outline: 'none'
                    }}
                >
                    <X size={22} className="text-gray-600" strokeWidth={3} />
                </button>

                {/* Main Card Content */}
                <div className="w-full bg-white rounded-[4.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col">
                    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar overflow-x-hidden">
                        {/* Featured Image: Narrower aspect ratio */}
                        <div className="relative w-full aspect-[1.8/1] bg-white overflow-hidden flex items-center justify-center">
                            {notice.image_url ? (
                                <img
                                    src={notice.image_url}
                                    alt={notice.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-[#f5f5f0] flex items-center justify-center">
                                    <div className="w-48 h-48 bg-[#a4c639] rounded-full" />
                                </div>
                            )}
                        </div>

                        {/* Content Section: Detailed Margins */}
                        <div
                            className="px-10 pb-12 pt-6 flex flex-col items-start text-left"
                            style={{
                                marginTop: '30px',
                                marginBottom: '30px',
                                marginLeft: '20px',
                                marginRight: '20px'
                            }}
                        >
                            {/* Category Badge: FontSize 14px, Rounded Rectangle background */}
                            <div className="mb-6">
                                <span className="px-6 py-2 rounded-xl bg-[#f0f9e6] text-[14px] font-bold text-[#65a30d] shadow-sm">
                                    {notice.category || "お知らせ"}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-[26px] font-extrabold text-[#111827] leading-tight mb-6">
                                {notice.title}
                            </h2>

                            {/* Body Text */}
                            <div
                                className="text-[#4b5563] text-[16px] leading-[1.8] mb-10 prose prose-slate w-full 
                                       prose-p:my-2
                                       prose-a:text-blue-500 prose-a:font-bold prose-a:no-underline"
                                dangerouslySetInnerHTML={{ __html: notice.body }}
                            />

                            {/* Action Area */}
                            <div className="w-full p-1.5 rounded-[2.5rem] border border-gray-100 bg-gray-50/30">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onClose}
                                    className="w-full py-4.5 bg-[#22c55e] text-white font-bold text-[18px] rounded-full flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(34,197,94,0.4)] border-none cursor-pointer"
                                    style={{ border: 'none' }}
                                >
                                    ホームに移動
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(0,0,0,0.05);
                  border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default LoginPopup;
