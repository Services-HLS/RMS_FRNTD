import React from 'react';
import { useParams } from 'react-router-dom';
import { OrderStatus } from '../components/features/customer';
import { Button } from '../components/ui';
import { useNavigate } from 'react-router-dom';

const OrderTracking = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-lg mx-auto">
                <div className="mb-6">
                    <Button variant="outline" onClick={() => navigate('/menu')}>
                        &larr; Back to Menu
                    </Button>
                </div>
                <OrderStatus orderId={parseInt(orderId)} />
            </div>
        </div>
    );
};

export default OrderTracking;
