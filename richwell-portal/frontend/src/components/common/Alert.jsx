// frontend/src/components/common/Alert.jsx
import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  message, 
  onClose,
  className = ''
}) => {
  const alertStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600'
    }
  };

  const style = alertStyles[type] || alertStyles.info;
  const Icon = style.icon;

  return (
    <div 
      className={`${style.bg} ${style.border} border rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <Icon className={`${style.iconColor} mr-3 flex-shrink-0 mt-0.5`} size={20} />
        <div className="flex-1">
          <p className={`text-sm ${style.text}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${style.text} hover:opacity-70 ml-3 flex-shrink-0`}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;