import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Loader } from '../../ui';
import api from '../../../services/api';

const TableManager = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTable, setNewTable] = useState({ display_name: '', sequence_no: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const data = await api.getTables();
            setTables(data);
        } catch (error) {
            console.error("Failed to fetch tables", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTable = async () => {
        setSaving(true);
        try {
            await api.createTable({
                ...newTable,
                sequence_no: parseInt(newTable.sequence_no),
                status: 'AVAILABLE'
            });
            setIsModalOpen(false);
            setNewTable({ display_name: '', sequence_no: '' });
            fetchTables();
        } catch (error) {
            console.error("Failed to create table", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Tables ({tables.length})</h3>
                <Button onClick={() => setIsModalOpen(true)}>Add Table</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {tables.map(table => (
                    <div key={table.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{table.table_number}</p>
                            <p className="text-sm text-gray-500">Status: {table.status}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${table.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {table.status}
                        </span>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Table"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-2">Cancel</Button>
                        <Button onClick={handleCreateTable} disabled={saving}>
                            {saving ? 'Creating...' : 'Create'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Display Name"
                        value={newTable.display_name}
                        onChange={(e) => setNewTable({ ...newTable, display_name: e.target.value })}
                        placeholder="e.g. Table 1, Patio 2"
                    />
                    <Input
                        label="Sequence Number"
                        type="number"
                        value={newTable.sequence_no}
                        onChange={(e) => setNewTable({ ...newTable, sequence_no: e.target.value })}
                        placeholder="Order in list"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default TableManager;
