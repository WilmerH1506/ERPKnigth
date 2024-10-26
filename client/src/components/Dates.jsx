import React, { useState } from 'react';
import { FaEdit, FaTrashAlt, FaPlus, FaTimes } from 'react-icons/fa';
import Modal from './ModalInput'; 
import './Dates.css';

const initialDatesData = [
  { id: 1, Fecha: '08/10/2024', Hora: '5:00', Paciente: 'Carlitos Montoya', Tratamiento: 'Extracción de muela' },
  { id: 2, Fecha: '09/10/2024', Hora: '5:00', Paciente: 'Wilmer Hernández', Tratamiento: 'Limpieza' },
];

const Dates = () => {
  const [dates, setDates] = useState(initialDatesData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentDate, setCurrentDate] = useState({ id: null, Fecha: '', Hora: '', Paciente: '', Tratamiento: '' });

  const handleInputChange = (e) => {
    setCurrentDate({ ...currentDate, [e.target.name]: e.target.value });
  };

  const openModal = (date = null) => {
    if (date) {
      setModalTitle('Editar Cita');
      setCurrentDate(date);
    } else {
      setModalTitle('Cita Nueva');
      setCurrentDate({ id: null, Fecha: '', Hora: '', Paciente: '', Tratamiento: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentDate.id) {
      setDates(dates.map((item) => (item.id === currentDate.id ? currentDate : item)));
    } else {
      setDates([...dates, { ...currentDate, id: dates.length + 1 }]);
    }
    closeModal();
  };

  const deleteDate = (id) => {
    setDates(dates.filter(item => item.id !== id));
  };

  const inputs = [
    {
      label: 'Fecha',
      name: 'Fecha',
      type: 'date',
      value: currentDate.Fecha,
      onChange: handleInputChange,
    },
    {
      label: 'Hora',
      name: 'Hora',
      type: 'time',
      value: currentDate.Hora,
      onChange: handleInputChange,
    },
    {
      label: 'Paciente',
      name: 'Paciente',
      type: 'text',
      value: currentDate.Paciente,
      onChange: handleInputChange,
      placeholder: 'Ingrese el nombre del paciente',
    },
    {
      label: 'Tratamiento',
      name: 'Tratamiento',
      type: 'text',
      value: currentDate.Tratamiento,
      onChange: handleInputChange,
      placeholder: 'Ingrese el tratamiento',
    },
  ];

  return (
    <div className="dates-container">
      <div className="header">
        <h1>Citas</h1>
        <button className="new-date-button" onClick={() => openModal()}>
          <FaPlus className="plus-icon" /> Cita nueva
        </button>
      </div>

      <div className="dates-table">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Tratamiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => (
              <tr key={date.id}>
                <td>{date.Fecha}</td>
                <td>{date.Hora}</td>
                <td>{date.Paciente}</td>
                <td>{date.Tratamiento}</td>
                <td className="action-buttons">
                  <button className="edit-button" onClick={() => openModal(date)}>
                    <FaEdit /> Editar
                  </button>
                  <button className="delete-button" onClick={() => deleteDate(date.id)}>
                    <FaTrashAlt /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar/editar citas */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        inputs={inputs}
        title={modalTitle}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Dates;
