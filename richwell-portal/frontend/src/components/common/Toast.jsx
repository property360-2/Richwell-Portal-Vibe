// frontend/src/components/common/Toast.jsx
import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ 
  type = 'info', 
  message, 
  onClose,
  duration = 5000,
  position = 'top-right' // top-right, top-left, bottom-right, bottom-left, top-center
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const toastStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      progress: 'bg-green-600'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      progress: 'bg-red-600'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      progress: 'bg-yellow-600'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600',
      progress: 'bg-blue-600'
    }
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2'
  };

  const style = toastStyles[type] || toastStyles.info;
  const Icon = style.icon;

  return (
    <div 
      className={`fixed ${positions[position]} z-50 animate-in slide-in-from-top-2 duration-300`}
    >
      <div 
        className={`${style.bg} border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md`}
      >
        <div className="flex items-start gap-3">
          <Icon className={`${style.iconColor} flex-shrink-0 mt-0.5`} size={20} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${style.text}`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`${style.text} hover:opacity-70 flex-shrink-0`}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Progress bar */}
        {duration > 0 && (
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${style.progress} animate-shrink`}
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink {
          animation: shrink linear;
        }
      `}</style>
    </div>
  );
};

// Toast Container to manage multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto"
          style={{ 
            transform: `translateY(${index * 80}px)` 
          }}
        >
          <Toast
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default Toast;