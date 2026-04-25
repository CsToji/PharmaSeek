import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Bell, Heart, Pill } from 'lucide-react';

const ClientElements = () => {
    return (
        <div className="client-3d-scene">
            {/* Phone Mockup */}
            <motion.div
                className="phone-mockup"
                initial={{ rotateY: -15, rotateX: 5, y: 50, opacity: 0 }}
                animate={{
                    rotateY: -5,
                    rotateX: 0,
                    y: [0, -15, 0],
                    opacity: 1
                }}
                transition={{
                    rotateY: { duration: 1, type: "spring" },
                    rotateX: { duration: 1, type: "spring" },
                    opacity: { duration: 1 },
                    y: {
                        repeat: Infinity,
                        duration: 6,
                        ease: "easeInOut"
                    }
                }}
            >
                <div className="phone-screen">
                    <div className="app-header">
                        <span>My Health</span>
                        <Heart size={16} className="text-red-500 fill-current" />
                    </div>

                    <div className="reminder-card">
                        <Pill size={16} className="text-emerald-500" />
                        <div>
                            <p className="font-bold">Take Metformin</p>
                            <p className="text-xs text-gray-500">8:00 AM - With Food</p>
                        </div>
                        <div className="checkbox checked"></div>
                    </div>

                    <div className="reminder-card">
                        <Pill size={16} className="text-blue-500" />
                        <div>
                            <p className="font-bold">Vitamin D</p>
                            <p className="text-xs text-gray-500">9:30 AM</p>
                        </div>
                        <div className="checkbox"></div>
                    </div>
                </div>
            </motion.div>

            {/* Calendar Icon */}
            {/*<motion.div
                className="floating-icon calendar"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
            >
                <Calendar size={24} className="text-blue-500" />
            </motion.div>

            {/* Bell Icon 
            <motion.div
                className="floating-icon bell"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
            >
                <Bell size={24} className="text-yellow-500" />
            </motion.div>*/}
        </div>
    );
};

export default ClientElements;
