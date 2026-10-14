import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { OrderDetailCard } from '../../components/OrderDetailCard/OrderDetailCard';
import { StatusUpdater } from '../../components/StatusUpdater/StatusUpdater';
import CancelOrderModal from '../../components/CancelOrderModal/CancelOrderModal';
import { fetchTaskByIdAPI, updateTaskStatusAPI, cancelTaskAPI } from '../../services/deliveryService';
import './Deliverycomplete.css';

// Map display status (UI) to backend task status
const displayStatusToBackend = {
    'Shipped': 'PickedUp',
    'Out for Delivery': 'OutForDelivery',
    'Delivered': 'Delivered',
};

export function OrderDetail() {
    const { orderId, itemId } = useParams();
    const taskId = itemId;
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [pendingCancelStatus, setPendingCancelStatus] = useState(null);

    useEffect(() => {
        const fetchTask = async () => {
            if (!taskId) {
                setIsLoading(false);
                return;
            }
            try {
                const data = await fetchTaskByIdAPI(taskId);
                setOrder(data);
            } catch (error) {
                console.error('Error fetching task details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTask();
    }, [taskId]);

    const handleStatusChange = async (newStatus, cancelReason = null) => {
        if (!order || !taskId) return false;

        if (newStatus === 'Cancelled' && !cancelReason) {
            setPendingCancelStatus(newStatus);
            setShowCancelModal(true);
            return false;
        }

        setIsUpdating(true);
        try {
            if (newStatus === 'Cancelled') {
                await cancelTaskAPI(taskId, cancelReason || '');
                setOrder(prev => ({ ...prev, status: 'Cancelled', taskStatus: 'Cancelled' }));
            } else {
                const backendStatus = displayStatusToBackend[newStatus];
                if (!backendStatus) {
                    throw new Error(`Invalid status: ${newStatus}`);
                }
                await updateTaskStatusAPI(taskId, backendStatus);
                setOrder(prev => ({ ...prev, status: newStatus, taskStatus: backendStatus }));
            }
            setShowCancelModal(false);
            setPendingCancelStatus(null);
            alert('Status updated successfully!');
            return true;
        } catch (error) {
            console.error('Error updating status:', error);
            const message = error.response?.data?.message || error.message;
            alert(`Failed to update status: ${message}`);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelConfirm = (cancelReason) => {
        handleStatusChange(pendingCancelStatus, cancelReason);
    };

    if (isLoading) {
        return (
            <div className="order-detail-container">
                <div className="order-detail-loading">
                    <Loader2 className="order-detail-spinner" />
                    <p className="order-detail-loading-text">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-container">
                <div className="order-detail-error">
                    <p className="order-detail-error-text">Order not found</p>
                    <Link to="/" className="order-detail-back-link">
                        <ArrowLeft className="order-detail-back-icon" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="order-detail-container">

            <Link to="/" className="order-detail-back-button">
                <ArrowLeft className="order-detail-back-icon" />
                Back to Dashboard
            </Link>

            <div className="order-detail-grid">
                <div className="order-detail-main">
                    <OrderDetailCard order={order} />
                </div>
                <div className="order-detail-sidebar">
                    <StatusUpdater
                        currentStatus={order.status}
                        onStatusChange={handleStatusChange}
                    />
                </div>
            </div>

            {/* Cancel Order Modal */}
            <CancelOrderModal
                isOpen={showCancelModal}
                onClose={() => {
                    setShowCancelModal(false);
                    setPendingCancelStatus(null);
                }}
                onConfirm={handleCancelConfirm}
                loading={isUpdating}
            />
        </div>
    );
}
