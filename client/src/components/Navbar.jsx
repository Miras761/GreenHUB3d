import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          GreenHub3d
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Главная</Link>
          <Link to="/categories" className="navbar-link">Категории</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/upload" className="navbar-link">Загрузить</Link>
              <Link to={`/profile/${user?._id}`} className="navbar-link">
                Профиль
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                Выход
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Вход</Link>
              <Link to="/register" className="btn btn-primary">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
