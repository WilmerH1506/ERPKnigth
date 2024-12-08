import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import Modal from './ModalInput';
import ConfirmationModal from './confirmModal'; 
import { getPatients, registerPatients, deletePatient, editPatient } from "../api/api.js"; 
import {registerDate} from '../api/api.js';
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import './Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false); 
  const [modalTitle, setModalTitle] = useState('');
  const [currentPatient, setCurrentPatient] = useState({ Nombre: '', Sexo: '', DNI: '', Telefono: '', Correo: '' });
  const [patientToDelete, setPatientToDelete] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [patientsPerPage] = useState(5); 
  const [totalpages, setTotalPages] = useState(0); 

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
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

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await getPatients();
        setPatients(response);
        setFilteredPatients(response);
        setTotalPages(Math.ceil(response.length / patientsPerPage));
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setIsLoading(false); 
      }
    };

    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = patients.filter(patient => 
      patient.Nombre.toLowerCase().includes(term.toLowerCase()) || 
      patient.DNI.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredPatients(filtered);
    setCurrentPage(1);  
  };

  const openModal = (patient = null) => {
    if (patient) {
      setModalTitle('Editar Paciente');
      setCurrentPatient(patient);
    } else {
      setModalTitle('Paciente Nuevo');
      setCurrentPatient({ Nombre: '', Sexo: '', DNI: '', Telefono: '', Correo: '' });
    }
    setIsModalOpen(true);
  };

  const openAppointmentModal = (Patient) => {
    setCurrentDate({ ...currentDate, Paciente: Patient.Nombre });
    setIsAppointmentModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
  };

  const openConfirmation = (id) => {
    setPatientToDelete(id); 
    setIsConfirmationOpen(true); 
  };

  const closeConfirmation = () => {
    setIsConfirmationOpen(false);
    setPatientToDelete(null); 
  };

  const handleDelete = async () => {
    try {
      await deletePatient(patientToDelete); 
      setPatients(patients.filter(p => p._id !== patientToDelete)); 
      setFilteredPatients(filteredPatients.filter(p => p._id !== patientToDelete));
      toast.success('Paciente eliminado con éxito!');
      closeConfirmation(); 
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Error al eliminar el paciente.');
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (currentPatient._id) { 
        const updatedPatient = await editPatient({ ...data, _id: currentPatient._id });
        setPatients(
          patients.map((patient) => (patient._id === updatedPatient._id ? updatedPatient : patient))
        );
        setFilteredPatients(
          filteredPatients.map((patient) => (patient._id === updatedPatient._id ? updatedPatient : patient))
        );
        toast.success('Paciente editado con éxito!');
      } else {
        const newPatient = await registerPatients(data);
        setPatients([...patients, newPatient]);
        setFilteredPatients([...filteredPatients, newPatient]);
        toast.success('Paciente agregado con éxito!');
      }
      closeModal(); 
    } catch (error) {
      console.error('Error al agregar o editar el paciente:', error);
      toast.error('Error al guardar el paciente.');
    }
  };

  const handleSubmitDate = async (data) => {
    try {
      data.Paciente = currentDate.Paciente; 

      if (validateAppointmentTimes(data) !== true) {
        return toast.error(validateAppointmentTimes(data));
      }

      const isAvailable = await validateDateDisponibility(data);
      if (!isAvailable) {
      return toast.error('La fecha y hora seleccionadas no están disponibles');
      }

      await registerDate(data);
      toast.success('Cita agregada con éxito!');
      closeAppointmentModal();
    } catch (error) {
      console.error('Error al agregar la cita:', error);
      toast.error('Error al guardar la cita.');
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  
  const inputs = [
    {
      label: 'Nombre',
      name: 'Nombre',
      placeholder: 'Ingrese el nombre',
      validation: 
      { required: 'Campo requerido',
        length: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
        pattern: { value: /^[a-zA-Z\s]*$/, message: 'El nombre no puede contener números' },
      },
    },
    {
  
      label: 'Sexo',
      name: 'Sexo',
      placeholder: 'Seleccione sexo',
      type: 'select', 
      options: ['Masculino', 'Femenino'],
      validation:
      { required: 'Campo requerido',},
    },
    {
      label: 'DNI',
      name: 'DNI',
      placeholder: 'Ingrese el DNI',
      validation: 
      { required: 'Campo requerido',
        minLength: {
          value: 13,
          message: 'El DNI debe tener al menos 13 caracteres',
        },
        maxLength: {
          value: 15,
          message: 'El DNI debe tener como máximo 15 caracteres',
        },
        pattern: { value: /^[0-9-]*$/, message: 'El DNI solo puede contener números y guiones' },
      },
    },
    {
      label: 'Teléfono',
      name: 'Telefono',
      placeholder: 'Ingrese el teléfono',
      validation: 
      { required: 'Campo requerido',
        minLength: {
          value: 8,
          message: 'El telefono debe tener al menos 8 caracteres',
        },
        maxLength: {
          value: 14,
          message: 'El telefono debe tener como máximo 14 caracteres',
        },
        pattern: { value: /^[0-9+-]*$/, message: 'El teléfono solo puede contener números, + y guiones' },
      },
    },
    {
      label: 'Correo',
      name: 'Correo',
      type: 'email',
      placeholder: 'Ingrese el correo',
      validation: 
      { required: 'Campo requerido',
        pattern: { value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, message: 'Correo inválido' },
      },
    },
  ];

  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .split('T')[0];

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

  const Dateinputs = [
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
    <div className="patients-container">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={true} />
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      <div className="header">
        <h1>Pacientes</h1>
        <button className="new-patient-button" onClick={() => openModal()}>
          <FaPlus className="plus-icon" /> Paciente Nuevo
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre o DNI"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="patients-table">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Sexo</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentPatients.map((patient) => (
              <tr key={patient._id}>
                <td>{patient.Nombre}</td>
                <td>{patient.Sexo}</td>
                <td>{patient.DNI}</td>
                <td>{patient.Telefono}</td>
                <td>{patient.Correo}</td>
                <td>
                  <button className="edit-button" onClick={() => openModal(patient)}>
                    <FaEdit /> Editar
                  </button>
                  <button className="delete-button" onClick={() => openConfirmation(patient._id)}>
                    <FaTrashAlt /> Eliminar
                  </button>
                  <button className="edit-button" onClick={() => openAppointmentModal(patient)}>
                    <FaPlus /> Agregar Cita
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
          <button onClick={handlePreviousPage} disabled={currentPage === 1} className="pagination-button">
            &laquo; Anterior
          </button>
          <span className="page-info">Página {currentPage} de {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className="pagination-button">
            Siguiente &raquo;
          </button>
        </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        inputs={inputs}
        title={modalTitle}
        onSubmit={handleSubmit} 
        currentData={currentPatient}
      />

      <Modal
        isOpen={isAppointmentModalOpen}
        onClose={closeAppointmentModal}
        inputs={Dateinputs}
        title="Nueva Cita"
        onSubmit={handleSubmitDate}
        currentData={currentDate}
      />

      <ConfirmationModal 
        isOpen={isConfirmationOpen} 
        onClose={closeConfirmation} 
        onConfirm={handleDelete} 
        message="¿Estás seguro que deseas eliminar este patiente?, esta acción no se puede deshacer."
      />
    </div>
  );
};

export default Patients;
