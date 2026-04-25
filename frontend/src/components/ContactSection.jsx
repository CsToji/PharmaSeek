import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './ContactSection.css';

const ContactSection = () => {
    return (
        <section id="contact" className="contact-section">
            <div className="container">
                <div className="contact-grid">
                    <motion.div
                        className="contact-info"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Get it Touch</h2>
                        <p>Have questions? We're here to help you revolutionize your healthcare experience.</p>

                        <div className="contact-details">
                            <div className="detail-item">
                                <div className="icon-box"><Mail size={24} /></div>
                                <div>
                                    <h3>Email Us</h3>
                                    <p>support@pharmaseek.com</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="icon-box"><Phone size={24} /></div>
                                <div>
                                    <h3>Call Us</h3>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="icon-box"><MapPin size={24} /></div>
                                <div>
                                    <h3>Visit HQ</h3>
                                    <p>123 Health Valley, Tech City</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="contact-form-container"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <form className="contact-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" placeholder="John" />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" placeholder="john@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea rows="4" placeholder="How can we help you?"></textarea>
                            </div>
                            <button type="submit" className="btn-send">
                                Send Message <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
