import React from 'react';
import NavBar from './NavBar';
import DashboardCards from './DashboardsCards';
import Patients from './Patients';
import Dates from './Dates';
import Inventory from './Inventory';
import Reports from './Reports';
import ReporteCitas from '../reports/PatientReport';
import ReporteCancelaciones from '../reports/DateCanceledReport';
import ReportesServicios from '../reports/RevenueReport';
import SelectDateForReports from '../reports/FormDate';
import SelectDateForReportsComplaints from '../reports/FormDateQuejas';
import ReporteQuejas from '../reports/ComplaintsReport';
import ReporteAbandono from '../reports/DropoutsReport';
import ReporteInventario from '../reports/InventoryReport';
import SelectDateForReportsGrowth from '../reports/FormDateNuevos';
import SelectDateForHoursReport from '../reports/FormDateHours';
import ReporteCrecimiento from '../reports/PatientsHistoricalReport';
import ReporteHorasLibres from '../reports/ReportHours';
import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <div>
        <NavBar />
        <div className="content">
          <Routes>
            <Route path="/" element={<DashboardCards />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/dates" element={<Dates />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reporte-citas/:id" element={<ReporteCitas />} />
            <Route path="/reporte-cancelaciones" element={<ReporteCancelaciones />} />
            <Route path="/seleccionar-fecha-reportes" element={<SelectDateForReports />} />
            <Route path="/seleccionar-fecha-quejas" element={<SelectDateForReportsComplaints />} />
            <Route path="/seleccionar-fecha-crecimiento" element={<SelectDateForReportsGrowth />} />
            <Route path="/seleccionar-fecha-horas-libres" element={<SelectDateForHoursReport />} />
            <Route path="/reporte-servicios/:date" element={<ReportesServicios />} />
            <Route path="/reporte-quejas/:date" element={<ReporteQuejas />} />
            <Route path="/reporte-abandono" element={<ReporteAbandono />} />
            <Route path="/reporte-inventario" element={<ReporteInventario />} />
            <Route path="/reporte-crecimiento/:date" element={<ReporteCrecimiento />} />
            <Route path="/reporte-horas-libres/:date" element={<ReporteHorasLibres />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
