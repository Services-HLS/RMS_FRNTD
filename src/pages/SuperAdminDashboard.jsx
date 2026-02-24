import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Loader } from '../components/ui';
import api from '../services/api';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [newRestaurant, setNewRestaurant] = useState({
        name: '',
        restaurant_code: '',
        type: 'DINE_IN',
        logo_url: 'https://via.placeholder.com/150'
    });

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
            await api.createRestaurant(newRestaurant);
            setShowAddModal(false);
            fetchRestaurants();
            setNewRestaurant({ name: '', restaurant_code: '', type: 'DINE_IN', logo_url: 'https://via.placeholder.com/150' });
        } catch (error) {
            console.error("Failed to add restaurant", error);
        }
    };

    const handleManageAdmins = async (restaurant) => {
        setSelectedRestaurant(restaurant);
        try {
            const data = await api.getAdmins(restaurant.id);
            setAdmins(data);
            setShowAdminModal(true);
            setEditingAdmin(null);
        } catch (error) {
            console.error("Failed to fetch admins", error);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.createAdmin({ ...newAdmin, restaurant_id: selectedRestaurant.id });
            const updatedAdmins = await api.getAdmins(selectedRestaurant.id);
            setAdmins(updatedAdmins);
            setNewAdmin({ username: '', password: '' });
        } catch (error) {
            console.error("Failed to add admin", error);
        }
    };

    const handleEditAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.updateAdmin(editingAdmin.id, { 
                username: editingAdmin.username, 
                password: editingAdmin.password 
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
        if (!window.confirm('Are you sure you want to remove this admin? This action cannot be undone.')) return;
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

    const handleLogout = () => {
        localStorage.clear();
        navigate('/super-admin/login');
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
                        <Button variant="outline" onClick={handleLogout} className="border-red-200 text-red-600 hover:bg-red-50">
                            🔒 Logout
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map(rest => (
                        <Card key={rest.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex items-center space-x-4 mb-4">
                                <img src={rest.logo_url} alt={rest.name} className="w-16 h-16 rounded-lg bg-slate-100" />
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-xl text-slate-800 truncate">{rest.name}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 uppercase">
                                            ID: {rest.restaurant_code}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${rest.type === 'DINE_IN' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {rest.type === 'DINE_IN' ? 'Dine-in' : 'QSR'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleManageAdmins(rest)}>Manage Admins</Button>
                                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleAccessDashboard(rest)}>Access OS</Button>
                                </div>
                                <Button size="sm" variant="ghost" className="text-xs">System Health</Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-lg p-6">
                            <h2 className="text-2xl font-bold mb-6">Onboard Restaurant</h2>
                            <form onSubmit={handleAddRestaurant} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Restaurant Name</label>
                                    <Input
                                        type="text"
                                        required
                                        value={newRestaurant.name}
                                        onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                                        placeholder="e.g. Spice Route"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Restaurant ID / Code</label>
                                    <Input
                                        type="text"
                                        required
                                        value={newRestaurant.restaurant_code}
                                        onChange={(e) => setNewRestaurant({ ...newRestaurant, restaurant_code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                                        placeholder="e.g. SPICE01"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Unique identifier used for setup and search.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Operating Type</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={newRestaurant.type}
                                        onChange={(e) => setNewRestaurant({ ...newRestaurant, type: e.target.value })}
                                    >
                                        <option value="DINE_IN">Dine-in (Table QR)</option>
                                        <option value="WALK_IN">QSR (Counter Walk-in)</option>
                                    </select>
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                                    <Button type="submit" className="flex-1">Establish Instance</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

                {showAdminModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Manage Admins - {selectedRestaurant?.name}</h2>
                                <button onClick={() => setShowAdminModal(false)} className="text-gray-500 hover:text-black text-2xl">×</button>
                            </div>
                            
                            <div className="mb-8">
                                <h3 className="font-bold mb-4">{editingAdmin ? 'Edit Admin Credentials' : 'Create New Admin'}</h3>
                                <form onSubmit={editingAdmin ? handleEditAdmin : handleAddAdmin} className="flex space-x-2">
                                    <Input 
                                        placeholder="Username" 
                                        required
                                        value={editingAdmin ? editingAdmin.username : newAdmin.username}
                                        onChange={e => editingAdmin 
                                            ? setEditingAdmin({...editingAdmin, username: e.target.value})
                                            : setNewAdmin({...newAdmin, username: e.target.value})
                                        }
                                    />
                                    <Input 
                                        type="password" 
                                        placeholder={editingAdmin ? "New Password" : "Password"} 
                                        required
                                        value={editingAdmin ? editingAdmin.password : newAdmin.password}
                                        onChange={e => editingAdmin
                                            ? setEditingAdmin({...editingAdmin, password: e.target.value})
                                            : setNewAdmin({...newAdmin, password: e.target.value})
                                        }
                                    />
                                    <Button type="submit" variant={editingAdmin ? 'secondary' : 'primary'}>
                                        {editingAdmin ? 'Update' : 'Create'}
                                    </Button>
                                    {editingAdmin && (
                                        <Button type="button" variant="outline" onClick={() => setEditingAdmin(null)}>Cancel</Button>
                                    )}
                                </form>
                            </div>

                            <div>
                                <h3 className="font-bold mb-4">Existing Admins</h3>
                                <div className="max-h-60 overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-sm text-gray-400">
                                                <th className="pb-2">Username</th>
                                                <th className="pb-2 text-right pr-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {admins.map(admin => (
                                                <tr key={admin.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                                    <td className="py-3">
                                                        <div className="font-medium text-slate-800">{admin.username}</div>
                                                        <div className="text-[10px] text-gray-500">{new Date(admin.created_at).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="py-3 text-right pr-4">
                                                        <div className="flex justify-end space-x-2">
                                                            <button 
                                                                onClick={() => setEditingAdmin({ ...admin, password: '' })}
                                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteAdmin(admin.id)}
                                                                className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {admins.length === 0 && (
                                                <tr>
                                                    <td colSpan="2" className="py-8 text-center text-gray-400">No admins onboarded for this restaurant yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
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
