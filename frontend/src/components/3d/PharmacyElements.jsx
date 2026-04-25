import React from 'react';
import { motion } from 'framer-motion';
import { Box, BarChart, CheckCircle, TrendingUp } from 'lucide-react';

const PharmacyElements = () => {
    return (
        <div className="pharmacy-3d-scene">
            {/* Main Inventory Dashboard Card */}
            <motion.div
                className="iso-card main-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="card-header">
                    <Box size={20} className="text-cyan-400" />
                    <span>Inventory Status</span>
                </div>
                <div className="card-body">
                    <div className="stat-row">
                        <span>Amoxicillin</span>
                        <span className="text-green-400">In Stock</span>
                    </div>
                    <div className="stat-row">
                        <span>Insulin (Lispro)</span>
                        <span className="text-yellow-400">Low Stock</span>
                    </div>
                    <div className="graph-placeholder">
                        <div className="bar" style={{ height: '60%' }}></div>
                        <div className="bar" style={{ height: '80%' }}></div>
                        <div className="bar" style={{ height: '40%' }}></div>
                        <div className="bar" style={{ height: '90%' }}></div>
                    </div>
                </div>
            </motion.div>

            {/* Floating Verification Badge */}
            <motion.div
                className="iso-badge"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            >
                <TrendingUp size={24} />
                <span>+12% Revenue</span>
            </motion.div>
        </div>
    );
};

export default PharmacyElements;
