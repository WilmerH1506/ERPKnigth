import React from 'react';
import { NavLink } from 'react-router-dom';  
import { FaHome, FaUserFriends, FaCalendarAlt, FaBox, FaBook, FaChartLine } from 'react-icons/fa';
import logo from '../assets/Logo.jpg';
import './NavBar.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="title">
        <span>Clinica Dental Knight</span>
        <img src={logo} alt="Logo" className="logo-clinica" />
      </div>
      <ul className="navbar-buttons">
        <li>
          <NavLink to="/" className="nav-button" activeClassName="active">
            <FaHome className="nav-icon" />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/patients" className="nav-button" activeClassName="active">
            <FaUserFriends className="nav-icon" />
            Pacientes
          </NavLink>
        </li>
        <li>
          <NavLink to="/dates" className="nav-button" activeClassName="active">
            <FaCalendarAlt className="nav-icon" />
            Citas
          </NavLink>
        </li>
        <li>
          <NavLink to="/inventory" className="nav-button" activeClassName="active">
            <FaBox className="nav-icon" />
            Inventario
          </NavLink>
        </li>
        <li>
          <NavLink to="/reports" className="nav-button" activeClassName="active">
            <FaChartLine className="nav-icon" />
            Reportes
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
