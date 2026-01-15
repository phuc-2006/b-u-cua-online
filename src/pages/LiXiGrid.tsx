import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/game";
import confetti from "canvas-confetti";

// Fixed envelope amounts distribution
const ENVELOPE_AMOUNTS = [
    10000, 10000, 10000, 10000, 10000,  // 5 x 10k
    20000, 20000, 20000, 20000,          // 4 x 20k
    30000, 30000, 30000,                  // 3 x 30k
    60000, 60000,                          // 2 x 60k
    100000, 100000,                        // 2 x 100k
];

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

interface Envelope {
    id: number;
    amount: number;
    isFlipped: boolean;
}

const LiXiGrid = () => {
    const [envelopes, setEnvelopes] = useState<Envelope[]>(() =>
        shuffleArray(ENVELOPE_AMOUNTS).map((amount, index) => ({
            id: index,
            amount,
            isFlipped: false,
        }))
    );
    const [selectedEnvelope, setSelectedEnvelope] = useState<Envelope | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    const handleFlip = useCallback((envelope: Envelope) => {
        if (envelope.isFlipped || showPopup) return;

        // Start flip animation
        setEnvelopes(prev =>
            prev.map(e =>
                e.id === envelope.id ? { ...e, isFlipped: true } : e
            )
        );

        // Show popup after flip animation
        setTimeout(() => {
            setSelectedEnvelope(envelope);
            setShowPopup(true);

            // Confetti for big amounts
            if (envelope.amount >= 60000) {
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.5 },
                    colors: ['#FFD700', '#FF6B6B', '#FF8C00']
                });
            }
        }, 400);
    }, [showPopup]);

    const closePopup = () => {
        setShowPopup(false);
        setSelectedEnvelope(null);
    };

    const getAmountColor = (amount: number) => {
        if (amount >= 100000) return 'text-yellow-400';
        if (amount >= 60000) return 'text-orange-400';
        if (amount >= 30000) return 'text-green-400';
        return 'text-white';
    };

    const getAmountMessage = (amount: number) => {
        if (amount >= 100000) return '🎉 Đại Lộc!';
        if (amount >= 60000) return '✨ May mắn!';
        if (amount >= 30000) return '🧧 Tuyệt vời!';
        return '🧧 Chúc mừng!';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-amber-900 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between p-3 md:p-4 shrink-0">
                <Link to="/lixi">
                    <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                </Link>
            </header>

            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center shrink-0 pb-2 md:pb-4"
            >
                <h1 className="text-3xl md:text-5xl font-calligraphy text-yellow-400 drop-shadow-lg">
                    🧧 Lật Lì Xì 🧧
                </h1>
                <p className="text-white/60 text-sm mt-1 font-soft">
                    Chạm vào bao để mở và nhận lộc
                </p>
            </motion.div>

            {/* Full Page Envelope Grid */}
            <div className="flex-1 flex items-center justify-center p-2 md:p-4">
                <div className="grid grid-cols-4 gap-2 md:gap-4 w-full max-w-2xl aspect-square">
                    {envelopes.map((envelope, index) => (
                        <motion.div
                            key={envelope.id}
                            initial={{ opacity: 0, scale: 0, rotateY: 0 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                rotateY: envelope.isFlipped ? 180 : 0
                            }}
                            transition={{
                                delay: index * 0.03,
                                rotateY: { duration: 0.5, ease: "easeInOut" }
                            }}
                            onClick={() => handleFlip(envelope)}
                            className={`
                                relative cursor-pointer rounded-xl md:rounded-2xl overflow-hidden
                                shadow-lg hover:shadow-2xl transition-shadow
                                ${envelope.isFlipped ? 'pointer-events-none' : 'hover:scale-105'}
                            `}
                            style={{
                                transformStyle: 'preserve-3d',
                                perspective: '1000px'
                            }}
                            whileHover={!envelope.isFlipped ? { scale: 1.05 } : {}}
                            whileTap={!envelope.isFlipped ? { scale: 0.95 } : {}}
                        >
                            {/* Envelope Front (unflipped) */}
                            <div
                                className={`
                                    absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 
                                    flex items-center justify-center
                                    border-2 md:border-4 border-yellow-500/60
                                    transition-opacity duration-300
                                    ${envelope.isFlipped ? 'opacity-0' : 'opacity-100'}
                                `}
                            >
                                <span className="text-3xl md:text-5xl lg:text-6xl">🧧</span>
                            </div>

                            {/* Envelope Back (flipped - gold) */}
                            <div
                                className={`
                                    absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500
                                    flex items-center justify-center
                                    border-2 md:border-4 border-yellow-300
                                    transition-opacity duration-300
                                    ${envelope.isFlipped ? 'opacity-100' : 'opacity-0'}
                                `}
                                style={{ transform: 'rotateY(180deg)' }}
                            >
                                <span className="text-2xl md:text-3xl lg:text-4xl">✓</span>
                            </div>

                            {/* Aspect ratio placeholder */}
                            <div className="pb-[100%]"></div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Popup Modal */}
            <AnimatePresence>
                {showPopup && selectedEnvelope && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                        onClick={closePopup}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", damping: 15 }}
                            className="bg-gradient-to-br from-red-700 to-red-900 rounded-3xl p-8 shadow-2xl border-4 border-yellow-500 max-w-sm w-full text-center relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={closePopup}
                                className="absolute top-4 right-4 text-white/60 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Envelope icon */}
                            <motion.div
                                initial={{ rotateY: 0 }}
                                animate={{ rotateY: 360 }}
                                transition={{ duration: 0.8 }}
                                className="text-8xl mb-4"
                            >
                                🧧
                            </motion.div>

                            {/* Message */}
                            <div className="text-xl text-white/90 mb-2 font-soft">
                                {getAmountMessage(selectedEnvelope.amount)}
                            </div>

                            {/* Amount */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring", damping: 10 }}
                                className={`text-5xl font-black ${getAmountColor(selectedEnvelope.amount)} drop-shadow-lg mb-6`}
                            >
                                {formatMoney(selectedEnvelope.amount)}
                            </motion.div>

                            {/* Continue button */}
                            <Button
                                onClick={closePopup}
                                className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold px-8 py-3 rounded-full"
                            >
                                Tiếp tục
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorations */}
            <div className="fixed top-10 left-5 text-4xl md:text-6xl opacity-10 pointer-events-none">🏮</div>
            <div className="fixed top-20 right-5 text-3xl md:text-5xl opacity-10 pointer-events-none">🎊</div>
            <div className="fixed bottom-20 left-10 text-3xl md:text-5xl opacity-10 pointer-events-none">🎆</div>
            <div className="fixed bottom-10 right-10 text-4xl md:text-6xl opacity-10 pointer-events-none">🏮</div>
        </div>
    );
};

export default LiXiGrid;
