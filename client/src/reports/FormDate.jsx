import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FormDate.css";

const SelectDateForReports = () => {
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
    navigate(`/reporte-servicios/${formattedDate}`); 
  };

  const handleGoBack = () => {
    navigate(-1); 
  };

  return (
    <div className="select-date-reports-container">
      <h1 className="select-date-reports-title">Seleccionar Fecha para Reportes</h1>
      <form onSubmit={handleSubmit} className="select-date-reports-form">
        <div className="select-date-reports-group">
          <label htmlFor="month" className="select-date-reports-label">Mes:</label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            className="select-date-reports-input"
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

        <div className="select-date-reports-group">
          <label htmlFor="year" className="select-date-reports-label">Año:</label>
          <input
            id="year"
            type="number"
            min="2000"
            max={new Date().getFullYear()}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Ejemplo: 2024"
            required
            className="select-date-reports-input"
          />
        </div>

        <div className="select-date-reports-group">
          <button type="submit" className="select-date-reports-button">
            Generar Reporte
          </button>
        </div>

        <div className="select-date-reports-group">
          <button
            type="button"
            className="select-date-reports-back-button"
            onClick={handleGoBack}
          >
        Regresar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SelectDateForReports;
