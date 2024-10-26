import React from 'react';
import './confirmModal.css'; 

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <h2>¿Estás seguro?</h2>
        <p>¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.</p>
        <div className="confirmation-buttons">
          <button className="confirm-button" onClick={onConfirm}>Sí, eliminar</button>
          <button className="cancel-button" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;