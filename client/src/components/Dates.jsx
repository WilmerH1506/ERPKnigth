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
  const [filteredDate, setFilteredDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentDate, setCurrentDate] = useState({
    Fecha: '',
    Hora_Ingreso: '',
    Hora_Salida: '',
    Paciente: '',
    Tratamiento: '',
    Cantidad: '',
    Descripcion: '',
    Odontologo: '',
    Estado: '',
  });
  const [dateToDelete, setDateToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const response = await getDates();
        setDates(response);
        setFilteredDates(response);
      } catch (error) {
        console.error('Error al obtener las citas:', error);
        toast.error('Error al cargar las citas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDates();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = dates.filter(
      (date) => 
        date.Paciente.toLowerCase().includes(term.toLowerCase()) ||
        date.Odontologo.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredDates(filtered);
    setCurrentPage(1);    
  };

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
        Cantidad: '',
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

        const validation = validateAppointmentTimes(data);
        if (validation !== true) {
          return toast.error(validation);
        }

        const isAvailable = await validateDateDisponibility(data);
        if (!isAvailable) {
          return toast.error('La fecha y hora seleccionada ya está ocupada');
        }
        const updatedDate = await editDate({ ...data, _id: currentDate._id });
        setDates(
          dates.map((date) => (date._id === updatedDate._id ? updatedDate : date))
        );
        setFilteredDates(
          filteredDate.map((date) => (date._id === updatedDate._id ? updatedDate : date))
        );
        toast.success('Cita editada con éxito!');
      } else {
        const newDate = await registerDate(data);
        setDates([...dates, newDate]);
        setFilteredDates([...filteredDate, newDate]);
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
      setDates(dates.filter((date) => date._id !== dateToDelete));
      setFilteredDates(filteredDate.filter((date) => date._id !== dateToDelete));
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDate.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil( filteredDate.length/ itemsPerPage);

  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .split('T')[0];

  const validateAppointmentTimes = (data) => {
    const { Hora_Ingreso, Hora_Salida } = data;
  
    if (!Hora_Ingreso || !Hora_Salida) {
      return 'Ambos campos de hora son obligatorios';
    }
  
    const [startHour, startMinute] = Hora_Ingreso.split(':').map(Number);
    const [endHour, endMinute] = Hora_Salida.split(':').map(Number);
  
    if (endHour < 8 || endHour > 17 || startHour < 8 || startHour > 17) {
      return 'Las horas deben estar entre las 8:00 y las 17:00';
    }
  
    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
      return 'La hora de salida debe ser posterior a la hora de ingreso';
    }
  
    return true; 
  };

  const validateDateDisponibility = async (data) => {
    const { Fecha, Hora_Ingreso, Odontologo} = data;
    try {
      const response = await axios.post('http://localhost:3000/api/dates/especificDate', {
          Fecha,
          Hora_Ingreso,
          Odontologo,
      }
      );

      if (!response.data) {
        throw new Error('Error al consultar la disponibilidad de la fecha');
      }
      
      return response.data.length === 0;
    } catch (error) {
      console.error('Error al validar la disponibilidad de la fecha:', error);
      return false; 
    }
  }

  const inputs = [
    {
      label: 'Fecha',
      name: 'Fecha',
      type: 'date',
      value: currentDate.Fecha,
      validation:
      { required: 'Campo requerido',
        min: {value : localDate, message: 'La fecha de la cita no puede ser anterior a la fecha actual'},
      },
    },
    {
      label: 'Hora de Inicio',
      name: 'Hora_Ingreso',
      type: 'time',
      value: currentDate.Hora_Ingreso,
      validation:
      { required: 'Campo requerido',
      },
    },
    {
      label: 'Hora de Salida',
      name: 'Hora_Salida',
      type: 'time',
      value: currentDate.Hora_Salida,
      validation:
      { required: 'Campo requerido',
    },
    },
    {
      label: 'Paciente',
      name: 'Paciente',
      type: 'text',
      value: currentDate.Paciente,
      placeholder: 'Ingrese el nombre del paciente',
      validation:
      { required: 'Campo requerido',
        disabled: true,
        pattern: { value: /^[a-zA-Z\s]*$/, message: 'El nombre del paciente no puede contener números' },
      },
    },
    {
      label: 'Tratamiento',
      name: 'Tratamiento',
      type: 'select',
      placeholder: 'Seleccione el tratamiento',
      options: ['Examen Clínico','Limpiezas','Blanqueamientos','Tratamientos de las Encías','Extracciones',
               'Restauraciones Estéticas','Prótesis Fijas (de Porcelana)','Prótesis Removibles','Endodoncias',
               'Cirugía de Cordales Impactadas','Tratamientos Infantiles','Atención a pacientes Diabéticos',
               'Ortodoncia','Periodoncia','Endodoncia'],
      value: currentDate.Tratamiento, 
      validation:
      { required: 'Campo requerido',} 
    },
    {
      label: 'Cantidad',
      name: 'Cantidad',
      type: 'number',
      value: currentDate.Cantidad,
      placeholder: 'Ingrese la cantidad de tratamientos',
      validation:
      { required: 'Campo requerido',
        max: { value: 4, message: 'La cantidad de tratamientos no debe ser mayor a 4' },
      },
    },
    {
      label: 'Descripción',
      name: 'Descripcion',
      type: 'text',
      value: currentDate.Descripcion,
      placeholder: 'Ingrese la descripción del tratamiento',
      validation:
      { required: 'Campo requerido',
        minLength: {
          value: 3,
          message: 'La descripción debe tener al menos 10 caracteres',
        },
        maxLength: {
          value: 100,
          message: 'La descripción debe tener como máximo 100 caracteres',
        },
      }, 
    },
    {
      label: 'Odontólogo',
      name: 'Odontologo',
      type: 'select',
      placeholder: 'Seleccione el odontólogo',
      value: currentDate.Odontologo,
      options: ['Dra. Lesly Sofia Mejia', 'Dra. Gina Esperanza Argueta'],
      validation:
      { required: 'Campo requerido',}
    },
    {
      label: 'Estado',
      name: 'Estado',
      type: 'select',
      placeholder: 'Seleccione el estado de la cita',
      value: currentDate.Estado,
      options: ['Pendiente', 'Cancelada', 'Realizada'],
      validation:
      { required: 'Campo requerido',}
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
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por Odontólogo o paciente"
              value={searchTerm}
              onChange={handleSearch}
            />
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
                  <th>Cantidad</th>
                  <th>Descripcion</th>
                  <th>Odontólogo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((date) => (
                  <tr key={date._id}>
                    <td>{formatDate(date.Fecha)}</td>
                    <td>{date.Hora_Ingreso}</td>
                    <td>{date.Hora_Salida}</td>
                    <td>{date.Paciente}</td>
                    <td>{date.Tratamiento}</td>
                    <td className="centered-text">{date.Cantidad}</td>
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

          {/* Paginación */}
          <div className="pagination-container inventory-pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn inventory-pagination-button"
            >
              Anterior
            </button>
            <span className="pagination-info">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="pagination-btn inventory-pagination-button"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        inputs={inputs}
        title={modalTitle}
        onSubmit={handleSubmit}
        currentData={currentDate}
        
      />

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={closeConfirmation}
        onConfirm={handleDelete}
        message="¿Estás seguro que deseas eliminar esta cita?, esta acción no se puede deshacer."
      />
    </div>
  );
};

export default Dates;
