import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import './Modal.css';
import {ToastContainer, toast } from 'react-toastify';

const Modal = ({
  isOpen = false,
  onClose = () => {},
  inputs = [],
  title = "",
  onSubmit = () => {},
  currentData = {},
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    if (currentData && Object.keys(currentData).length > 0) {
      reset(currentData);
    }
  }, [currentData, reset]);

  const handleTimeChange = (e, inputName) => {
    const timeValue = e.target.value;
    const [hours] = timeValue.split(':'); 
    setValue(inputName, `${hours}:00`);
  };

 
  const disableSundays = (e) => {
    const inputDate = e.target;
    const selectedDate = new Date(inputDate.value);
    const dayOfWeek = selectedDate.getUTCDay(); 

    if (dayOfWeek === 0) { 
      toast.error('No se pueden seleccionar domingos', {
        position: 'top-right',
        autoClose: 3000,
      });
      inputDate.value = ''; 
    }
  };

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
          {inputs.map((input, index) => {
            const isError = errors[input.name];
            return (
              <div key={index} className={`form-group ${isError ? 'error' : ''}`}>
                <label>{input.label}</label>
                <div style={{ position: 'relative' }}>
                  {input.type === 'time' ? (
                    <input
                      type="time"
                      {...register(input.name, input.validation)}
                      onChange={(e) => handleTimeChange(e, input.name)} 
                    />
                  ) : input.type === 'date' ? (
                    <input
                      type="date"
                      {...register(input.name, input.validation)}
                      onChange={(e) => disableSundays(e)} 
                    />
                  ) : input.type === 'select' && input.options ? (
                    <select
                      {...register(input.name, input.validation)}
                    >
                      <option value="">{input.placeholder || 'Seleccione una opción'}</option>
                      {input.options.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={input.type || 'text'}
                      placeholder={input.placeholder || ''}
                      {...register(input.name, input.validation)}
                    />
                  )}
                  {isError && (
                    <div className="error-container">
                      <span
                        className="error-icon"
                        title={errors[input.name]?.message || 'Campo inválido'}
                      >
                        ⚠️
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div className="modal-footer">
            <button type="submit" className="submit-button">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
