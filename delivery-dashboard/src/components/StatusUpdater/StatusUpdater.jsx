import React, { useState } from 'react';
import { Check, Loader2, Package, Truck, Home, X } from 'lucide-react';
import './StatusUpdater.css';

const statuses = [
    {
        value: "Shipped",
        label: "Shipped",
        icon: Package,
        description: "Order has been shipped",
    },
    {
        value: "Out for Delivery",
        label: "Out for Delivery",
        icon: Truck,
        description: "Order is out for delivery",
    },
    {
        value: "Delivered",
        label: "Delivered",
        icon: Home,
        description: "Order has been delivered",
    },
    {
        value: "Cancelled",
        label: "Cancelled",
        icon: X,
        description: "Order has been cancelled",
    },
];

export function StatusUpdater({ currentStatus, onStatusChange }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);

    const handleStatusSelect = (status) => {
        setSelectedStatus(status);
    };

    const handleUpdateStatus = async () => {
        if (selectedStatus === currentStatus) return;

        setIsUpdating(true);
        const success = await onStatusChange(selectedStatus);

        if (!success) {
            setSelectedStatus(currentStatus);
        }

        setIsUpdating(false);
    };

    return (
        <div className="status-updater-card">
            <div className="status-updater-header">
                <h3 className="status-updater-title">Update Status</h3>
            </div>
            <div className="status-updater-content">
                {statuses.filter(status => {
                    if (currentStatus === 'Dispatched') {
                        return status.value === 'Shipped';
                    }
                    if (currentStatus === 'Shipped') {
                        return status.value === 'Out for Delivery' || status.value === 'Delivered';
                    }
                    if (currentStatus === 'Out for Delivery') {
                        return status.value === 'Delivered' || status.value === 'Cancelled';
                    }
                    if (currentStatus === 'Delivered') {
                        return status.value === 'Cancelled';
                    }
                    if (currentStatus === 'Cancelled') {
                        return status.value === 'Cancelled';
                    }
                    return true;
                }).map((status) => {
                    const Icon = status.icon;
                    const isSelected = selectedStatus === status.value;
                    const isCurrent = currentStatus === status.value;

                    return (
                        <button
                            key={status.value}
                            className={`status-updater-button ${isSelected ? 'status-selected' : ''} ${isCurrent ? 'status-current' : ''}`}
                            onClick={() => handleStatusSelect(status.value)}
                            disabled={isUpdating}
                        >
                            <div className="status-updater-button-content">
                                <div className={`status-updater-icon-container ${isSelected ? 'status-icon-selected' : ''}`}>
                                    {isUpdating && selectedStatus === status.value ? (
                                        <Loader2 className="status-updater-icon status-updater-spinner" />
                                    ) : (
                                        <Icon className="status-updater-icon" />
                                    )}
                                </div>
                                <div className="status-updater-button-text">
                                    <p className="status-updater-label">{status.label}</p>
                                    <p className="status-updater-description">{status.description}</p>
                                </div>
                                {isCurrent && <Check className="status-updater-check" />}
                            </div>
                        </button>
                    );
                })}
                <button
                    className="status-updater-update-button"
                    onClick={handleUpdateStatus}
                    disabled={isUpdating || selectedStatus === currentStatus || currentStatus === 'Cancelled'}
                >
                    {isUpdating ? (
                        <>
                            <Loader2 className="status-updater-update-spinner" />
                            Updating...
                        </>
                    ) : currentStatus === 'Cancelled' ? (
                        'Order Cancelled'
                    ) : (
                        'Update Status'
                    )}
                </button>
            </div>
        </div>
    );
}
