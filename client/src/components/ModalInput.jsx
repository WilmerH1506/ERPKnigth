import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import './Modal.css'; 

const Modal = ({ isOpen, onClose, inputs, title, onSubmit, currentPatient }) => {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    reset(currentPatient); 
  }, [currentPatient, reset]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {inputs.map((input, index) => (
            <div key={index} className="form-group">
              <label>{input.label}</label>
              {input.type === 'select' ? (
                <select {...register(input.name)} defaultValue={currentPatient[input.name]}>
                  <option value="">Seleccione sexo</option>
                  {input.options.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={input.type || "text"}
                  placeholder={input.placeholder || ""}
                  {...register(input.name)} 
                />
              )}
            </div>
          ))}
          <div className="modal-footer">
            <button type="submit" className="submit-button">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
