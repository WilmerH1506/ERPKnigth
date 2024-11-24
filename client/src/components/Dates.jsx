import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import Modal from './ModalInput';
import ConfirmationModal from './confirmModal';
import { getDates, registerDate, editDate, deleteDate } from '../api/api.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Dates.css';

const Dates = () => {
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentDate, setCurrentDate] = useState({
    Fecha: '',
    Hora_Ingreso: '',
    Hora_Salida: '',
    Paciente: '',
    Tratamiento: '',
    Descripcion: '',
    Odontologo: '',
    Estado: '',
  });
  const [dateToDelete, setDateToDelete] = useState(null);
  

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const response = await getDates();
        setDates(response);
      } catch (error) {
        console.error('Error al obtener las citas:', error);
        toast.error('Error al cargar las citas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDates();
  }, []);

  const openModal = (date = null) => {
    if (date) {
      setModalTitle('Editar Cita');
      setCurrentDate({
        ...date,
        Fecha: formatDate(date.Fecha),
      });
    } else {
      setModalTitle('Cita Nueva');
      setCurrentDate({
        Fecha: '',
        Hora_Ingreso: '',
        Hora_Salida: '',
        Paciente: '',
        Tratamiento: '',
        Descripcion: '',
        Odontologo: '',
        Estado: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openConfirmation = (id) => {
    setDateToDelete(id);
    setIsConfirmationOpen(true);
  };

  const closeConfirmation = () => {
    setIsConfirmationOpen(false);
    setDateToDelete(null);
  };

  const handleSubmit = async (data) => {
    try {
      setIsLoading(true);
      if (currentDate._id) {
        const updatedDate = await editDate({ ...data, _id: currentDate._id });
        setDates(
          dates.map((date) => (date._id === updatedDate._id ? updatedDate : date))
        );
        toast.success('Cita editada con éxito!');
      } else {
        const newDate = await registerDate(data);
        setDates([...dates, newDate]);
        toast.success('Cita registrada con éxito!');
      }
      closeModal();
    } catch (error) {
      console.error('Error al registrar o editar la cita:', error);
      toast.error('Error al registrar o editar la cita.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteDate(dateToDelete);
      setDates(dates.filter(date => date._id !== dateToDelete));
      toast.success('Cita eliminada con éxito!');
      closeConfirmation();
    } catch (error) {
      console.error('Error al eliminar la cita:', error);
      toast.error('Error al eliminar la cita.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDate({ ...currentDate, [name]: value });
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
      label: 'Hora de Inicio',
      name: 'Hora_Ingreso',
      type: 'time',
      value: currentDate.Hora_Ingreso,
      onChange: handleInputChange,
    },
    {
      label: 'Hora de Salida',
      name: 'Hora_Salida',
      type: 'time',
      value: currentDate.Hora_Salida,
      onChange: handleInputChange,
    },
    {
      label: 'Paciente',
      name: 'Paciente',
      type: 'text',
      value: currentDate.Paciente,
      placeholder: 'Ingrese el nombre del paciente',
      onChange: handleInputChange,
    },
    {
      label: 'Tratamiento',
      name: 'Tratamiento',
      type: 'text',
      value: currentDate.Tratamiento,
      placeholder: 'Ingrese el tratamiento',
      onChange: handleInputChange,
    },
    {
      label: 'Descripción',
      name: 'Descripcion',
      type: 'text',
      value: currentDate.Descripcion,
      placeholder: 'Ingrese la descripción del tratamiento',
      onChange: handleInputChange,
    },
    {
      label: 'Odontólogo',
      name: 'Odontologo',
      type: 'select',
      placeholder: 'Seleccione el odontólogo',
      value: currentDate.Odontologo,
      onChange: handleInputChange,
      options: ['Dra. Lesly Sofia Mejia', 'Dra. Gina Esperanza Argueta'],
    },
    {
      label: 'Estado',
      name: 'Estado',
      type: 'select',
      placeholder: 'Seleccione el estado de la cita',
      value: currentDate.Estado,
      onChange: handleInputChange,
      options: ['Pendiente', 'Cancelada', 'Realizada','Ausente'],
    },
  ];

  return (
    <div className="dates-container">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={true} />

      {isLoading ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      ) : (
        <div>
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
                  <th>Hora de Ingreso</th>
                  <th>Hora de Salida</th>
                  <th>Paciente</th>
                  <th>Tratamiento</th>
                  <th>Descripcion</th>
                  <th>Odontólogo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dates.map((date) => (
                  <tr key={date._id}>
                    <td>{formatDate(date.Fecha)}</td>
                    <td>{date.Hora_Ingreso}</td>
                    <td>{date.Hora_Salida}</td>
                    <td>{date.Paciente}</td>
                    <td>{date.Tratamiento}</td>
                    <td>{date.Descripcion}</td>
                    <td>{date.Odontologo}</td>
                    <td>{date.Estado}</td>
                    <td className="action-buttons">
                      <button className="edit-button" onClick={() => openModal(date)}>
                        <FaEdit /> Editar
                      </button>
                      <button className="delete-button" onClick={() => openConfirmation(date._id)}>
                        <FaTrashAlt /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        inputs={inputs}
        title={modalTitle}
        onSubmit={handleSubmit}
        currentPatient={currentDate}
      />

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={closeConfirmation}
        onConfirm={handleDelete}
        message="¿Estás seguro que deseas eliminar esta cita?"
      />
    </div>
  );
};

export default Dates;
