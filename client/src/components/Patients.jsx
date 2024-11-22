import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import Modal from './ModalInput';
import ConfirmationModal from './confirmModal'; 
import { getPatients, registerPatients, deletePatient, editPatient } from "../api/api.js"; 
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

  const closeModal = () => {
    setIsModalOpen(false);
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
    },
    {
      label: 'Sexo',
      name: 'Sexo',
      placeholder: 'Seleccione sexo',
      type: 'select', 
      options: ['Masculino', 'Femenino', 'Otro'], 
    },
    {
      label: 'DNI',
      name: 'DNI',
      placeholder: 'Ingrese el DNI',
    },
    {
      label: 'Teléfono',
      name: 'Telefono',
      placeholder: 'Ingrese el teléfono',
    },
    {
      label: 'Correo',
      name: 'Correo',
      type: 'email',
      placeholder: 'Ingrese el correo',
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
        currentPatient={currentPatient}
      />

      <ConfirmationModal 
        isOpen={isConfirmationOpen} 
        onClose={closeConfirmation} 
        onConfirm={handleDelete} 
      />
    </div>
  );
};

export default Patients;
