// frontend/src/components/common/ConfirmDialog.jsx
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  type = 'warning', // warning, danger, info, success
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) => {
  const icons = {
    warning: { Icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    danger: { Icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    info: { Icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
    success: { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' }
  };

  const variants = {
    warning: 'warning',
    danger: 'danger',
    info: 'primary',
    success: 'success'
  };

  const { Icon, color, bg } = icons[type] || icons.warning;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <div className="space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className={`${bg} p-4 rounded-full`}>
            <Icon size={48} className={color} />
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-gray-700 text-base">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variants[type]}
            fullWidth
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;