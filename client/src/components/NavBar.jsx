import React from 'react';
import { Link } from 'react-router-dom'; 
import { FaHome, FaUserFriends, FaCalendarAlt, FaBox } from 'react-icons/fa';
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
          <Link to="/" className="nav-button">
            <FaHome className="nav-icon" />
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/patients" className="nav-button">
            <FaUserFriends className="nav-icon" />
            Pacientes
          </Link>
        </li>
        <li>
          <Link to="/dates" className="nav-button">
            <FaCalendarAlt className="nav-icon" />
            Citas
          </Link>
        </li>
        <li>
          <Link to="/inventory" className="nav-button">
            <FaBox className="nav-icon" />
            Inventario
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
