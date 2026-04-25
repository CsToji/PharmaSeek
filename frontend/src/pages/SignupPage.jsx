import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, User, Stethoscope, Building, FileBadge, Phone, IdCard, Store, MapPin, Navigation, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useGlobalPopup from '../components/PopupContext';
import './Auth.css';

const SignupPage = () => {
    const [role, setRole] = useState('client');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { signup } = useAuth();
    const {popup} = useGlobalPopup();

    // Common fields
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    // Patient fields
    const [fullName, setFullName] = useState('');

    // Pharmacy fields
    const [pharmacyName, setPharmacyName] = useState('');
    const [taxId, setTaxId] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [operatingHours, setOperatingHours] = useState('');
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            popup.error('Geolocation is not supported by your browser');
            return;
        }
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                setLatitude(lat);
                setLongitude(lng);

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                        { headers: { 'User-Agent': 'PharmaSeek/1.0' } }
                    );
                    const data = await response.json();
                    if (data.display_name) {
                        setAddress(data.display_name);
                        popup.valid('Location and address captured!');
                    } else {
                        popup.valid('Location captured! (Address not found)');
                    }
                } catch (error) {
                    popup.valid('Location captured! (Could not fetch address)');
                }

                setIsGettingLocation(false);
            },
            (error) => {
                setIsGettingLocation(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        popup.error('Location permission denied. Please enable location access.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        popup.error('Location information is unavailable.');
                        break;
                    case error.TIMEOUT:
                        popup.error('Location request timed out.');
                        break;
                    default:
                        popup.error('An error occurred while getting location.');
                }
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate fields
        if (role === 'client') {
            if (!fullName || !email || !phone || !password) {
                popup.error('Please fill in all fields');
                return;
            }
            if (password.length < 8) {
                popup.error('Password must be at least 8 characters');
                return;
            }
            if (phone.length !== 8) {
                popup.error('Phone number must be 8 digits');
                return;
            }
        } else {
            if (!latitude || !longitude) {
                popup.error('Please get your pharmacy location using the GPS button');
                return;
            }
            if (!pharmacyName || !email || !taxId || !address || !password) {
                popup.error('Please fill in all fields');
                return;
            }
            if (password.length < 8) {
                popup.error('Password must be at least 8 characters');
                return;
            }
        }

        setIsLoading(true);
        try {
            let userData;
            if (role === 'client') {
                userData = {
                    name: fullName,
                    email,
                    phone,
                    password,
                };
            } else {
                userData = {
                    pharmacyName,
                    email,
                    taxId,
                    password,
                    address,
                    latitude: latitude ? parseFloat(latitude) : 0,
                    longitude: longitude ? parseFloat(longitude) : 0,
                    operatingHours,
                };
            }

            await signup(userData, role);
            
            if (role === 'pharmacy') {
                window.dispatchEvent(new CustomEvent('show-popup', { 
                    detail: { 
                        type: 'valid', 
                        message: 'Your request submitted! You will receive an email within 24 hours.', 
                        duration: 5000 
                    } 
                }));
                navigate('/login');
            } else {
                window.dispatchEvent(new CustomEvent('show-popup', { detail: { type: 'valid', message: 'Account created successfully!', duration: 4000 } }));
                setTimeout(() => navigate('/login'), 1500);
            }
        } catch (error) {
            console.error('Signup error:', error);
            window.dispatchEvent(new CustomEvent('show-popup', { 
                detail: { 
                    type: 'error', 
                    message: error.message || 'Signup failed. Please try again.', 
                    duration: 4000 
                } 
            }));
        } finally {
            setIsLoading(false);
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
                    {role === 'pharmacy' && (
                            <div className="form-group" style={{ background: 'var(--info-bg, #e3f2fd)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--info-border, #2196f3)' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary, #666)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Navigation size={16} />
                                    You must be at your pharmacy location with GPS enabled to create an account.
                                </p>
                            </div>
                        )}

                        <div className="auth-header">
                            {role === 'pharmacy' ? (
                                <>
                                    <h2>Register Pharmacy</h2>
                                    <p>Set your pharmacy location to continue</p>
                                </>
                            ) : (
                                <>
                                    <h2>Create Account</h2>
                                    <p>Join PharmaSeek today</p>
                                </>
                            )}
                        </div>

                    <div className="role-selector">
                        <button
                            className={`role-btn ${role === 'client' ? 'active' : ''}`}
                            onClick={() => setRole('client')}
                            disabled={isLoading}
                        >
                            <User size={18} />
                            Patient
                        </button>
                        <button
                            className={`role-btn ${role === 'pharmacy' ? 'active' : ''}`}
                            onClick={() => setRole('pharmacy')}
                            disabled={isLoading}
                        >
                            <Stethoscope size={18} />
                            Pharmacy
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="auth-form">
                    {role === 'client' && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>)}

                        {role === 'pharmacy' && (
                            <div className="form-group">
                                <label>Pharmacy Name</label>
                                <div className="input-wrapper">
                                    <Store size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="HealthPlus Pharmacy"
                                        value={pharmacyName}
                                        onChange={(e) => setPharmacyName(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        {role === 'pharmacy' && (
                            <div className="form-group">
                                <label>Tax ID / Registration Number</label>
                                <div className="input-wrapper">
                                    <FileBadge size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Your tax ID"
                                        value={taxId}
                                        onChange={(e) => setTaxId(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        {role === 'pharmacy' && (
                            <div className="form-group">
                                <label>Address</label>
                                <div className="input-wrapper">
                                    <MapPin size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="123 Main Street, City"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        {role === 'pharmacy' && (
                            <div className="form-group">
                                <label>Pharmacy Location</label>
                                <button
                                    type="button"
                                    className="btn-submit"
                                    onClick={getCurrentLocation}
                                    disabled={isGettingLocation}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: latitude ? 'var(--success, #4caf50)' : 'var(--primary)', color: 'var(--text-primary)' }}
                                >
                                    <Navigation size={18} />
                                    {isGettingLocation ? 'Getting Location...' : latitude ? `Location Set: ${latitude}, ${longitude}` : 'Get Current Location (Required)'}
                                </button>
                            </div>
                        )}
                        {role === 'pharmacy' && (
                            <div className="form-group">
                                <label>Operating Hours</label>
                                <div className="input-wrapper">
                                    <Clock size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="e.g. Mon-Fri: 9AM-6PM, Sat: 10AM-2PM"
                                        value={operatingHours}
                                        onChange={(e) => setOperatingHours(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        )}

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
                            <label>Phone (8 digits)</label>
                            <div className="input-wrapper">
                                <Phone size={18} className="input-icon" />
                                <input
                                    type="tel"
                                    placeholder="12345678"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password (min 8 characters)</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Sign in</Link></p>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default SignupPage;
