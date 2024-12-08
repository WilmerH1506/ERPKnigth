import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUsers } from "../api/api.js"; 
import logo from "../assets/logo.jpg";
import "./Login.css";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
  
      const users = await getUsers();

      const user = users.find(
        (u) => u.Usuario === username && u.Password === password
      );

      if (user) {
        toast.success("Inicio de sesión exitoso", {
          position: "top-right",
          autoClose: 3000,
        });

        onLogin();
        setTimeout(() => navigate("/patients"), 100); 
      } else {
        toast.error("Usuario o contraseña incorrectos", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page-container">
      <header className="login-header">
        <div className="login-header-content">
          <h1 className="login-title">Clínica Dental Knight</h1>
          <img src={logo} alt="Logo" className="login-logo" />
        </div>
      </header>

      <main className="login-main">
        <div className="login-card">
          <img src={logo} alt="Logo" className="login-card-logo" />
          <h2 className="login-card-title">Bienvenido</h2>
          <p className="login-card-subtitle">Ingrese sus credenciales para acceder</p>
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="usuario" className="login-label">Usuario</label>
            <input
              type="text"
              id="usuario"
              className="login-input"
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label htmlFor="contraseña" className="login-label">Contraseña</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"} 
                id="contraseña"
                className="login-input"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="password-toggle-icon"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" className="login-button">Ingresar</button>
          </form>
        </div>
      </main>

      <ToastContainer />
    </div>
  );
};

export default LoginPage;
