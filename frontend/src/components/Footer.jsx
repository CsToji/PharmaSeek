import React from 'react';
import { Link } from 'react-router-dom';
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    Heart
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section brand-section">
                    <h3>PharmaSeek</h3>
                    <p>
                        Bridging the gap between pharmacies and patients with modern technology.
                        Streamlining healthcare access for everyone.
                    </p>
                    <div className="social-links">
                        <a href="#" className="social-icon"><Facebook size={20} /></a>
                        <a href="#" className="social-icon"><Twitter size={20} /></a>
                        <a href="#" className="social-icon"><Instagram size={20} /></a>
                        <a href="#" className="social-icon"><Linkedin size={20} /></a>
                    </div>
                </div>

                <div className="footer-section links-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/#home">Home</Link></li>
                        <li><Link to="/#about">About Us</Link></li>
                        <li><Link to="/#services">Services</Link></li>
                        <li><Link to="/#contact">Contact</Link></li>
                    </ul>
                </div>

                <div className="footer-section links-section">
                    <h4>Support</h4>
                    <ul>
                        <li><Link to="/help">Help Center</Link></li>
                        <li><Link to="/faq">FAQs</Link></li>
                        <li><Link to="/privacy">Privacy Policy</Link></li>
                        <li><Link to="/terms">Terms of Service</Link></li>
                    </ul>
                </div>

                {/*<div className="footer-section contact-section">
                    <h4>Contact Us</h4>
                    <div className="contact-item">
                        <Mail size={18} />
                        <span>support@pharmaseek.com</span>
                    </div>
                    <div className="contact-item">
                        <Phone size={18} />
                        <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="contact-item">
                        <MapPin size={18} />
                        <span>123 Health Valley, Tech City</span>
                    </div>
                </div>*/}
            </div>

            <div className="footer-bottom">
                <p>S. All 
                    &copy; {new Date().getFullYear()} PharmaSeek. All rights reserved.
                    Made with <Heart size={16} className="heart-icon" /> for better health.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
