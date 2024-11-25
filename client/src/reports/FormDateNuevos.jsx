import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FormDateNuevos.css";

const SelectDateForGrowthReport = () => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!month || !year) {
      alert("Por favor, selecciona tanto el mes como el año.");
      return;
    }

    const formattedDate = `${month}-${year}`;
    navigate(`/reporte-crecimiento/${formattedDate}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="growth-report-date-container">
      <h1 className="growth-report-date-title">Seleccionar Fecha para Reportes Estadistico de pacientes</h1>
      <form onSubmit={handleSubmit} className="growth-report-date-form">
        <div className="growth-report-date-group">
          <label htmlFor="month" className="growth-report-date-label">Mes:</label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            className="growth-report-date-input"
          >
            <option value="">Selecciona un mes</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
            <option value="04">Abril</option>
            <option value="05">Mayo</option>
            <option value="06">Junio</option>
            <option value="07">Julio</option>
            <option value="08">Agosto</option>
            <option value="09">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>

        <div className="growth-report-date-group">
          <label htmlFor="year" className="growth-report-date-label">Año:</label>
          <input
            id="year"
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Ejemplo: 2024"
            required
            className="growth-report-date-input"
          />
        </div>

        <div className="growth-report-date-group">
          <button type="submit" className="growth-report-date-button">
            Generar Reporte
          </button>
        </div>

        <div className="growth-report-date-group">
          <button
            type="button"
            className="growth-report-date-back-button"
            onClick={handleGoBack}
          >
            Regresar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SelectDateForGrowthReport;