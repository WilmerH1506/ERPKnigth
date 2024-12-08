import React, { useState } from "react";
import NavBar from "./NavBar";
import Patients from "./Patients";
import Dates from "./Dates";
import Inventory from "./Inventory";
import Reports from "./Reports";
import ReporteCitas from "../reports/PatientReport";
import ReporteCancelaciones from "../reports/DateCanceledReport";
import ReportesServicios from "../reports/RevenueReport";
import SelectDateForReports from "../reports/FormDate";
import SelectDateForReportsComplaints from "../reports/FormDateQuejas";
import ReporteQuejas from "../reports/ComplaintsReport";
import ReporteAbandono from "../reports/DropoutsReport";
import ReporteInventario from "../reports/InventoryReport";
import SelectDateForReportsGrowth from "../reports/FormDateNuevos";
import SelectDateForHoursReport from "../reports/FormDateHours";
import ReporteCrecimiento from "../reports/PatientsHistoricalReport";
import ReporteHorasLibres from "../reports/ReportHours";
import Footer from "./Footer";
import LoginPage from "./Login";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);  
  };

  return (
    <BrowserRouter>
      <div>
        {isAuthenticated && <NavBar onLogout={handleLogout} />} 
        <div className="content">
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Patients />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/login"
              element={<LoginPage onLogin={handleLogin} />}
            />
            <Route
              path="/patients"
              element={
                isAuthenticated ? <Patients /> : <LoginPage onLogin={handleLogin} />
              }
            />
            <Route
              path="/dates"
              element={
                isAuthenticated ? <Dates /> : <LoginPage onLogin={handleLogin} />
              }
            />
            <Route
              path="/inventory"
              element={
                isAuthenticated ? (
                  <Inventory />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/reports"
              element={
                isAuthenticated ? <Reports /> : <LoginPage onLogin={handleLogin} />
              }
            />
            <Route
              path="/reporte-citas/:id"
              element={
                isAuthenticated ? (
                  <ReporteCitas />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/reporte-cancelaciones"
              element={
                isAuthenticated ? (
                  <ReporteCancelaciones />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/seleccionar-fecha-reportes"
              element={
                isAuthenticated ? (
                  <SelectDateForReports />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/seleccionar-fecha-quejas"
              element={
                isAuthenticated ? (
                  <SelectDateForReportsComplaints />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/seleccionar-fecha-crecimiento"
              element={
                isAuthenticated ? (
                  <SelectDateForReportsGrowth />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/seleccionar-fecha-horas-libres"
              element={
                isAuthenticated ? (
                  <SelectDateForHoursReport />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/reporte-servicios/:date"
              element={
                isAuthenticated ? (
                  <ReportesServicios />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/reporte-quejas/:date"
              element={
                isAuthenticated ? (
                  <ReporteQuejas />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/reporte-abandono"
              element={
                isAuthenticated ? (
                  <ReporteAbandono />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/reporte-inventario"
              element={
                isAuthenticated ? (
                  <ReporteInventario />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/reporte-crecimiento/:date"
              element={
                isAuthenticated ? (
                  <ReporteCrecimiento />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/reporte-horas-libres/:date"
              element={
                isAuthenticated ? (
                  <ReporteHorasLibres />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
