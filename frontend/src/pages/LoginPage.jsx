import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useGlobalPopup, { showPopup } from '../components/PopupContext';
import './Auth.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();
    const {popup} = useGlobalPopup();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            window.dispatchEvent(new CustomEvent('show-popup', { detail: { type: 'error', message: 'Please fill in all fields', duration: 3000 } }));
            return;
        }

        try {
            const response = await login(email, password);
            
            if (response && response.user) {
                const userRole = response.user.role;
                const redirectPath = userRole === 'CLIENT' ? '/client' : userRole === 'PHARMACY' ? '/pharmacy' : '/admin';
                
                window.dispatchEvent(new CustomEvent('show-popup', { detail: { type: 'valid', message: 'Login successful!', duration: 1500 } }));
                
                setTimeout(() => {
                    window.location.href = redirectPath;
                }, 1500);
            }
        } catch (error) {
            const msg = error.message || 'Invalid email or password';
            window.dispatchEvent(new CustomEvent('show-popup', { detail: { type: 'error', message: msg, duration: 4000 } }));
        }
    };

    return (
        <div className="auth-page">
            <Navbar />
            <div className="auth-container">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="auth-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to access your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-password">Forgot password?</a>
                        </div>

                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default LoginPage;
