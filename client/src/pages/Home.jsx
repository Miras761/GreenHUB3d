import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchModels();
    fetchCategories();
  }, [selectedCategory]);

  const fetchModels = async () => {
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await axios.get('/api/models', { params });
      setModels(response.data.models || []);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('/api/models', { 
        params: { search, category: selectedCategory } 
      });
      setModels(response.data.models || []);
    } catch (error) {
      console.error('Error searching models:', error);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Загрузка...</div></div>;
  }

  return (
    <div className="container">
      <div className="home-header">
        <h1>GreenHub3d</h1>
        <p>Платформа для обмена 3D моделями</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Поиск моделей..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">Поиск</button>
        </form>

        <div className="category-filter">
          <button
            className={`category-btn ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            Все
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              className={`category-btn ${selectedCategory === cat._id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="models-grid">
        {models.length === 0 ? (
          <div className="no-models">Модели не найдены</div>
        ) : (
          models.map(model => (
            <Link key={model._id} to={`/model/${model._id}`} className="model-card">
              <div className="model-thumbnail">
                {model.thumbnail ? (
                  <img src={model.thumbnail} alt={model.title} />
                ) : (
                  <div className="model-placeholder">3D</div>
                )}
              </div>
              <div className="model-info">
                <h3>{model.title}</h3>
                <p className="model-author">
                  {model.author?.username || 'Unknown'}
                </p>
                <div className="model-stats">
                  <span>👁 {model.views || 0}</span>
                  <span>❤️ {model.likes?.length || 0}</span>
                  <span>⬇️ {model.downloads || 0}</span>
                </div>
                <div className="model-license">{model.license}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
