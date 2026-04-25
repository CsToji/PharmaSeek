import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Search,
    CalendarCheck,
    Settings,
    LogOut,
    MapPin,
    ArrowLeft,
    Package,
    Navigation,
    Clock,
    CheckCircle2,
    X,
    Sun,
    Moon,
    Scan,
    Camera,
    Image as ImageIcon,
    ChevronDown,
    ExternalLink
} from 'lucide-react';
import { IoMdRefresh } from "react-icons/io";
import { useAuth } from '../context/AuthContext';
import drugService from '../services/drugService';
import reservationService from '../services/reservationService';
import pharmacyStockService from '../services/pharmacyStockService';
import clientService from '../services/clientService';
import aiService from '../services/aiService';
import usePopUp from '../components/usePopUp';
import './ClientDashboard.css';

const ClientDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const { user, logout } = useAuth();
    const { popup } = usePopUp();
    const navigate = useNavigate();
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
    const [currentMedicine, setCurrentMedicine] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isScanMenuOpen, setIsScanMenuOpen] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    
    const [reservations, setReservations] = useState([]);
    const [drugs, setDrugs] = useState([]);
    const [pharmacies, setPharmacies] = useState([]);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [expandedPharmacy, setExpandedPharmacy] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [settingsForm, setSettingsForm] = useState({
        name: user?.name || user?.firstName || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [nearbyCount, setNearbyCount] = useState(0);
    const [isNearbyHovered, setIsNearbyHovered] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const calculateNearbyPharmacies = (pharmaciesList) => {
        if (!navigator.geolocation) {
            setNearbyCount(pharmaciesList?.filter(p => p.latitude && p.longitude).length || 0);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const nearby = pharmaciesList.filter(p => {
                    if (!p.latitude || !p.longitude) return false;
                    const distance = getDistance(userLat, userLng, p.latitude, p.longitude);
                    return distance <= 5;
                });
                setNearbyCount(nearby.length);
            },
            () => {
                setNearbyCount(pharmaciesList?.filter(p => p.latitude && p.longitude).length || 0);
            }
        );
    };

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const isPharmacyOpen = (operatingHours) => {
        if (!operatingHours) return false;
        const now = new Date();
        const dayOfWeek = now.getDay();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[dayOfWeek];
        
        const dayMatch = operatingHours.match(new RegExp(today + '\\s*[-–]\\s*(\\d{1,2}):(\\d{2})\\s*[-–]\\s*(\\d{1,2}):(\\d{2})', 'i'));
        if (dayMatch) {
            const openHour = parseInt(dayMatch[1]);
            const openMin = parseInt(dayMatch[2]);
            const closeHour = parseInt(dayMatch[3]);
            const closeMin = parseInt(dayMatch[4]);
            const currentHour = now.getHours();
            const currentMin = now.getMinutes();
            const currentTime = currentHour * 60 + currentMin;
            const openTime = openHour * 60 + openMin;
            const closeTime = closeHour * 60 + closeMin;
            return currentTime >= openTime && currentTime <= closeTime;
        }
        return false;
    };

    const getDrugNames = (items) => {
        if (!items || items.length === 0) return 'N/A';
        return items.map(item => item.drugName).join(', ');
    };

    const getTimeRemaining = (expirationTime, status) => {
        if (status !== 'CONFIRMED') {
            return status === 'PENDING' ? 'Waiting...' : '-';
        }
        if (!expirationTime) return '-';
        const expires = new Date(expirationTime);
        const diff = expires - currentTime;
        if (diff < 0) return 'Expired';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (pharmacies.length > 0) {
            calculateNearbyPharmacies(pharmacies);
        }
    }, [pharmacies]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setLocationError(null);
            },
            (error) => {
                setLocationError(error.message);
            }
        );
    }, []);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchQuery.trim()) {
                setIsLoading(true);
                try {
                    const searchResult = await drugService.searchDrugs(searchQuery);
                    if (searchResult && searchResult.length > 0) {
                        setDrugs(searchResult);
                    } else {
                        setDrugs([]);
                    }
                    setSelectedDrug(null);
                } catch (error) {
                    console.error('Search error:', error);
                    setDrugs([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setDrugs([]);
                setSelectedDrug(null);
            }
        };

        const timeoutId = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleDrugClick = async (drug) => {
        setSelectedDrug(drug);
        setIsLoading(true);
        try {
            let pharmaciesData;
            if (user?.latitude && user?.longitude) {
                pharmaciesData = await pharmacyStockService.getNearbyPharmacies(drug.id, user.latitude, user.longitude);
            } else {
                pharmaciesData = await pharmacyStockService.getPharmaciesWithDrug(drug.id);
            }
            setPharmacies(pharmaciesData || []);
        } catch (error) {
            console.error('Error fetching pharmacies:', error);
            setPharmacies([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadData = async (query = '') => {
        setIsLoading(true);
        console.log('loadData called with query:', query);
        try {
            let drugsData = [];
            let pharmaciesData = [];
            
            if (query) {
                try {
                    const searchResult = await drugService.searchDrugs(query);
                    drugsData = searchResult ? [searchResult] : [];
                    
                    if (drugsData.length > 0) {
                        pharmaciesData = await pharmacyStockService.getPharmaciesWithDrug(drugsData[0].id);
                    }
                } catch (e) {
                    console.log('Drug search not found, showing all drugs');
                    drugsData = await drugService.getAllDrugs();
                }
            } else {
                drugsData = await drugService.getAllDrugs();
            }

            try {
                const allPharmacies = await pharmacyStockService.getAllPharmacies();
                pharmaciesData = allPharmacies || [];
                console.log('Loaded pharmacies:', pharmaciesData);
            } catch (e) {
                console.log('Could not load pharmacies:', e);
            }
            
            const reservationsData = await reservationService.getMyReservations();
            
            setReservations(reservationsData || []);
            setDrugs(drugsData || []);
            setPharmacies(pharmaciesData || []);
        } catch (error) {
            console.error('Failed to load data:', error);
            popup.error('Failed to load data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    const fileInputRef = React.useRef(null);
    const videoRef = React.useRef(null);

    const handleScanOption = (type) => {
        setIsScanMenuOpen(false);
        if (type === 'camera') {
            setIsCameraModalOpen(true);
        } else {
            if (fileInputRef.current) fileInputRef.current.click();
        }
    };
    
    React.useEffect(() => {
        let stream = null;
        if (isCameraModalOpen) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(s => {
                    stream = s;
                    if (videoRef.current) videoRef.current.srcObject = s;
                })
                .catch(err => {
                    console.error("Camera error:", err);
                    window.dispatchEvent(new CustomEvent('show-popup', { detail: { type: 'error', message: "Could not access the camera. Please allow camera permissions", duration: 4000 } }));
                    setIsCameraModalOpen(false);
                });
        }
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [isCameraModalOpen]);

    const capturePhoto = () => {
        setIsCameraModalOpen(false);
        window.dispatchEvent(new CustomEvent('show-popup', { detail: { type: 'info', message: 'Photo captured! Use gallery for AI detection', duration: 3000 } }));
    };

    const closeCamera = () => {
        setIsCameraModalOpen(false);
    };
    
    const handleFileChange = async (e) => {
        if(e.target.files && e.target.files.length > 0) {
            setIsLoading(true);
            try {
                const result = await aiService.detectDrug(e.target.files[0]);
                if (result.success && result.matched) {
                    setSearchQuery(result.drugName);
                    window.dispatchEvent(new CustomEvent('show-popup', { 
                        detail: { type: 'valid', message: `Detected: ${result.drugName}`, duration: 4000 } 
                    }));
                } else if (result.success && !result.matched) {
                    const suggestions = result.suggestions || [];
                    let msg = 'No matching medicine found';
                    if (suggestions.length > 0) {
                        msg += `. Try: ${suggestions.slice(0, 3).join(', ')}`;
                        setSearchQuery(suggestions[0]);
                    }
                    window.dispatchEvent(new CustomEvent('show-popup', { 
                        detail: { type: 'warning', message: msg, duration: 6000 } 
                    }));
                } else {
                    window.dispatchEvent(new CustomEvent('show-popup', { 
                        detail: { type: 'error', message: 'Detection failed. Try again.', duration: 4000 } 
                    }));
                }
            } catch (error) {
                console.error('Detection error:', error);
                window.dispatchEvent(new CustomEvent('show-popup', { 
                    detail: { type: 'error', message: 'Failed to detect medicine', duration: 4000 } 
                }));
            } finally {
                setIsLoading(false);
            }
        }
    };

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const filteredPharmacies = searchQuery ? (Array.isArray(pharmacies) ? pharmacies : []) : [];

    const handleReserve = async (pharmacy, medicineName) => {
        try {
            const drug = drugs.find(d => d.name?.toLowerCase().includes(medicineName.toLowerCase()));
            if (!drug) {
                popup.error('Drug not found');
                return;
            }
            const result = await reservationService.createReservation({
                pharmacyId: pharmacy.pharmacyId || pharmacy.id,
                items: [{ drugId: drug.id, quantity: 1 }]
            });
            if (result) {
                setReservations([result, ...reservations]);
                setIsReserveModalOpen(false);
                setActiveTab('reservations');
                popup.valid('Reservation created successfully!');
            }
        } catch (error) {
            popup.error('Failed to create reservation: ' + error.message);
        }
    };

const handleCancelReservation = async (reservationId) => {
        try {
            await reservationService.cancelReservation(reservationId);
            setReservations(reservations.map(r => 
                r.id === reservationId ? { ...r, status: 'CANCELLED' } : r
            ));
            window.dispatchEvent(new CustomEvent('show-popup', { detail: { type: 'valid', message: 'Reservation cancelled', duration: 3000 } }));
        } catch (error) {
            window.dispatchEvent(new CustomEvent('show-popup', { detail: { type: 'error', message: 'Failed to cancel reservation', duration: 4000 } }));
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const updatedUser = await clientService.updateMyProfile(settingsForm);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new CustomEvent('show-popup', { detail: { type: 'valid', message: 'Settings saved successfully!', duration: 3000 } }));
            setIsSaving(false);
            window.location.reload();
        } catch (error) {
            window.dispatchEvent(new CustomEvent('show-popup', { detail: { type: 'error', message: 'Failed to save settings', duration: 4000 } }));
            setIsSaving(false);
        }
    };

    const openMap = (pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setIsMapModalOpen(true);
    };

    const renderOverview = () => (
        <>
            <div className="stats-grid" 
                 style={isNearbyHovered ? { marginBottom: '100px' } : {}}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-secondary)' }}>
                        <CalendarCheck size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{reservations.filter(r => r.status === 'PENDING' || r.status === 'CONFIRMED').length}</div>
                        <div className="stat-label">Active Reservations</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-secondary)' }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{reservations.filter(r => r.status === 'PICKED_UP' || r.status === 'COMPLETED').length}</div>
                        <div className="stat-label">Completed Orders</div>
                    </div>
                </div>
                <div className="stat-card nearby-card" 
                     onMouseEnter={() => setIsNearbyHovered(true)}
                     onMouseLeave={() => setIsNearbyHovered(false)}
                     style={{ position: 'relative', cursor: 'pointer', zIndex: isNearbyHovered ? 999 : 10 }}>
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--purple, #8b5cf6)' }}>
                        <MapPin size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{nearbyCount}</div>
                        <div className="stat-label">Nearby Pharmacies (5km)</div>
                    </div>
                    {isNearbyHovered && pharmacies.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'var(--dash-card)',
                            border: '1px solid var(--dash-border)',
                            borderRadius: '8px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            zIndex: 1001,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            backdropFilter: 'blur(12px)',
                            padding: '8px 0'
                        }}>
                            {pharmacies.map((p, i) => (
                                <div key={p.id || i} style={{
                                    padding: '10px 12px',
                                    borderBottom: i < pharmacies.length - 1 ? '1px solid var(--dash-border)' : 'none',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '14px', color: 'var(--dash-text)' }}>
                                        {p.pharmacyName || p.name || 'Pharmacy'}
                                    </span>
                                    {(p.latitude || p.longitude) ? (
                                        <button
                                            className="btn btn-primary"
                                            style={{ fontSize: '11px', padding: '4px 10px' }}
                                            onClick={(e) => {
                                                window.open(`https://www.google.com/maps?q=${p.latitude},${p.longitude}`, '_blank');
                                            }}
                                        >
                                            Map
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '10px', color: 'var(--dash-text-muted)' }}>No loc</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="section-container">
                <div className="section-header">
                    <h2>Recent Reservations</h2>
                    <button className="btn btn-primary" onClick={() => setActiveTab('reservations')}>View All</button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Pharmacy</th>
                                <th>Medicine</th>
                                <th>Time Left</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.slice(0, 3).map(res => (
                                <tr key={res.id}>
                                    <td><strong>{res.id}</strong></td>
                                    <td>{res.pharmacyName || `Pharmacy #${res.pharmacyId}`}</td>
                                    <td>{getDrugNames(res.items)}</td>
                                    <td>
                                        <span style={{ color: res.status === 'CONFIRMED' && res.expirationTime && new Date(res.expirationTime) < currentTime ? 'var(--danger, #dc3545)' : 'inherit' }}>
                                            {getTimeRemaining(res.expirationTime, res.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${res.status === 'DONE' ? 'badge-success' : res.status === 'CANCELLED' || res.status === 'EXPIRED' ? 'badge-danger' : 'badge-warning'}`}>
                                            {res.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    const renderSearch = () => (
        <>
            <div className="section-container">
                <div className="section-header">
                    <h2 style={{ textAlign: 'left' }}>Search Medicines</h2>
                </div>
                <div className="search-bar" style={{ position: 'relative', width: '100%', maxWidth: '500px', display: 'flex', gap: '0.8rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Type medicine name (e.g. Amoxicillin)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '15px', border: '1px solid var(--dash-border)', background: 'var(--dash-card)', color: 'var(--dash-text)' }}
                        />
                    </div>
                    <button 
                        className="btn-icon" 
                        style={{ height: '100%', width: '48px', borderRadius: '15px', background: 'var(--dash-card)', flexShrink: 0 , padding:"0.8rem"}}
                        onClick={() => setIsScanMenuOpen(!isScanMenuOpen)}
                        title="Scan Prescription or Medicine"
                    >
                        <Scan size={20} />
                    </button>
                    
                    {isScanMenuOpen && (
                        <>
                            <div 
                                onClick={() => setIsScanMenuOpen(false)}
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 9998
                                }}
                            />
                            <div className="scan-dropdown" style={{
                                position: 'fixed',
                                top: '200px',
                                left: 'calc(50% - 280px)',
                                background: 'var(--dash-client-sidebar)',
                                border: '1px solid var(--dash-border)',
                                borderRadius: '12px',
                                padding: '0.75rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                width: '220px',
                                zIndex: 9999,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }}>
                            <button className="nav-item" onClick={() => handleScanOption('camera')} style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                                <Camera size={18} /> Take Photo
                            </button>
                            <button className="nav-item" onClick={() => handleScanOption('gallery')} style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                                    <ImageIcon size={18} /> Upload from Gallery
                                </button>
                            </div>
                        </>
                    )}
                    <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
            </div>

{searchQuery ? (
                <div className="search-results">
                    {!selectedDrug ? (
                        <div className="search-results-grid">
                            {drugs.length > 0 ? (
                                drugs.map(drug => (
                                    <div key={drug.id} className="pharmacy-card" onClick={() => handleDrugClick(drug)} style={{ cursor: 'pointer' }}>
                                        <div className="pharmacy-info">
                                            <h3>{drug.name}</h3>
                                            <p>{drug.description || 'No description available'}</p>
                                            {drug.requiresPrescription && (
                                                <span className="badge badge-warning">Requires Prescription</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1/-1' }}>No medicines found matching "{searchQuery}"</p>
                            )}
                        </div>
                    ) : (
                        <div className="search-results-grid">
                            <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button className="btn btn-secondary" onClick={() => setSelectedDrug(null)} style={{ padding: '0.5rem 1rem' ,color: 'black'}}>
                                    Back
                                </button>
                                <h3>Pharmacies with "{selectedDrug.name}" in stock:</h3>
                            </div>
                            {pharmacies.length > 0 ? (
                                pharmacies.map(pharma => {
                                    const distance = userLocation && pharma.latitude && pharma.longitude 
                                        ? getDistance(userLocation.latitude, userLocation.longitude, pharma.latitude, pharma.longitude)
                                        : null;
                                    const isOpen = pharma.operatingHours ? isPharmacyOpen(pharma.operatingHours) : null;
                                    return (
                                        <div key={pharma.id} className="pharmacy-card" style={{ position: 'relative' }}>
                                            <div className="pharmacy-info" onClick={() => setExpandedPharmacy(expandedPharmacy === pharma.id ? null : pharma.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '2rem' }}>
                                                <div>
                                                    <h3>{pharma.pharmacyName || 'Pharmacy'}</h3>
                                                </div>
                                                <ChevronDown size={20} style={{ transform: expandedPharmacy === pharma.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                                {distance !== null && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: distance <= 1 ? 'var(--success, #16a34a)' : 'var(--text-secondary)' }}>
                                                        <Navigation size={14} />
                                                        {distance < 1 ? '<1 km' : `${distance.toFixed(1)} km`}
                                                    </span>
                                                )}
                                                {pharma.operatingHours && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: isOpen ? 'var(--success, #16a34a)' : 'var(--danger, #dc2626)' }}>
                                                        <Clock size={14} />
                                                        {isOpen ? 'Open now' : 'Closed'}
                                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>({pharma.operatingHours})</span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="stock-status">
                                                {pharma.quantity > 0 ? (
                                                    <span className="badge badge-success">In Stock</span>
                                                ) : (
                                                    <span className="badge badge-danger">Out of Stock</span>
                                                )}
                                                <p>Price: {pharma.price} TDN</p>
                                                {pharma.quantity > 0 && (
                                                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => { setSelectedPharmacy(pharma); setCurrentMedicine(selectedDrug.name); setIsReserveModalOpen(true); }}>
                                                        Reserve Now
                                                    </button>
                                                )}
                                            </div>
                                            {expandedPharmacy === pharma.id && pharma.latitude && pharma.longitude && (
                                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                                    <button
                                                        onClick={() => window.open(`https://www.google.com/maps?q=${pharma.latitude},${pharma.longitude}`, '_blank')}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                    >
                                                        <ExternalLink size={16} />
                                                        Show in Maps
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1/-1' }}>No pharmacies found with this medicine in stock.</p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Enter a medicine name to see available pharmacies nearby.</p>
                </div>
            )}
        </>
    );

    const renderReservations = () => (
        <div className="section-container">
            <div className="section-header">
                <h2>My Reservations</h2>
                <button className="btn" onClick={() => { window.dispatchEvent(new CustomEvent('show-popup', { detail: { type: 'valid', message: 'Refreshing...', duration: 1000 } })); loadData(); }} title="Refresh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <IoMdRefresh size={18}/>
                </button>
            </div>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Pharmacy</th>
                            <th>Medicine</th>
                            <th>Date</th>
                            <th>Time Left</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map(res => (
                            <tr key={res.id}>
                                <td><strong>{res.id}</strong></td>
                                <td>{res.pharmacyName || `Pharmacy #${res.pharmacyId}`}</td>
                                <td>{getDrugNames(res.items)}</td>
                                <td>{res.reservedAt ? new Date(res.reservedAt).toLocaleDateString() : res.date}</td>
                                <td>
                                    <span style={{ color: res.status === 'CONFIRMED' && res.expirationTime && new Date(res.expirationTime) < currentTime ? 'var(--danger, #dc3545)' : 'inherit' }}>
                                        {getTimeRemaining(res.expirationTime, res.status)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${res.status === 'DONE' ? 'badge-success' : res.status === 'CANCELLED' || res.status === 'EXPIRED' ? 'badge-danger' : 'badge-warning'}`}>
                                        {res.status}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        className="btn-icon" 
                                        title="View on Map"
                                        onClick={() => {
                                            if (res.pharmacyLatitude && res.pharmacyLongitude) {
                                                window.open(`https://www.google.com/maps?q=${res.pharmacyLatitude},${res.pharmacyLongitude}`, '_blank');
                                            }
                                        }}
                                        disabled={!res.pharmacyLatitude || !res.pharmacyLongitude}
                                    >
                                        <MapPin size={16} />
                                    </button>
                                    {res.status === 'CONFIRMED' && (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>Pick it up!</span>
                                    )}
                                    {res.status === 'PENDING' && (
                                        <button 
                                            className="btn-icon" 
                                            title="Cancel Reservation"
                                            onClick={() => handleCancelReservation(res.id)}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="section-container">
            <div className="section-header">
                <h2>Account Settings</h2>
            </div>
<form style={{ maxWidth: '600px' }} onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input 
                        type="text" 
                        value={settingsForm.name}
                        onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                        placeholder="Enter your full name"
                    />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input 
                        type="email" 
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                        placeholder="Enter your email"
                    />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                        type="tel" 
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})}
                        placeholder="Enter your phone number"
                    />
                </div>
                <button className="btn btn-primary" type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-brand">
                    {/*<div style={{ padding: '8px', background: 'white', borderRadius: '10px', color: 'var(--accent-secondary)' }}>
                        <Package size={24} />
                    </div>*/}
                    <div className="logo-icon">
                        {/*<Activity size={24} />*/}
                        <img src="/Logo251x251.png" alt="logo" width={50} height={50} />
                    </div>
                    <span style={{ color: 'var(--accent-secondary)' }}>PharmaSeek</span>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <LayoutDashboard size={20} />
                        <span>Overview</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        <Search size={20} />
                        <span>Find Medicines</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'reservations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reservations')}
                    >
                        <CalendarCheck size={20} />
                        <span>My Reservations</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-title">
                        <h1>
                            {activeTab === 'overview' ? 'Hello'+', ' + user?.name + '!' :
                                activeTab === 'search' ? 'Find Your Medicine' :
                                    activeTab === 'reservations' ? 'Your Reservations' : 'Settings'}
                        </h1>
                        <p>
                            {activeTab === 'overview' ? 'Welcome back to your health portal.' :
                                activeTab === 'search' ? 'Search nearby pharmacies for what you need.' :
                                    activeTab === 'reservations' ? 'Track your active and past pickup orders.' : 'Manage your profile and preferences.'}
                        </p>
                    </div>
                    <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <Link to="/" className="btn btn-outline">
                            <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Home
                        </Link>
                    </div>
                </header>

                <div className="dashboard-content" style={{ position: 'relative' }}>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'search' && renderSearch()}
                    {activeTab === 'reservations' && renderReservations()}
                    {activeTab === 'settings' && renderSettings()}
                </div>

                {/* Map Modal */}
                {isMapModalOpen && selectedPharmacy && (
                    <div className="modal-overlay" onClick={() => setIsMapModalOpen(false)}>
                        <div className="modal-content wide" onClick={e => e.stopPropagation()}>
                            <div className="section-header">
                                <h2>Location: {selectedPharmacy.name}</h2>
                                <button className="btn-icon" onClick={() => setIsMapModalOpen(false)}><X size={20} /></button>
                            </div>
                            <div className="map-placeholder">
                                <div className="map-grid"></div>
                                <div className="map-marker">
                                    <MapPin size={48} fill="currentColor" />
                                </div>
                                <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'var(--dash-card)', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: 'var(--dash-text)', border: '1px solid var(--dash-border)' }}>
                                    <p style={{ fontWeight: 600 }}>{selectedPharmacy.name}</p>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{selectedPharmacy.address}</p>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="btn btn-primary" onClick={() => setIsMapModalOpen(false)}>Close Map</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reserve Modal */}
                {isReserveModalOpen && selectedPharmacy && (
                    <div className="modal-overlay" onClick={() => setIsReserveModalOpen(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h2>Confirm Reservation</h2>
                            <p>You are about to reserve <strong>{currentMedicine}</strong> at <strong>{selectedPharmacy.pharmacyName}</strong>.</p>
                            <p style={{ margin: '1rem 0', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '0.9rem' }}>
                                <Clock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                The reservation will be valid for {selectedPharmacy.reservationDelayMinutes || 24} hours.
                            </p>
                            <p>Price: ${selectedPharmacy.price}</p>
                            <div className="form-actions">
                                <button className="btn btn-outline" onClick={() => setIsReserveModalOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={() => handleReserve(selectedPharmacy, currentMedicine)}>Confirm Reservation</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Camera Modal */}
                {isCameraModalOpen && (
                    <div className="modal-overlay" onClick={closeCamera}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="section-header" style={{ width: '100%', marginBottom: '1.5rem' }}>
                                <h2>Scan Medicine Photo</h2>
                                <button className="btn-icon" onClick={closeCamera}><X size={20} /></button>
                            </div>
                            <div style={{ width: '100%', height: '350px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid var(--dash-border)' }}>
                                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', border: '2px dashed rgba(255,255,255,0.7)', borderRadius: '10px' }}></div>
                                <div style={{ position: 'absolute', bottom: '10px', left: '0', width: '100%', textAlign: 'center', color: 'white', fontSize: '0.8rem', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Center the medicine in the frame</div>
                            </div>
                            <div className="form-actions" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>
                                <button className="btn btn-primary" onClick={capturePhoto} style={{ padding: '0.8rem 2rem', fontSize: '1rem', width: '100%' }}>
                                    <Camera size={18} style={{ marginRight: '8px' }} /> Capture Photo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ClientDashboard;

