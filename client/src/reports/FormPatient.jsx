import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import "./FormPatient.css";

const PatientSelectionPage = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/patients")
      .then((response) => response.json())
      .then((data) => setPatients(data))
      .catch((error) => console.error("Error al cargar los pacientes:", error));
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSelect = (patientId) => {
    if (patientId) {
      navigate(`/reporte-citas/${patientId}`);
    } else {
      console.error("El ID del paciente es undefined");
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="patient-selection-page">
        <button className="Patient-selection-back-button" onClick={handleGoBack}>
         ←  Salir
        </button>  
      <h1> Seleccionar Paciente
      </h1>
      <div className="search-container">
      <input
                type="text"
                placeholder={
                    patients.length === 0
                    ? "No hay pacientes disponibles..."
                    : "Buscar paciente por nombre..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
      />
      </div>
      <ul className="patient-list">
            {filteredPatients.map((patient) => (
                <li
                key={patient._id}
                onClick={() => handlePatientSelect(patient._id)}
                className="patient-item"
                >
                <FaUser style={{ marginRight: "10px", color: "#15999b" }} />
                {patient.Nombre}
                </li>
            ))}
       </ul>
    </div>
  );
};

export default PatientSelectionPage;
