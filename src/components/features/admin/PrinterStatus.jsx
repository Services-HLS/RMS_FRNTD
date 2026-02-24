import React, { useState, useEffect } from 'react';
import { Card, Button, Loader } from '../../ui';
import api from '../../../services/api';

const PrinterStatus = () => {
    const [printers, setPrinters] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Polling for live updates
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [printerData, jobData] = await Promise.all([
                api.getPrinters(),
                api.getKOTJobs()
            ]);
            setPrinters(printerData);
            setJobs(jobData.slice(0, 10)); // Show last 10 jobs
        } catch (error) {
            console.error("Failed to fetch printer data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-xl font-bold mb-4">Connected Printers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {printers.map((printer) => (
                        <Card key={printer.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`h-3 w-3 rounded-full mr-3 ${printer.status === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <div>
                                    <p className="font-bold text-gray-800">{printer.name}</p>
                                    <p className="text-xs text-gray-500">ID: {printer.id} • {printer.status}</p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline">Test Print</Button>
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Live Printer Feed (KOT)</h3>
                    <span className="text-xs text-gray-400">Updates every 5s</span>
                </div>
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 font-mono">
                    <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 flex justify-between border-b border-slate-700">
                        <span>PRINTER_LOG_STREAM</span>
                        <span>v1.0.4-MOCK</span>
                    </div>
                    <div className="divide-y divide-slate-800">
                        {jobs.length === 0 && <p className="p-8 text-center text-slate-600 italic">Waiting for incoming jobs...</p>}
                        {jobs.map(job => (
                            <div key={job.id} className="px-4 py-3 text-sm flex items-start space-x-4 hover:bg-slate-800/50 transition-colors">
                                <span className="text-green-500">[{new Date(job.created_at).toLocaleTimeString()}]</span>
                                <div className="flex-1">
                                    <span className="text-blue-400">PRINT_JOB_START</span>
                                    <span className="text-slate-300"> Order #{job.order_id} • Table {job.table_id} </span>
                                    <div className="mt-1 pl-4 text-xs text-slate-500">
                                        {job.items.map(i => `${i.qty}x ${i.name}`).join(' | ')}
                                    </div>
                                </div>
                                <span className="text-yellow-600 bg-yellow-900/20 px-1 rounded text-xs">COMPLETED</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrinterStatus;
