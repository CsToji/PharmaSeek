import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PharmacyElements from '../components/3d/PharmacyElements';
import ClientElements from '../components/3d/ClientElements';
import LivingBackground from '../components/animations/LivingBackground';
import Navbar from '../components/Navbar';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import useGlobalPopup from '../components/PopupContext';
import './LandingPage.css';

const PARTICLE_COUNT = 20;

const PARTICLE_POSITIONS = Array.from({ length: PARTICLE_COUNT }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 5
}));

const LandingPage = () => {
    const heroRef = useRef(null);
    const { user, isAuthenticated } = useAuth();
    const { popup } = useGlobalPopup();
    const userRole = user?.role;

    return (
        <div className="landing-page-3d">
            <Navbar />

            <div className="hero-section" id="home" ref={heroRef}>
                <div className="particles">
                    {PARTICLE_POSITIONS.map((pos) => (
                        <div key={pos.top + pos.left} className="particle" style={{
                            top: `${pos.top}%`,
                            left: `${pos.left}%`,
                            animationDelay: `${pos.delay}s`
                        }}></div>
                    ))}
                </div>

                <div className="split-side pharmacy-side">
                    <LivingBackground theme="pharmacy" />
                    <div className="content-wrapper">
                        <div className="text-content">
                            <h2>Pharmacy</h2>
                            <p>Intelligence for modern pharmacies.</p>
                            <button 
                                className="btn-3d btn-pharmacy"
                                disabled={isAuthenticated && userRole === 'ADMIN'}
                                onClick={() => {
                                    if (isAuthenticated && userRole === 'ADMIN') {
                                        popup.error('Please use the Admin Dashboard to manage the system.');
                                    } else if (isAuthenticated && userRole === 'PHARMACY') {
                                        window.location.href = '/pharmacy';
                                    } else if (isAuthenticated && userRole === 'CLIENT') {
                                        popup.error('This dashboard is for pharmacies only. Please login as a pharmacy to access.');
                                    } else {
                                        window.location.href = '/login';
                                    }
                                }}
                            >
                                {isAuthenticated && userRole === 'PHARMACY' ? 'Access Dashboard' : isAuthenticated && userRole === 'ADMIN' ? 'Admin Only' : 'Login to Access'}
                            </button>
                        </div>
                        <div className="visual-content">
                            <PharmacyElements />
                        </div>
                    </div>
                </div>

                <div className="split-separator" />

                <div className="split-side client-side">
                    <LivingBackground theme="client" />
                    <div className="content-wrapper">
                        <div className="visual-content">
                            <ClientElements />
                        </div>
                        <div className="text-content">
                            <h2>Patient App</h2>
                            <p>Your health, simplified.</p>
                            <button 
                                className="btn-3d btn-client"
                                disabled={isAuthenticated && userRole === 'ADMIN'}
                                onClick={() => {
                                    if (isAuthenticated && userRole === 'ADMIN') {
                                        popup.error('Please use the Admin Dashboard to manage the system.');
                                    } else if (isAuthenticated && userRole === 'CLIENT') {
                                        window.location.href = '/client';
                                    } else if (isAuthenticated && userRole === 'PHARMACY') {
                                        popup.error('This app is for patients only. Please login as a client to access.');
                                    } else {
                                        window.location.href = '/login';
                                    }
                                }}
                            >
                                {isAuthenticated && userRole === 'CLIENT' ? 'Open App' : isAuthenticated && userRole === 'ADMIN' ? 'Admin Only' : 'Login to Access'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AboutSection />
            <ContactSection />
            <Footer />
        </div>
    );
};

export default LandingPage;