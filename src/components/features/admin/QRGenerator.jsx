import React, { useState, useEffect } from 'react';
import { Button, Input, Loader, Card } from '../../ui';
import api from '../../../services/api';

const QRGenerator = () => {
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map(table => {
                    const qr = qrCodes.find(q => q.table_id === table.id);
                    return (
                        <Card key={table.id} className="flex flex-col items-center text-center">
                            <h4 className="text-lg font-bold mb-2">{table.display_name}</h4>
                            <div className="w-32 h-32 bg-gray-200 mb-4 flex items-center justify-center rounded-lg">
                                {qr ? (
                                    <div className="text-xs text-gray-500">QR Code Mock</div>
                                ) : (
                                    <span className="text-gray-400 text-sm">No QR</span>
                                )}
                            </div>
                            {qr ? (
                                <a href={`#`} className="text-blue-600 text-sm font-medium hover:underline">Download PNG</a>
                            ) : (
                                <Button onClick={() => handleGenerate(table.id)} className="w-full">
                                    Generate QR
                                </Button>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default QRGenerator;
