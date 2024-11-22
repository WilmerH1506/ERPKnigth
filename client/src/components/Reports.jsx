import React from 'react';
import './Reports.css';
import { FaUserMd,FaCalendarTimes ,FaChartLine,FaClock, FaTimesCircle, FaDollarSign, FaBox, FaPills, FaComment } from 'react-icons/fa';

const ClinicReports = () => {
  const sections = [
    {
      title: 'Clínico',
      items: [
        { icon: <FaUserMd />, title: 'Citas por paciente', description: 'Resumen historico de citas' },
        { icon: <FaClock />, title: 'Horarios Doctoras', description: 'Ocupación y disponibilidad' },
        { icon: <FaChartLine />, title: 'Pacientes nuevos', description: 'Estadística mensual' },
      ],
    },
    {
      title: 'Administrativo',
      items: [
        { icon: <FaComment />, title: 'Quejas', description: 'Análisis de quejas de pacientes' },
        { icon: <FaTimesCircle />, title: 'Cancelaciones', description: 'Análisis de cancelaciones de citas' },
        { icon: <FaDollarSign />, title: 'Ingresos', description: 'Generados por servicio' },
        { icon: <FaBox />, title: 'Inventario', description: 'Control de insumos' },
        { icon: <FaCalendarTimes/>, title: 'Tasa de abandonos', description: 'Pacientes que no asisten a citas hace 6 o mas meses' },
      ],
    },
  ];

  const historicalReports = [
    { date: '2024-11-01', report: 'Informe de pacientes actualizado' },
    { date: '2024-10-15', report: 'Estadísticas generales' },
    // Agrega más reportes históricos aquí
  ];

  return (
    <div className="clinic-reports">
      <h1>Reportes de la Clínica</h1>

      <input
        type="text"
        placeholder="Buscar informes..."
        className="search-input"
      />

      {sections.map((section, index) => (
        <div key={index} className="section">
          <h2>{section.title}</h2>
          <div className="card-container">
            {section.items.map((item, idx) => (
              <button key={idx} className="card">
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

      {/* Sección de Histórico de Reportes */}
      <div className="historical-reports">
        <h2>Histórico de Reportes Generados</h2>
        <div className="historical-cards">
          {historicalReports.map((report, index) => (
            <div key={index} className="historical-card">
              <p><strong>{report.date}</strong></p>
              <p>{report.report}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClinicReports;
