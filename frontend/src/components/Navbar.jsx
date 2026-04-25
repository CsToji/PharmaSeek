import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Pill, Activity, Sun, Moon, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const userRole = user?.role;

    const [activeSection, setActiveSection] = useState('home');

    // Theme initialization and toggle
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // Check if we are on the landing page to apply specific styles
    const isLanding = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle hash updates
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    // Scroll Spy for Landing Page
    useEffect(() => {
        if (!isLanding) return;

        const sections = ['home', 'about', 'contact'];

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5 // Trigger when 50% of the section is visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [isLanding]);

    const navLinks = [
        { name: 'Home', path: '/#home', id: 'home' },
        { name: 'About', path: '/#about', id: 'about' }, // Smooth scroll anchor
        { name: 'Contact', path: '/#contact', id: 'contact' }, // Smooth scroll anchor
    ];

    return (
        <motion.nav
            className={`navbar ${scrolled ? 'scrolled' : ''} ${!isLanding ? 'dark-nav' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">
                        {/*<Activity size={24} />*/}
                        <img src="/Logo251x251.png" alt="logo" width={50} height={50} />
                    </div>
                    <span className="logo-text">PharmaSeek</span>
                </Link>

                {/* Desktop Menu */}
                <div className="navbar-links desktop-only">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`nav-link ${isLanding ? (activeSection === link.id ? 'active' : '') : (location.pathname === link.path ? 'active' : '')}`}
                            onClick={() => setActiveSection(link.id)}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="navbar-actions desktop-only">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    {isAuthenticated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {userRole === 'ADMIN' && (
                                <Link to="/admin" className="btn-nav btn-admin" style={{ background: 'var(--accent-primary)', color: '#fff', padding: '0.4rem 0.8rem' }}>Admin</Link>
                            )}
                            <User size={18} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.name?.split(' ')[0] || userRole}</span>
                            <button
                                className="btn-nav btn-logout"
                                onClick={async () => { await logout(); navigate('/'); }}
                                style={{ marginLeft: '0.5rem' }}
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn-nav btn-login">Login</Link>
                            <Link to="/signup" className="btn-nav btn-signup">Get Started</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="mobile-menu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="mobile-nav-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="mobile-actions">
                            <button
                                className="theme-toggle mobile-theme-toggle"
                                onClick={toggleTheme}
                                aria-label="Toggle Theme"
                            >
                                {theme === 'light' ? <><Moon size={20} /><span>Dark Mode</span></> : <><Sun size={20} /><span>Light Mode</span></>}
                            </button>
                            <Link to="/login" className="btn-nav btn-login full-width" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                            <Link to="/signup" className="btn-nav btn-signup full-width" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
