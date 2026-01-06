import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

const LoginPopup = ({ notice, onClose }) => {
    if (!notice) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />

            {/* Popup Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 100 }}
                transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 150,
                    duration: 0.6
                }}
                className="relative w-full max-w-[500px] max-h-[90vh] bg-white/95 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.35)] border border-white/60 overflow-hidden flex flex-col"
            >
                {/* Decorative Sparkle 背景 */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
                    <div className="absolute top-[-10%] right-[-10%] w-[150px] h-[150px] bg-lime-300 rounded-full blur-[80px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[150px] h-[150px] bg-green-300 rounded-full blur-[80px]" />
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 p-3 bg-white hover:scale-110 rounded-full transition-all shadow-[0_8px_20px_-4px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_25px_-5px_rgba(0,0,0,0.25)] group border-none"
                    aria-label="Close"
                >
                    <X size={20} className="text-gray-400 group-hover:text-gray-800" strokeWidth={3} />
                </button>

                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar overflow-x-hidden w-full">
                    {/* Header Image Section - Constrained height and width */}
                    <div className="relative w-full h-[220px] sm:h-[260px] overflow-hidden shrink-0">
                        {notice.image_url ? (
                            <img
                                src={notice.image_url}
                                alt={notice.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center">
                                <Sparkles size={64} className="text-white/40 animate-pulse" />
                            </div>
                        )}
                    </div>

                    {/* Content Section - Left-aligned for text and category */}
                    <div className="p-6 sm:p-8 pt-6 flex flex-col items-start text-left w-full max-w-full overflow-hidden box-border">
                        {/* Category Badge */}
                        <div className="mb-4">
                            <span className="px-4 py-1.5 rounded-lg bg-lime-50 text-[10px] font-black uppercase tracking-[0.15em] text-lime-700 border border-lime-200/50 shadow-sm">
                                {notice.category}
                            </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
                            {notice.title}
                        </h2>

                        <div
                            className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 prose prose-sm max-w-full text-left w-full overflow-x-hidden 
                                       prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto
                                       prose-blockquote:border-l-4 prose-blockquote:border-lime-500 prose-blockquote:bg-lime-50/50 prose-blockquote:p-4 prose-blockquote:rounded-r-2xl prose-blockquote:italic
                                       prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded prose-code:text-green-700 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-2xl
                                       [&_.ogp-wrapper]:max-w-full [&_.ogp-card]:max-w-full [&_.ogp-card]:overflow-hidden [&_img]:max-w-full [&_.ogp-card]:m-0 [&_.ogp-card]:my-4"
                            dangerouslySetInnerHTML={{ __html: notice.body }}
                        />

                        {/* PokéPoké Style Pulsing Button - Wrapped for safety */}
                        <div className="w-full max-w-full px-1">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="w-full relative group"
                            >
                                <div className="absolute inset-0 bg-lime-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                                <div className="relative py-3.5 sm:py-4 bg-gradient-to-r from-lime-600 to-green-600 text-white font-black text-lg rounded-[2rem] shadow-xl border border-white/20 flex items-center justify-center gap-2 overflow-hidden">
                                    <span className="relative z-10">ホームに移動</span>
                                    {/* 光沢アニメーション */}
                                    <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:left-[100%] transition-all duration-700" />
                                </div>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.1);
        }
      `}</style>
        </div>
    );
};

export default LoginPopup;
