import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Loader, Card } from '../../ui';
import api from '../../../services/api';
import QRCode from "react-qr-code";

const QRGenerator = () => {
    const navigate = useNavigate();
    const [qrCodes, setQrCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tables, setTables] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [qrData, tablesData] = await Promise.all([
                api.getQRCodes(),
                api.getTables()
            ]);
            setQrCodes(qrData);
            setTables(tablesData);
        } catch (error) {
            console.error("Failed to fetch QR data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (tableId) => {
        try {
            const newQR = await api.generateQR({
                table_id: tableId,
                design_theme: 'classic',
                caption_group: 'default'
            });
            setQrCodes([...qrCodes, newQR]);
        } catch (error) {
            console.error("Failed to generate QR", error);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-8">
            <Card className="flex flex-col md:flex-row items-center justify-between bg-primary text-white p-8">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Universal Walk-in QR</h2>
                    <p className="opacity-90 max-w-md">Customers can scan this at the counter or entrance. It captures the order specifically under Walk-In QR directly to the Kitchen.</p>
                </div>
                <div className="mt-6 md:mt-0 bg-white p-4 rounded-xl shadow-xl flex flex-col items-center">
                    <QRCode
                        value={`${window.location.origin}/menu?source=QR_WALKIN`}
                        size={128}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                    <p className="text-gray-900 font-bold mt-2 text-sm text-center">Scan to Order</p>
                </div>
            </Card>

            <h3 className="text-xl font-bold border-b pb-2">Table-Specific QRs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map(table => {
                    const qr = qrCodes.find(q => q.table_id === table.id);
                    return (
                        <Card key={table.id} className="flex flex-col items-center text-center">
                            <h4 className="text-lg font-bold mb-2">{table.display_name}</h4>
                            <div className="w-32 h-32 bg-gray-200 mb-4 flex items-center justify-center rounded-lg overflow-hidden border">
                                <QRCode
                                    value={`${window.location.origin}/menu?table_id=${table.id}&source=QR_TABLE`}
                                    size={128}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                            <div className="space-y-2 w-full">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/admin/pos?table=${table.table_number || table.id}`)}
                                    className="w-full border-blue-200 text-blue-700 bg-blue-50/50"
                                >
                                    📝 Take Order
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default QRGenerator;
