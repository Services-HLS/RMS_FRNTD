import React, { useState, useEffect } from 'react';
import { Button, Card, Loader } from '../../ui';
import api from '../../../services/api';

const MarketingManager = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newMessage, setNewMessage] = useState({ content: '', type: 'PROMOTION' });

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const data = await api.getMarketingMessages();
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch marketing messages", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMessage = async (id) => {
        try {
            await api.toggleMarketingMessage(id);
            fetchMessages(); // Refresh to ensure sync
        } catch (error) {
            console.error("Failed to toggle message", error);
        }
    };

    const handleAdd = async () => {
        if (!newMessage.content) return;
        try {
            await api.addMarketingMessage(newMessage);
            setNewMessage({ content: '', type: 'PROMOTION' });
            fetchMessages();
        } catch (error) {
            console.error("Failed to add message", error);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <Card title="Create New Campaign">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Message Content</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="e.g. 20% Off on all Mains!"
                            value={newMessage.content}
                            onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                        />
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                        <select
                            className="w-full px-4 py-2 border rounded-lg"
                            value={newMessage.type}
                            onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value })}
                        >
                            <option value="PROMOTION">Promotion</option>
                            <option value="ANNOUNCEMENT">Announcement</option>
                            <option value="EVENT">Event</option>
                        </select>
                    </div>
                    <Button onClick={handleAdd}>Publish</Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.map(msg => (
                    <Card key={msg.id} className={msg.active ? 'border-green-500 bg-green-50' : 'bg-gray-50'}>
                        <div className="flex justify-between items-start">
                            <div>
                                <span className={`inline-block px-2 py-1 text-xs font-bold rounded mb-2 ${msg.type === 'PROMOTION' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {msg.type}
                                </span>
                                <p className="text-lg font-medium text-gray-800">{msg.content}</p>
                            </div>
                            <div className="ml-4">
                                <Button
                                    size="sm"
                                    variant={msg.active ? 'primary' : 'outline'}
                                    onClick={() => toggleMessage(msg.id)}
                                >
                                    {msg.active ? 'Active' : 'Inactive'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MarketingManager;
