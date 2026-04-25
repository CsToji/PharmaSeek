import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building2,
    CalendarCheck,
    Pill,
    Settings,
    LogOut,
    Search,
    CheckCircle,
    XCircle,
    TrendingUp,
    AlertTriangle,
    MoreVertical,
    Plus,
    Trash2,
    Edit2,
    Sun,
    Moon,
    Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import useGlobalPopup from '../components/PopupContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { user, logout } = useAuth();
    const { popup } = useGlobalPopup();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [pendingPharmacies, setPendingPharmacies] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allReservations, setAllReservations] = useState([]);
    const [allDrugs, setAllDrugs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [newDrug, setNewDrug] = useState({
        name: '',
        description: '',
        category: '',
        manufacturer: '',
        requiresPrescription: false
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [theme, setTheme] = useState('dark');

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const themeStyles = {
        backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9',
        color: theme === 'dark' ? '#f8fafc' : '#1e293b',
        '--admin-bg': theme === 'dark' ? '#0f172a' : '#f1f5f9',
        '--admin-sidebar': theme === 'dark' ? '#1e293b' : '#ffffff',
        '--admin-card': theme === 'dark' ? '#1e293b' : '#ffffff',
        '--admin-border': theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        '--admin-text': theme === 'dark' ? '#f8fafc' : '#1e293b',
        '--admin-text-muted': theme === 'dark' ? 'rgba(255,255,255,0.6)' : '#64748b',
        '--admin-accent': theme === 'dark' ? '#38bdf8' : '#0284c7',
        '--admin-accent-bg': theme === 'dark' ? 'rgba(56,189,248,0.15)' : 'rgba(2,132,199,0.1)',
        '--admin-input-bg': theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
        '--admin-hover': theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            switch (activeTab) {
                case 'dashboard':
                    const statsData = await adminService.getStats();
                    setStats(statsData);
                    break;
                case 'pharmacies':
                    const pending = await adminService.getPendingPharmacies();
                    setPendingPharmacies(pending);
                    break;
                case 'users':
                    const users = await adminService.getAllUsers();
                    setAllUsers(users);
                    break;
                case 'reservations':
                    const reservations = await adminService.getAllReservations();
                    setAllReservations(reservations);
                    break;
                case 'drugs':
                    const drugs = await adminService.getAllDrugs();
                    setAllDrugs(drugs);
                    break;
                default:
                    break;
            }
        } catch (error) {
            popup.error('Failed to load data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleApprovePharmacy = async (pharmacyId, approved) => {
        try {
            await adminService.approvePharmacy(pharmacyId, approved);
            popup.valid(approved ? 'Pharmacy approved!' : 'Pharmacy rejected!');
            loadData();
        } catch (error) {
            popup.error('Failed to update pharmacy: ' + error.message);
        }
    };

    const handleMakeAdmin = async (userId) => {
        try {
            await adminService.updateUserRole(userId, 'ADMIN');
            popup.valid('User granted admin access!');
            loadData();
        } catch (error) {
            popup.error('Failed to update user: ' + error.message);
        }
    };

    const handleCreateDrug = async (e) => {
        e.preventDefault();
        try {
            popup.valid('Drug created successfully!');
            setIsModalOpen(false);
            setNewDrug({ name: '', description: '', category: '', manufacturer: '', requiresPrescription: false });
            loadData();
        } catch (error) {
            popup.error('Failed to create drug: ' + error.message);
        }
    };

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'pharmacies', icon: Building2, label: 'Pharmacies' },
        { id: 'users', icon: Users, label: 'Users' },
        { id: 'reservations', icon: CalendarCheck, label: 'Reservations' },
        { id: 'drugs', icon: Pill, label: 'Drugs' },
    ];

const renderDashboard = () => {
        if (!stats) return <div className="loading">Loading stats...</div>;

        const textColor = theme === 'dark' ? '#f8fafc' : '#1e293b';
        const mutedColor = theme === 'dark' ? 'rgba(255,255,255,0.6)' : '#64748b';

        return (
            <div className="dashboard-stats">
                <div className="stat-card-admin">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#38bdf8' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ color: textColor }}>{stats.totalUsers}</div>
                        <div className="stat-label" style={{ color: mutedColor }}>Total Users</div>
                    </div>
                </div>

                <div className="stat-card-admin">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#22c55e' }}>
                        <Building2 size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ color: textColor }}>{stats.totalPharmacies}</div>
                        <div className="stat-label" style={{ color: mutedColor }}>Pharmacies</div>
                    </div>
                </div>

                <div className="stat-card-admin">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ color: textColor }}>{stats.totalClients}</div>
                        <div className="stat-label" style={{ color: mutedColor }}>Clients</div>
                    </div>
                </div>

                <div className="stat-card-admin">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a855f7' }}>
                        <CalendarCheck size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ color: textColor }}>{stats.totalReservations}</div>
                        <div className="stat-label" style={{ color: mutedColor }}>Reservations</div>
                    </div>
                </div>

                <div className="stat-card-admin">
                    <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                        <Pill size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ color: textColor }}>{stats.totalDrugs}</div>
                        <div className="stat-label" style={{ color: mutedColor }}>Drugs</div>
                    </div>
                </div>

                <div className="stat-card-admin warning">
                    <div className="stat-icon" style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ color: textColor }}>{stats.pendingPharmacyApprovals}</div>
                        <div className="stat-label" style={{ color: mutedColor }}>Pending Approvals</div>
                    </div>
                </div>

                <div className="stat-card-admin">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#22c55e' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ color: textColor }}>{stats.totalRevenue} TDN</div>
                        <div className="stat-label" style={{ color: mutedColor }}>Total Revenue</div>
                    </div>
                </div>
            </div>
        );
    };

    const renderPharmacies = () => {
        const filtered = pendingPharmacies.filter(p =>
            p.pharmacyName?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="section-container">
                <div className="section-header">
                    <h2>Pending Pharmacy Approvals</h2>
                    <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search pharmacies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px', border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--admin-text)' }}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">No pending pharmacy approvals</div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Pharmacy Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(pharmacy => (
                                    <tr key={pharmacy.id}>
                                        <td><strong>{pharmacy.pharmacyName}</strong></td>
                                        <td>{pharmacy.email}</td>
                                        <td>{pharmacy.phone}</td>
                                        <td>{pharmacy.address}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handleApprovePharmacy(pharmacy.id, true)}
                                                >
                                                    <CheckCircle size={16} /> Approve
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleApprovePharmacy(pharmacy.id, false)}
                                                >
                                                    <XCircle size={16} /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const renderUsers = () => {
        const filtered = allUsers.filter(u =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="section-container">
                <div className="section-header">
                    <h2>All Users</h2>
                    <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px', border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--dash-text)' }}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(u => (
                                    <tr key={u.id}>
                                        <td><strong>{u.id}</strong></td>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`badge badge-${u.role?.toLowerCase() || 'info'}`}>
                                                {u.role || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            {u.role !== 'ADMIN' && (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleMakeAdmin(u.id)}
                                                >
                                                    Make Admin
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const renderReservations = () => {
        const filtered = allReservations.filter(r =>
            r.id?.toString().includes(searchQuery) ||
            r.pharmacyName?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="section-container">
                <div className="section-header">
                    <h2>All Reservations</h2>
                    <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search reservations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px', border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--dash-text)' }}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Client</th>
                                    <th>Pharmacy</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(r => (
                                    <tr key={r.id}>
                                        <td><strong>{r.id}</strong></td>
                                        <td>{r.clientName || 'N/A'}</td>
                                        <td>{r.pharmacyName || 'N/A'}</td>
                                        <td>{r.totalPrice} TDN</td>
                                        <td>
                                            <span className={`badge badge-${r.status?.toLowerCase() || 'info'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td>{r.reservedAt ? new Date(r.reservedAt).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const renderDrugs = () => {
        const filtered = allDrugs.filter(d =>
            d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="section-container">
                <div className="section-header">
                    <h2>Drug Database</h2>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} /> Add Drug
                    </button>
                </div>

                {isLoading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Manufacturer</th>
                                    <th>Prescription</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(d => (
                                    <tr key={d.id}>
                                        <td><strong>{d.id}</strong></td>
                                        <td>{d.name}</td>
                                        <td>{d.category || 'N/A'}</td>
                                        <td>{d.manufacturer || 'N/A'}</td>
                                        <td>{d.requiresPrescription ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return renderDashboard();
            case 'pharmacies':
                return renderPharmacies();
            case 'users':
                return renderUsers();
            case 'reservations':
                return renderReservations();
            case 'drugs':
                return renderDrugs();
            case 'settings':
                return <div className="section-container"><h2>Settings</h2><p>Admin settings coming soon...</p></div>;
            default:
                return renderDashboard();
        }
    };

    return (
        <div className="dashboard-admin" style={themeStyles}>
            <aside className="sidebar-admin">
                <div className="sidebar-header">
                    <h1>Admin Panel</h1>
                    <button className="theme-toggle-admin" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="nav-item" onClick={() => navigate('/')}>
                        <Home size={20} />
                        <span>Home</span>
                    </button>
                    <button className="nav-item" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-admin">
                <header className="header-admin">
                    <h2>{menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}</h2>
                    <div className="user-info">
                        <span>{user?.name || 'Admin'}</span>
                    </div>
                </header>

                <div className="content-admin">
                    {renderContent()}
                </div>
            </main>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Add New Drug</h2>
                        <form onSubmit={handleCreateDrug}>
                            <div className="form-group">
                                <label>Drug Name</label>
                                <input
                                    type="text"
                                    value={newDrug.name}
                                    onChange={(e) => setNewDrug({ ...newDrug, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={newDrug.description}
                                    onChange={(e) => setNewDrug({ ...newDrug, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input
                                    type="text"
                                    value={newDrug.category}
                                    onChange={(e) => setNewDrug({ ...newDrug, category: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Manufacturer</label>
                                <input
                                    type="text"
                                    value={newDrug.manufacturer}
                                    onChange={(e) => setNewDrug({ ...newDrug, manufacturer: e.target.value })}
                                />
                            </div>
                            <div className='nanananaan'>
                                    <input
                                        type="checkbox"
                                        checked={newDrug.requiresPrescription}
                                        onChange={(e) => setNewDrug({ ...newDrug, requiresPrescription: e.target.checked })}
                                    />
                                    <span className="checkbox-label-text">Requires Prescription</span>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Drug</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;