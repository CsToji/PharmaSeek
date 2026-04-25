import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Clock, Award, CheckCircle } from 'lucide-react';
import './AboutSection.css';

const AboutSection = () => {
    const features = [
        {
            icon: <ShieldCheck size={32} />,
            title: "Secure & Private",
            description: "Your health data is encrypted and protected with industry-standard security measures."
        },
        {
            icon: <Clock size={32} />,
            title: "24/7 Access",
            description: "Manage your prescriptions and health records anytime, anywhere."
        },
        {
            icon: <Award size={32} />,
            title: "Certified Pharmacies",
            description: "We only partner with verified and licensed pharmacies to ensure quality care."
        }
    ];

    return (
        <section id="about" className="about-section">
            <div className="container">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 id="revo">Revolutionizing Healthcare Access</h2>
                    <p>
                        PharmaSeek bridges the gap between modern pharmacies and patients,
                        creating a seamless ecosystem for better health outcomes.
                    </p>
                </motion.div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="feature-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="stats-container">
                    <div className="stat-item">
                        <h3>10k+</h3>
                        <p>Active Users</p>
                    </div>
                    <div className="stat-item">
                        <h3>500+</h3>
                        <p>Pharmacies</p>
                    </div>
                    <div className="stat-item">
                        <h3>98%</h3>
                        <p>Satisfaction</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
