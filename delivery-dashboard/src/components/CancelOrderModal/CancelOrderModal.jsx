import React, { useState } from 'react';
import { X } from 'lucide-react';
import './CancelOrderModal.css';

const CancelOrderModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [cancelReason, setCancelReason] = useState('');

    const handleSubmit = () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }
        onConfirm(cancelReason);
    };

    if (!isOpen) return null;

    return (
        <div className="cancel-modal-overlay" onClick={onClose}>
            <div className="cancel-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="cancel-modal-header">
                    <h2>Cancel Order</h2>
                    <button className="cancel-modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="cancel-modal-body">
                    <p className="cancel-modal-description">
                        Please provide a reason for cancelling this order:
                    </p>
                    <textarea
                        className="cancel-reason-textarea"
                        placeholder="Enter reason for cancellation (e.g., Address not reachable, Customer not available, etc.)..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={4}
                        maxLength={500}
                    />
                    <p className="cancel-char-count">{cancelReason.length}/500</p>
                </div>

                <div className="cancel-modal-footer">
                    <button
                        className="cancel-modal-btn cancel-modal-btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Go Back
                    </button>
                    <button
                        className="cancel-modal-btn cancel-modal-btn-danger"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelOrderModal;
