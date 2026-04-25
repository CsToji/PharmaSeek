import React from 'react';
import { motion } from 'framer-motion';

const DataStream = () => {
    // A path that flows from left (pharmacy) to right (client) and forms a heartbeat
    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 0.5
            }
        }
    };

    return (
        <div className="data-stream-container">
            <svg width="100%" height="200" viewBox="0 0 800 200" className="stream-svg">
                <defs>
                    <linearGradient id="streamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--pharmacy-accent)" stopOpacity="0" />
                        <stop offset="50%" stopColor="var(--bridge-glow)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--client-accent)" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* The Path: Straight line -> Sine wave -> Heartbeat -> Straight line */}
                <motion.path
                    d="M 0 100 L 300 100 C 350 100 350 50 400 100 C 420 150 440 50 450 100 L 460 120 L 470 80 L 480 100 L 800 100"
                    fill="transparent"
                    stroke="url(#streamGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    variants={pathVariants}
                    initial="hidden"
                    animate="visible"
                />

                {/* Floating Particles flowing along the path (simplified implementation for CSS/SVG) */}
                <motion.circle r="3" fill="#fff" filter="url(#glow)">
                    <motion.animateMotion
                        dur="2.5s"
                        repeatCount="indefinite"
                        path="M 0 100 L 300 100 C 350 100 350 50 400 100 C 420 150 440 50 450 100 L 460 120 L 470 80 L 480 100 L 800 100"
                    />
                </motion.circle>
                <motion.circle r="2" fill="var(--bridge-glow)" filter="url(#glow)">
                    <motion.animateMotion
                        dur="2.5s"
                        begin="1.25s"
                        repeatCount="indefinite"
                        path="M 0 100 L 300 100 C 350 100 350 50 400 100 C 420 150 440 50 450 100 L 460 120 L 470 80 L 480 100 L 800 100"
                    />
                </motion.circle>
            </svg>
        </div>
    );
};

export default DataStream;
