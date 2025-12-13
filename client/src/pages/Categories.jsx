import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Categories.css';

const Categories = () => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [categoryData, setCategoryData] = useState({ name: '', description: '', icon: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('Необходимо войти в систему для создания категории');
      return;
    }

    try {
      await axios.post('/api/categories', categoryData);
      setCategoryData({ name: '', description: '', icon: '' });
      setShowCreate(false);
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при создании категории');
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Загрузка...</div></div>;
  }

  return (
    <div className="container">
      <div className="categories-page">
        <div className="categories-header">
          <h1>Категории</h1>
          {isAuthenticated && (
            <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
              {showCreate ? 'Отмена' : '+ Создать категорию'}
            </button>
          )}
        </div>

        {showCreate && (
          <div className="create-category-card">
            <h2>Создать новую категорию</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название категории *</label>
                <input
                  type="text"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={categoryData.description}
                  onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                  maxLength={500}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Иконка (эмодзи или URL)</label>
                <input
                  type="text"
                  value={categoryData.icon}
                  onChange={(e) => setCategoryData({ ...categoryData, icon: e.target.value })}
                  placeholder="🎮 или URL изображения"
                />
              </div>
              <button type="submit" className="btn btn-primary">Создать</button>
            </form>
          </div>
        )}

        <div className="categories-grid">
          {categories.length === 0 ? (
            <div className="no-categories">Категории не найдены</div>
          ) : (
            categories.map(category => (
              <Link key={category._id} to={`/?category=${category._id}`} className="category-card">
                <div className="category-icon">
                  {category.icon || '📦'}
                </div>
                <h3>{category.name}</h3>
                {category.description && <p>{category.description}</p>}
                <div className="category-creator">
                  Создано: {category.createdBy?.username || 'Unknown'}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
