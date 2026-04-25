import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    CalendarCheck,
    Settings,
    LogOut,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    CheckCircle2,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    AlertTriangle,
    ArrowLeft,
    Sun,
    Moon,
    Navigation
} from 'lucide-react';
import { IoMdRefresh } from "react-icons/io";
import { useAuth } from '../context/AuthContext';
import reservationService from '../services/reservationService';
import pharmacyStockService from '../services/pharmacyStockService';
import pharmacyService from '../services/pharmacyService';
import useGlobalPopup from '../components/PopupContext';
import './PharmacyDashboard.css';

const PharmacyDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { user, logout } = useAuth();
    const { popup } = useGlobalPopup();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: '',
        stock: '',
        price: '',
        status: 'In Stock'
    });
    const [settingsForm, setSettingsForm] = useState({
        pharmacyName: '',
        email: '',
        phone: '',
        address: '',
        latitude: '',
        longitude: '',
        operatingHours: '',
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    const [inventoryData, setInventoryData] = useState([]);
    const [reservationsData, setReservationsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [inventory, reservations] = await Promise.all([
                pharmacyStockService.getMyInventory(),
                reservationService.getMyPharmacyReservations()
            ]);
            setInventoryData(inventory || []);
            setReservationsData(reservations || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadReservations = async () => {
        try {
            const reservations = await reservationService.getMyPharmacyReservations();
            setReservationsData(reservations || []);
            window.dispatchEvent(new CustomEvent('show-popup', {
                detail: { type: 'valid', message: 'Reservations refreshed', duration: 2000 }
            }));
        } catch (error) {
            console.error('Failed to load reservations:', error);
        }
    };

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    React.useEffect(() => {
        if (user) {
            setSettingsForm({
                pharmacyName: user.pharmacyName || user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                latitude: user.latitude || '',
                longitude: user.longitude || '',
                operatingHours: user.operatingHours || '',
            });
        }
    }, [user]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSavingSettings(true);
        try {
            await pharmacyService.updateMyPharmacy({
                pharmacyName: settingsForm.pharmacyName,
                email: settingsForm.email,
                phone: settingsForm.phone,
                address: settingsForm.address,
                latitude: settingsForm.latitude ? parseFloat(settingsForm.latitude) : null,
                longitude: settingsForm.longitude ? parseFloat(settingsForm.longitude) : null,
                operatingHours: settingsForm.operatingHours,
            });
            popup.valid('Settings saved successfully!');
            window.location.reload();
        } catch (error) {
            popup.error('Failed to save settings: ' + error.message);
        } finally {
            setIsSavingSettings(false);
        }
    };

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

                setSettingsForm(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                }));

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                        { headers: { 'User-Agent': 'PharmaSeek/1.0' } }
                    );
                    const data = await response.json();
                    if (data.display_name) {
                        setSettingsForm(prev => ({
                            ...prev,
                            address: data.display_name
                        }));
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

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleUpdateReservationStatus = async (reservationId, status) => {
        try {
            await reservationService.updateReservationStatus(reservationId, status);
            popup.valid('Reservation status updated!');
            
            if (status === 'CONFIRMED' || status === 'DONE' || status === 'CANCELLED') {
                const [inventory, reservations] = await Promise.all([
                    pharmacyStockService.getMyInventory(),
                    reservationService.getMyReservations()
                ]);
                setInventoryData(inventory || []);
                setReservationsData(reservations || []);
            }
        } catch (error) {
            popup.error('Failed to update status: ' + error.message);
        }
    };

    const handleDeleteStock = async (stockId) => {
        try {
            await pharmacyStockService.deleteStock(stockId);
            setInventoryData(inventoryData.filter(item => item.id !== stockId));
            popup.valid('Stock deleted!');
        } catch (error) {
            popup.error('Failed to delete stock: ' + error.message);
        }
    };

    const renderOverview = () => {
        const totalProducts = inventoryData.length;
        const lowStockItems = inventoryData.filter(item => item.quantity < 10).length;
        const today = new Date().toDateString();
        const reservationsToday = reservationsData.filter(res => {
            const resDate = new Date(res.reservedAt).toDateString();
            return resDate === today;
        }).length;
        const totalGained = reservationsData
            .filter(res => {
                const resDate = new Date(res.reservedAt).toDateString();
                return resDate === today && res.status === 'DONE';
            })
            .reduce((sum, res) => {
                if (res.total) return sum + parseFloat(res.total);
                if (res.items) {
                    return sum + res.items.reduce((itemSum, item) => {
                        return itemSum + (item.priceAtReservation * item.quantity);
                    }, 0);
                }
                return sum;
            }, 0);

        return (
            <>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--pharmacy-accent)' }}>
                            <Package size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{totalProducts}</div>
                            <div className="stat-label">Total Products</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger, #f87171)' }}>
                            <AlertTriangle size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{lowStockItems}</div>
                            <div className="stat-label">Low Stock items</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success, #34d399)' }}>
                            <CalendarCheck size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{reservationsToday}</div>
                            <div className="stat-label">Reservations Today</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--purple, #a78bfa)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{totalGained.toFixed(2)} TDN</div>
                            <div className="stat-label">Total Gained Today</div>
                        </div>
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
                                    <th>Order ID</th>
                                    <th>Patient</th>
                                    <th>Medicine</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservationsData.slice(0, 3).map(res => (
                                    <tr key={res.id}>
                                        <td><strong>{res.id}</strong></td>
                                        <td>Client #{res.clientId}</td>
                                        <td>{res.items && res.items.length > 0 ? `${res.items.length} item(s)` : 'N/A'}</td>
                                        <td>
                                            <span className={`badge ${res.status === 'PENDING' ? 'badge-warning' :
                                                res.status === 'CONFIRMED' ? 'badge-info' :
                                                    res.status === 'DONE' ? 'badge-success' : 'badge-info'
                                                }`}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td>
                                            {res.status === 'PENDING' && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleUpdateReservationStatus(res.id, 'CONFIRMED')}
                                                    title="Confirm Reservation"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            {res.status === 'CONFIRMED' && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleUpdateReservationStatus(res.id, 'DONE')}
                                                    title="Mark as Done"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        );
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const updated = await pharmacyStockService.updateStock(currentProductId, {
                    quantity: parseInt(newProduct.quantity),
                    price: parseFloat(newProduct.price),
                    reservationDelayMinutes: parseInt(newProduct.delay)
                });
                setInventoryData(inventoryData.map(item =>
                    item.id === currentProductId ? { ...item, ...updated } : item
                ));
                popup.valid('Stock updated!');
            } else {
                const created = await pharmacyStockService.addStockWithDrug(
                    {
                        name: newProduct.drugName,
                        description: newProduct.drugDescription || '',
                        category: newProduct.drugCategory || '',
                        manufacturer: newProduct.drugManufacturer || '',
                        requiresPrescription: newProduct.drugRequiresPrescription || false,
                    },
                    {
                        quantity: parseInt(newProduct.quantity),
                        price: parseFloat(newProduct.price),
                        reservationDelayMinutes: parseInt(newProduct.delay) || 24
                    }
                );
                setInventoryData([...inventoryData, created]);
                popup.valid('Product added!');
            }
            setIsModalOpen(false);
            setIsEditing(false);
            setNewProduct({ drugName: '', drugDescription: '', drugCategory: '', drugManufacturer: '', drugRequiresPrescription: false, quantity: '', price: '', delay: '24' });
        } catch (error) {
            popup.error('Failed to save: ' + error.message);
        }
    };

    const handleEditClick = (product) => {
        setIsEditing(true);
        setCurrentProductId(product.id);
        setNewProduct({
            drugName: product.drugName,
            quantity: product.quantity,
            price: product.price,
            delay: product.reservationDelayMinutes || 24
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setIsEditing(false);
        setNewProduct({ drugName: '', drugDescription: '', drugCategory: '', drugManufacturer: '', drugRequiresPrescription: false, quantity: '', price: '', delay: '24' });
        setIsModalOpen(true);
    };

    const renderInventory = () => (
        <div className="section-container">
            <div className="section-header">
                <h2>Product Inventory</h2>
                <div className="action-btns">
                    {/*<button className="btn btn-secondary"><Filter size={18} /> Filter</button>*/}
                    <button className="btn btn-primary" onClick={openAddModal}><Plus size={18} /> Add New Product</button>
                </div>
            </div>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Medicine Name</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Delay (hours)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventoryData.map(item => (
                            <tr key={item.id}>
                                <td><strong>{item.drugName || 'Drug #' + item.drugId}</strong></td>
                                <td>
                                    <span className={item.quantity < 10 ? 'text-danger' : ''}>
                                        {item.quantity}
                                    </span>
                                </td>
                                <td>{item.price} TDN</td>
                                <td>{item.reservationDelayMinutes || 24}h</td>
                                <td>
                                    <div className="action-btns">
                                        <button className="btn-icon" onClick={() => handleEditClick(item)}><Edit2 size={16} /></button>
                                        <button className="btn-icon" onClick={() => handleDeleteStock(item.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderReservations = () => {
        const getStatusBadge = (status) => {
            switch (status) {
                case 'PENDING': return 'badge-warning';
                case 'CONFIRMED': return 'badge-info';
                case 'DONE': return 'badge-success';
                case 'CANCELLED': return 'badge-danger';
                case 'EXPIRED': return 'badge-danger';
                default: return 'badge-info';
            }
        };

        const getTimeRemaining = (expirationTime, status) => {
            if (status !== 'CONFIRMED') {
                return status === 'PENDING' ? 'Waiting...' : '-';
            }
            if (!expirationTime) return 'No limit';
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

        const getDrugNames = (items) => {
            if (!items || items.length === 0) return 'N/A';
            return items.map(item => item.drugName).join(', ');
        };

        return (
            <div className="section-container">
                <div className="section-header">
                    <h2>Manage Reservations</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button className="btn" onClick={() => { window.dispatchEvent(new CustomEvent('show-popup', { detail: { type: 'valid', message: 'Refreshing...', duration: 1000 } })); loadData(); }} title="Refresh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IoMdRefresh size={18} />
                        </button>
                    </div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Patient</th>
                                <th>Medicines</th>
                                <th>Time Left</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservationsData.map(res => (
                                <tr key={res.id}>
                                    <td><strong>{res.id}</strong></td>
                                    <td>{res.clientName || `Client #${res.clientId}`}</td>
                                    <td>{getDrugNames(res.items)}</td>
                                    <td>
                                        <span style={{ color: res.status === 'CONFIRMED' && res.expirationTime && new Date(res.expirationTime) < currentTime ? 'var(--danger, #dc3545)' : 'inherit' }}>
                                            {getTimeRemaining(res.expirationTime, res.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(res.status)}`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            {res.status === 'PENDING' && (
                                                <>
                                                    <button className="btn-icon" title="Confirm" onClick={() => handleUpdateReservationStatus(res.id, 'CONFIRMED')}>
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                    <button className="btn-icon" title="Cancel" onClick={() => handleUpdateReservationStatus(res.id, 'CANCELLED')}>
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {res.status === 'CONFIRMED' && (
                                                <button className="btn-icon" title="Mark as Done" onClick={() => handleUpdateReservationStatus(res.id, 'DONE')}>
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderSettings = () => (
        <div className="section-container">
            <div className="section-header">
                <h2>Pharmacy Settings</h2>
            </div>
            <form onSubmit={handleSaveSettings} style={{ maxWidth: '600px' }}>
                <div className="form-group">
                    <label>Pharmacy Name</label>
                    <input
                        type="text"
                        value={settingsForm.pharmacyName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, pharmacyName: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Contact Email</label>
                    <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Address</label>
                    <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    />
                </div>
                <div className="section-header" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--dash-text)' }}>Location Configuration</h3>
                </div>
                <div className="form-group">
                    <label>Pharmacy Location</label>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', background: settingsForm.latitude ? 'var(--success, #4caf50)' : '' }}
                    >
                        <Navigation size={18} />
                        {isGettingLocation ? 'Getting Location...' : settingsForm.latitude ? `Location Set: ${settingsForm.latitude}, ${settingsForm.longitude}` : 'Get Current Location'}
                    </button>
                </div>
                <div className="form-group">
                    <label>Operating Hours</label>
                    <input
                        type="text"
                        value={settingsForm.operatingHours}
                        onChange={(e) => setSettingsForm({ ...settingsForm, operatingHours: e.target.value })}
                        placeholder="e.g. Mon-Fri: 9AM-6PM"
                    />
                </div>
                <div className="form-actions" style={{ marginTop: '1.5rem', justifyContent: 'flex-start' }}>
                    <button type="submit" className="btn btn-primary" disabled={isSavingSettings}>
                        {isSavingSettings ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-brand">
                    {/*<div style={{ padding: '8px', background: 'var(--pharmacy-accent)', borderRadius: '10px', color: 'var(--pharmacy-blue)' }}>
                        <Package size={24} />
                    </div>*/}
                    <div className="logo-icon">
                        {/*<Activity size={24} />*/}
                        <img src="/Logo251x251.png" alt="logo" width={50} height={50} />
                    </div>
                    <span>PharmaSeek</span>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        <Package size={20} />
                        <span>Inventory</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'reservations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reservations')}
                    >
                        <CalendarCheck size={20} />
                        <span>Reservations</span>
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
                    <button className="nav-item" onClick={handleLogout}>
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
                            {activeTab === 'overview' ? `Welcome back, ${user?.name || 'Pharmacy'}!` :
                                activeTab === 'inventory' ? 'Inventory Management' :
                                    activeTab === 'reservations' ? 'Reservations Overview' : 'Pharmacy Settings'}
                        </h1>
                        <p>
                            {activeTab === 'overview' ? 'Here is what is happening today.' :
                                activeTab === 'inventory' ? 'Manage and track your medical stock.' :
                                    activeTab === 'reservations' ? 'Review and process patient reservations.' : 'Configure your pharmacy details and location parameters.'}
                        </p>
                    </div>
                    <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        {/*<button className="btn btn-secondary">Today's Brief</button>*/}
                        <Link to="/" className="btn btn-outline">
                            <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Landing Page
                        </Link>
                    </div>
                </header>

                <div className="dashboard-content">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'inventory' && renderInventory()}
                    {activeTab === 'reservations' && renderReservations()}
                    {activeTab === 'settings' && renderSettings()}
                </div>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>{isEditing ? 'Edit Stock' : 'Add New Product'}</h2>
                            <form onSubmit={handleSaveProduct}>
                                {!isEditing && (
                                    <>
                                        <div className="form-group">
                                            <label>Drug Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={newProduct.drugName}
                                                onChange={(e) => setNewProduct({ ...newProduct, drugName: e.target.value })}
                                                placeholder="e.g. Lisinopril 10mg"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Category</label>
                                            <input
                                                type="text"
                                                value={newProduct.drugCategory}
                                                onChange={(e) => setNewProduct({ ...newProduct, drugCategory: e.target.value })}
                                                placeholder="e.g. Hypertension, Pain Relief"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <input
                                                type="text"
                                                value={newProduct.drugDescription}
                                                onChange={(e) => setNewProduct({ ...newProduct, drugDescription: e.target.value })}
                                                placeholder="Brief description of the drug"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Manufacturer</label>
                                            <input
                                                type="text"
                                                value={newProduct.drugManufacturer}
                                                onChange={(e) => setNewProduct({ ...newProduct, drugManufacturer: e.target.value })}
                                                placeholder="e.g. Pfizer, Bayer"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={newProduct.drugRequiresPrescription}
                                                    onChange={(e) => setNewProduct({ ...newProduct, drugRequiresPrescription: e.target.checked })}
                                                    style={{ width: 'auto' }}
                                                />
                                                Requires Prescription
                                            </label>
                                        </div>
                                        <hr style={{ margin: '1rem 0', borderColor: 'var(--dash-border)' }} />
                                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Stock Information</h3>
                                    </>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Quantity *</label>
                                        <input
                                            type="number"
                                            required
                                            value={newProduct.quantity}
                                            onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                                            placeholder="Quantity"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price (TDN) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Reservation Delay (hours)</label>
                                    <input
                                        type="number"
                                        value={newProduct.delay}
                                        onChange={(e) => setNewProduct({ ...newProduct, delay: e.target.value })}
                                        placeholder="24"
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">
                                        {isEditing ? 'Update Stock' : 'Add Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PharmacyDashboard;
