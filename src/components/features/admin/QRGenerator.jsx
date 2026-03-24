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
    const currentRestId = api.getCurrentRestaurantId();
    const rawRestName = localStorage.getItem('restaurant_name') || 'Restaurant OS';
    const cleanRestName = rawRestName.replace(/[^a-zA-Z0-9]/g, '_');

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

    const downloadQR = (idPrefix, filename, label1, label2) => {
        const svg = document.getElementById(idPrefix);
        if (!svg) return;
        
        // Clone the SVG node so we don't modify the DOM directly
        const svgClone = svg.cloneNode(true);
        const padding = 100;
        const size = 1024;
        const topMargin = label1 ? 220 : padding;
        const bottomMargin = label2 ? 180 : padding;
        
        svgClone.setAttribute("width", size);
        svgClone.setAttribute("height", size);
        
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        
        // Ensure image loads synchronously before drawing
        img.onload = () => {
            canvas.width = size + (padding * 2); 
            canvas.height = size + topMargin + bottomMargin;
            
            // Fill white background
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw Texts
            ctx.textAlign = "center";
            if (label1) {
                ctx.fillStyle = "#0f172a"; // slate-900
                ctx.font = "bold 90px 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
                ctx.fillText(label1, canvas.width / 2, 140);
            }
            if (label2) {
                ctx.fillStyle = "#475569"; // slate-600
                ctx.font = "bold 60px 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
                ctx.fillText(label2, canvas.width / 2, canvas.height - 70);
            }

            // Draw perfectly smooth, large image
            ctx.drawImage(img, padding, topMargin, size, size); 
            
            const pngFile = canvas.toDataURL("image/png", 1.0);
            const downloadLink = document.createElement("a");
            downloadLink.download = `${filename}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 print:space-y-4 print:m-0 print:p-0">
            <div className="flex justify-end mb-4 print:hidden">
                <Button
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print / Download QRs
                </Button>
            </div>

            <Card className="flex flex-col md:flex-row items-center justify-between bg-primary text-white p-8 print:bg-white print:text-black print:border-2 print:border-gray-800 print:shadow-none print:break-inside-avoid">
                <div>
                    <h2 className="text-2xl font-bold mb-2 print:text-black">Universal Walk-in QR</h2>
                    <p className="opacity-90 max-w-md print:text-gray-800">Customers can scan this at the counter or entrance. It captures the order specifically under Walk-In QR directly to the Kitchen.</p>
                </div>
                <div className="mt-6 md:mt-0 bg-white p-4 rounded-xl shadow-xl flex flex-col items-center print:shadow-none print:border-2 print:border-gray-200">
                    <QRCode
                        id="qr-walkin"
                        value={`${window.location.origin}/#/menu?restaurant_id=${currentRestId}&source=QR_WALKIN`}
                        size={128}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                    <p className="text-gray-900 font-bold mt-2 text-sm text-center">Scan to Order</p>
                    <Button 
                        className="mt-3 w-full bg-slate-100 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-xs hover:bg-slate-200 font-bold transition-colors print:hidden shadow-sm"
                        onClick={() => downloadQR('qr-walkin', `${cleanRestName}_WalkIn_QR`, rawRestName, 'Universal Walk-In QR')}
                    >
                        ⬇️ Download PNG
                    </Button>
                </div>
            </Card>

            <h3 className="text-xl font-bold border-b pb-2 print:border-gray-800 print:mt-8">Table-Specific QRs</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-3 print:gap-4">
                {tables.map(table => {
                    const qr = qrCodes.find(q => q.table_id === table.id);
                    return (
                        <Card key={table.id} className="flex flex-col items-center text-center p-6 border-2 border-slate-100 hover:border-blue-400 transition-all shadow-sm hover:shadow-lg rounded-2xl bg-white print:border-gray-800 print:shadow-none print:break-inside-avoid print:p-4">
                            <div className="bg-slate-900 text-white w-full py-2 rounded-xl mb-4 text-xs font-black uppercase tracking-[0.2em] shadow-sm print:bg-white print:text-black print:border-b-2 print:border-gray-800 print:rounded-none px-2">
                                Table {table.table_number || table.display_name}
                            </div>
                            <div className="w-full aspect-square bg-slate-50 mb-4 p-4 flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all print:border-gray-400 print:bg-white">
                                <QRCode
                                    id={`qr-table-${table.id}`}
                                    value={`${window.location.origin}/#/menu?restaurant_id=${currentRestId}&table_id=${table.id}&source=QR_TABLE`}
                                    size={144}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 print:text-gray-800 print:mb-0">Scan for Digital Menu</div>
                            <div className="space-y-2 w-full print:hidden">
                                <Button
                                    variant="outline"
                                    onClick={() => downloadQR(`qr-table-${table.id}`, `${cleanRestName}_Table_${(table.table_number || table.display_name).replace(/[^a-zA-Z0-9]/g, '_')}_QR`, rawRestName, `Table ${table.table_number || table.display_name}`)}
                                    className="w-full border-slate-200 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-xs py-2 shadow-sm"
                                >
                                    ⬇️ Download PNG
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/admin/pos?table=${table.id}`)}
                                    className="w-full border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 font-bold rounded-xl text-xs py-2"
                                >
                                    📝 Manual POS Order
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
