import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Reports.css';
import { FaUserMd, FaCalendarTimes, FaChartLine, FaClock, FaTimesCircle, FaDollarSign, FaBox, FaComment } from 'react-icons/fa';

const ClinicReports = () => {
  const navigate = useNavigate(); 

  useEffect(() => {
    fetch('http://localhost:3000/api/patients')
      .then((response) => response.json())
      .then((data) => setPatients(data))
      .catch((error) => console.error('Error al cargar los pacientes:', error));
  }, []);

  const sections = [
    {
      title: 'Clínico',
      items: [
        { icon: <FaUserMd />, title: 'Citas por paciente', description: 'Resumen histórico de citas' },
        { icon: <FaClock />, title: 'Horarios Doctoras', description: 'Ocupación y disponibilidad' },
        { icon: <FaChartLine />, title: 'Pacientes nuevos', description: 'Estadísticas mensuales' },
      ],
    },
    {
      title: 'Administrativo',
      items: [
        { icon: <FaComment />, title: 'Quejas', description: 'Análisis de quejas de pacientes' },
        { icon: <FaTimesCircle />, title: 'Cancelaciones', description: 'Análisis de cancelaciones de citas' },
        { icon: <FaDollarSign />, title: 'Ingresos', description: 'Generados por servicio' },
        { icon: <FaBox />, title: 'Inventario', description: 'Control de insumos' },
        { icon: <FaCalendarTimes />, title: 'Abandonos', description: 'Pacientes que no asisten a citas hace 6 o más meses' },
      ],
    },
  ];

  const historicalReports = [
    { date: '2024-11-01', report: 'Informe de pacientes actualizado' },
    { date: '2024-10-15', report: 'Estadísticas generales' },
  ];

  const handleCardClick = (reportType) => {
    if (reportType === 'Citas por paciente') {
      navigate('/seleccionar-paciente');
    }

    if (reportType === 'Cancelaciones') {
      navigate('/seleccionar-fecha-cancelaciones');
    }

    if (reportType === 'Ingresos') {
      navigate('/seleccionar-fecha-reportes');
    }

    if (reportType === 'Quejas') {
      navigate('/seleccionar-fecha-quejas');
    }

    if (reportType === 'Abandonos') {
      navigate('/reporte-abandono');
    }

    if (reportType === 'Inventario') {
      navigate('/reporte-inventario');
    }

    if (reportType === 'Pacientes nuevos') {
      navigate('/seleccionar-fecha-crecimiento');
    }

    if (reportType === 'Horarios Doctoras') {
      navigate('/seleccionar-fecha-horas-libres');
    }
  };


  return (
    <div className="clinic-reports">
      <h1>Reportes de la Clínica</h1>

      {sections.map((section, index) => (
        <div key={index} className="section">
          <h2>{section.title}</h2>
          <div className="card-container">
            {section.items.map((item, idx) => (
              <button key={idx} className="card" onClick={() => handleCardClick(item.title)}>
                <div className="card-icon">{item.icon}</div>
                <div className="card-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

    </div>
  );
};

export default ClinicReports;
