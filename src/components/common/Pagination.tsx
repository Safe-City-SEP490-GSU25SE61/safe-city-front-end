import React, { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
    message: string;
    type?: NotificationType;
    onClose?: () => void;
    duration?: number; // in ms
}

const typeClasses: Record<NotificationType, string> = {
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export const Notification: React.FC<NotificationProps> = ({
    message,
    type = 'info',
    onClose,
    duration = 3000,
}) => {
    useEffect(() => {
        if (!onClose) return;
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div
            className={`relative min-w-[200px] px-5 py-3 rounded border shadow-md my-2 ${typeClasses[type]}`}
            role="alert"
        >
            {message}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 bg-transparent border-none text-inherit text-lg cursor-pointer"
                    aria-label="Close"
                    type="button"
                >
                    ×
                </button>
            )}
        </div>
    );
};
