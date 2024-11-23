import React from 'react';
import NavBar from './NavBar';
import DashboardCards from './DashboardsCards';
import Patients from './Patients';
import Dates from './Dates';
import Inventory from './Inventory';
import Reports from './Reports';
import ReporteCitas from '../reports/PatientReport';
import ReporteCancelaciones from '../reports/DateCanceledReport';
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
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
