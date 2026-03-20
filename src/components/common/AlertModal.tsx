import React from 'react';
import Modal from './Modal';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  buttonText?: string;
}

const AlertModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',
  buttonText = 'Entendido'
}: AlertModalProps) => {
  const icons = {
    success: <CheckCircle size={24} className="text-green-600" />,
    error: <AlertCircle size={24} className="text-red-600" />,
    info: <Info size={24} className="text-blue-600" />
  };

  const colors = {
    success: 'bg-green-100',
    error: 'bg-red-100',
    info: 'bg-blue-100'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          {buttonText}
        </button>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`rounded-full p-2 flex-shrink-0 ${colors[type]}`}>
          {icons[type]}
        </div>
        <p className="text-gray-600 leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
};

export default AlertModal;
