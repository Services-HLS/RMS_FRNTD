import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Loader } from '../components/ui';
import api from '../services/api';
import { customConfirm } from '../utils/Alert';
import { useAuth } from '../context/AuthContext';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [roles, setRoles] = useState([]);
    const [newAdmin, setNewAdmin] = useState({ username: '', password: '', role_id: '' });
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [newRestaurant, setNewRestaurant] = useState({
        name: '',
        restaurant_code: '',
        logo_url: ''
    });
    const [logoFile, setLogoFile] = useState(null);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const data = await api.getRestaurants();
            setRestaurants(data);
        } catch (error) {
            console.error("Failed to fetch restaurants", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRestaurant = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newRestaurant.name);
            formData.append('restaurant_code', newRestaurant.restaurant_code);
            if (newRestaurant.logo_url) formData.append('logo_url', newRestaurant.logo_url);
            if (logoFile) formData.append('logo_file', logoFile);

            await api.createRestaurant(formData);
            setShowAddModal(false);
            fetchRestaurants();
            setNewRestaurant({ name: '', restaurant_code: '', logo_url: '' });
            setLogoFile(null);
        } catch (error) {
            console.error("Failed to add restaurant", error);
        }
    };

    const handleDeleteRestaurant = async (restaurantId) => {
        if (!(await customConfirm('Are you sure you want to delete this restaurant? This will remove all associated data including admins, menu, and orders. This action cannot be undone.'))) return;
        try {
            await api.deleteRestaurant(restaurantId);
            fetchRestaurants();
            alert('Restaurant deleted successfully');
        } catch (error) {
            console.error("Failed to delete restaurant", error);
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to delete restaurant: ${errorMsg}`);
        }
    };

    const handleManageAdmins = async (restaurant) => {
        setSelectedRestaurant(restaurant);
        try {
            const [adminData, roleData] = await Promise.all([
                api.getAdmins(restaurant.id),
                api.getRoles()
            ]);
            setAdmins(adminData);
            setRoles(roleData);
            setShowAdminModal(true);
            setEditingAdmin(null);
            // Pre-select admin role by default if available
            const adminRole = roleData.find(r => r.name === 'admin');
            if (adminRole) setNewAdmin(prev => ({ ...prev, role_id: adminRole.id }));
        } catch (error) {
            console.error("Failed to fetch data for admin management", error);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.createAdmin({ ...newAdmin, restaurant_id: selectedRestaurant.id });
            const updatedAdmins = await api.getAdmins(selectedRestaurant.id);
            setAdmins(updatedAdmins);
            const adminRole = roles.find(r => r.name === 'admin');
            setNewAdmin({ username: '', password: '', role_id: adminRole ? adminRole.id : '' });
            alert('Staff member created successfully');
        } catch (error) {
            console.error("Failed to add admin", error);
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to create account: ${errorMsg}`);
        }
    };

    const handleEditAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.updateAdmin(editingAdmin.id, {
                username: editingAdmin.username,
                password: editingAdmin.password,
                role_id: editingAdmin.role_id
            });
            const updatedAdmins = await api.getAdmins(selectedRestaurant.id);
            setAdmins(updatedAdmins);
            setEditingAdmin(null);
            alert('Admin credentials updated successfully');
        } catch (error) {
            console.error("Failed to update admin", error);
            alert(error.response?.data?.message || 'Failed to update admin');
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (!(await customConfirm('Are you sure you want to remove this admin? This action cannot be undone.'))) return;
        try {
            await api.deleteAdmin(adminId);
            const updatedAdmins = await api.getAdmins(selectedRestaurant.id);
            setAdmins(updatedAdmins);
            alert('Admin removed successfully');
        } catch (error) {
            console.error("Failed to delete admin", error);
            alert(error.response?.data?.message || 'Failed to delete admin');
        }
    };

    const handleAccessDashboard = (restaurant) => {
        localStorage.setItem('restaurant_id', restaurant.id);
        localStorage.setItem('restaurant_name', restaurant.name);
        navigate('/admin/dashboard');
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Platform Management</h1>
                        <p className="text-slate-500">Super Admin Control Panel</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button onClick={() => setShowAddModal(true)}>+ Onboard New Restaurant</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
                    {restaurants.map(rest => (
                        <Card key={rest.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl transition-all duration-300 !p-0">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="p-4 sm:p-5 bg-white flex flex-col h-full rounded-2xl relative z-10">
                                <div className="flex relative items-start space-x-3 mb-5">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
                                        {rest.logo_url ? (
                                            <img
                                                src={rest.logo_url}
                                                alt={rest.name}
                                                className="w-full h-full object-contain rounded-xl"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rest.name)}&background=random&color=fff`;
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-inner">
                                                {rest.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-lg text-slate-900 truncate pr-2">{rest.name}</h3>
                                            <div className="flex items-center space-x-1.5 flex-shrink-0" title="System Live">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></div>
                                                <span className="text-[10px] font-medium text-slate-500 hidden sm:inline-block">Live</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-wide">
                                                ID: {rest.restaurant_code}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <Button size="sm" variant="outline" className="w-full text-xs justify-center bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm py-1.5 group-hover:border-blue-200 transition-colors" onClick={() => handleManageAdmins(rest)}>
                                        <svg className="w-3.5 h-3.5 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        Admins
                                    </Button>
                                    <Button size="sm" className="w-full text-xs justify-center bg-slate-900 text-white hover:bg-slate-800 shadow-sm py-1.5 transition-colors" onClick={() => handleAccessDashboard(rest)}>
                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        Access OS
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100">
                                    <button className="text-[11px] font-medium text-slate-500 hover:text-slate-700 flex items-center transition-colors">
                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        System Health (Good)
                                    </button>
                                    <button className="text-[11px] font-medium text-red-500 hover:text-red-700 flex items-center transition-colors hover:bg-red-50 px-2 py-1 rounded" onClick={() => handleDeleteRestaurant(rest.id)}>
                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {showAddModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <Card className="w-full max-w-lg p-0 overflow-hidden shadow-2xl border-0 rounded-2xl">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Onboard Restaurant</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleAddRestaurant} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Restaurant Name</label>
                                        <Input
                                            type="text"
                                            required
                                            value={newRestaurant.name}
                                            onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                                            placeholder="e.g. Spice Route"
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Restaurant ID / Code</label>
                                        <Input
                                            type="text"
                                            required
                                            value={newRestaurant.restaurant_code}
                                            onChange={(e) => setNewRestaurant({ ...newRestaurant, restaurant_code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                                            placeholder="e.g. SPICE01"
                                            className="w-full font-mono uppercase"
                                        />
                                        <p className="text-[11px] text-slate-500 mt-1.5 flex items-center"><svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Unique identifier used for setup and search.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Restaurant Logo Image</label>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg, image/svg+xml, application/pdf"
                                                onChange={(e) => setLogoFile(e.target.files[0])}
                                                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 p-1"
                                            />
                                            <span className="text-sm font-bold text-slate-400">OR</span>
                                            <Input
                                                type="url"
                                                value={newRestaurant.logo_url}
                                                onChange={(e) => setNewRestaurant({ ...newRestaurant, logo_url: e.target.value })}
                                                placeholder="Fallback URL"
                                                className="w-full flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex space-x-3 pt-4 border-t border-slate-100">
                                        <Button type="button" variant="outline" className="flex-1 border-slate-200 hover:bg-slate-50" onClick={() => setShowAddModal(false)}>Cancel</Button>
                                        <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md border-0">Establish Instance</Button>
                                    </div>
                                </form>
                            </div>
                        </Card>
                    </div>
                )}

                {showAdminModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <Card className="w-full max-w-4xl p-0 overflow-hidden shadow-2xl border-0 rounded-2xl flex flex-col max-h-[90vh]">
                            {/* Modal Header */}
                            <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manage Staff & Admins</h2>
                                        <p className="text-sm text-slate-500 font-medium">For {selectedRestaurant?.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAdminModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-slate-50/50">
                                {/* Left Side: Add/Edit Form */}
                                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 bg-white p-6 flex-shrink-0">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                        {editingAdmin ? (
                                            <><svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>Edit Member</>
                                        ) : (
                                            <><svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Onboard Member</>
                                        )}
                                    </h3>
                                    <form onSubmit={editingAdmin ? handleEditAdmin : handleAddAdmin} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                                            <Input
                                                placeholder="e.g. john_doe"
                                                required
                                                className="w-full bg-slate-50 border-slate-200 focus:bg-white"
                                                value={editingAdmin ? editingAdmin.username : newAdmin.username}
                                                onChange={e => editingAdmin
                                                    ? setEditingAdmin({ ...editingAdmin, username: e.target.value })
                                                    : setNewAdmin({ ...newAdmin, username: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                {editingAdmin ? "New Password" : "Password"}
                                            </label>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full bg-slate-50 border-slate-200 focus:bg-white"
                                                required={!editingAdmin}
                                                value={editingAdmin ? editingAdmin.password : newAdmin.password}
                                                onChange={e => editingAdmin
                                                    ? setEditingAdmin({ ...editingAdmin, password: e.target.value })
                                                    : setNewAdmin({ ...newAdmin, password: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Role Assignment</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-medium text-slate-700 transition-colors"
                                                    required
                                                    value={editingAdmin ? editingAdmin.role_id : newAdmin.role_id}
                                                    onChange={e => editingAdmin
                                                        ? setEditingAdmin({ ...editingAdmin, role_id: e.target.value })
                                                        : setNewAdmin({ ...newAdmin, role_id: e.target.value })
                                                    }
                                                >
                                                    <option value="" disabled>Select a role...</option>
                                                    {roles.filter(r => {
                                                        if (r.name === 'super_admin') return false;
                                                        return true;
                                                    }).map(role => (
                                                        <option key={role.id} value={role.id}>{String(role.name).charAt(0).toUpperCase() + String(role.name).slice(1)}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 p-3 flex items-center pointer-events-none text-slate-400">
                                                    <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Button type="submit" className={`w-full justify-center shadow-md border-0 ${editingAdmin ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'}`}>
                                                {editingAdmin ? 'Save Changes' : 'Create Account'}
                                            </Button>
                                            {editingAdmin && (
                                                <Button type="button" variant="ghost" className="w-full mt-2 text-slate-500 hover:text-slate-800" onClick={() => setEditingAdmin(null)}>
                                                    Cancel Editing
                                                </Button>
                                            )}
                                        </div>
                                    </form>
                                </div>

                                {/* Right Side: Admin List */}
                                <div className="flex-1 p-6 overflow-y-auto">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        Active Personnel ({admins.length})
                                    </h3>

                                    {admins.length === 0 ? (
                                        <div className="bg-white border text-center border-slate-200 border-dashed rounded-xl p-8 shadow-sm">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            </div>
                                            <h4 className="text-slate-700 font-semibold mb-1">No personnel assigned</h4>
                                            <p className="text-sm text-slate-500">Use the form on the left to add your first staff member to this restaurant.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {admins.map(admin => (
                                                <div key={admin.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md hover:border-blue-200 transition-all group">
                                                    <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase text-lg flex-shrink-0 shadow-sm">
                                                            {admin.username.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{admin.username}</div>
                                                            <div className="flex items-center mt-1 space-x-2">
                                                                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600 uppercase tracking-widest border border-slate-200">
                                                                    {admin.role_name || admin.role}
                                                                </span>
                                                                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">• Joined {new Date(admin.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-14 sm:ml-0">
                                                        <button
                                                            onClick={() => setEditingAdmin({ ...admin, password: '' })}
                                                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all flex items-center"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAdmin(admin.id)}
                                                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all flex items-center"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
