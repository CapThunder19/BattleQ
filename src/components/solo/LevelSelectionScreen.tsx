'use client';

import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Play, ChevronRight } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';

export const LevelSelectionScreen = () => {
    const { solo, startLevel } = useGameStore();
    const levels = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 select-none">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h2 className="text-4xl font-black text-white tracking-widest uppercase mb-2">
                    Phase_Selection
                </h2>
                <div className="h-1 w-32 bg-primary mx-auto opacity-50" />
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full">
                {levels.map((lvl) => {
                    const isCompleted = lvl < solo.unlockedLevel;
                    const isCurrent = lvl === solo.unlockedLevel;
                    const isLocked = lvl > solo.unlockedLevel;

                    return (
                        <motion.button
                            key={lvl}
                            whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
                            whileTap={!isLocked ? { scale: 0.95 } : {}}
                            onClick={() => !isLocked && startLevel(lvl)}
                            disabled={isLocked}
                            className={`
                                relative h-32 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300
                                ${isCurrent ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(0,242,255,0.2)]' : ''}
                                ${isCompleted ? 'border-secondary/50 bg-secondary/5 opacity-80' : ''}
                                ${isLocked ? 'border-white/10 bg-white/5 opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            style={{ clipPath: 'polygon(0 0, 90% 0, 100% 15%, 100% 100%, 10% 100%, 0 85%)' }}
                        >
                            {/* Level Number */}
                            <span className={`text-4xl font-black ${isCurrent ? 'text-primary' : 'text-white'}`}>
                                {lvl < 10 ? `0${lvl}` : lvl}
                            </span>

                            {/* Status Icon */}
                            <div className="absolute top-2 right-2">
                                {isCompleted && <CheckCircle2 className="w-5 h-5 text-secondary" />}
                                {isCurrent && <Play className="w-5 h-5 text-primary animate-pulse" />}
                                {isLocked && <Lock className="w-5 h-5 text-gray-500" />}
                            </div>

                            {/* Label */}
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-2">
                                {isLocked ? 'Locked' : 'Level'}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-16"
            >
                <button
                    onClick={() => startLevel(solo.unlockedLevel)}
                    className="group relative px-12 py-4 bg-primary text-black font-black uppercase text-sm tracking-[0.4em] transition-all hover:bg-white active:scale-95"
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}
                >
                    <span className="flex items-center gap-2">
                        Continue_Hunt <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
            </motion.div>
        </div>
    );
};
