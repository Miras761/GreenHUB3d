import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './UploadModel.css';

const UploadModel = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    license: 'CC0',
    tags: '',
    hasAnimation: false,
    model: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCategories();
  }, [isAuthenticated, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, model: files[0] });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.model) {
      setError('Пожалуйста, выберите файл модели');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('model', formData.model);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('license', formData.license);
      data.append('tags', formData.tags);
      data.append('hasAnimation', formData.hasAnimation);

      const response = await axios.post('/api/models', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Модель успешно загружена!');
      setTimeout(() => {
        navigate(`/model/${response.data._id}`);
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при загрузке модели');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="upload-model">
        <h1>Загрузить 3D модель</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label>Название модели *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={5000}
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>Категория *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Выберите категорию</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Лицензия *</label>
            <select
              name="license"
              value={formData.license}
              onChange={handleChange}
              required
            >
              <option value="CC0">CC0 - Public Domain</option>
              <option value="CC4">CC4 - Creative Commons 4.0</option>
              <option value="Attribution">Attribution - Требуется указание автора</option>
              <option value="Non-commercial">Non-commercial - Некоммерческое использование</option>
            </select>
          </div>

          <div className="form-group">
            <label>Теги (через запятую)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="3d, модель, персонаж"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="hasAnimation"
                checked={formData.hasAnimation}
                onChange={handleChange}
              />
              Модель содержит анимацию
            </label>
          </div>

          <div className="form-group">
            <label>Файл модели * (GLTF, GLB, FBX, OBJ, 3DS, DAE, BLEND)</label>
            <input
              type="file"
              name="model"
              onChange={handleChange}
              accept=".gltf,.glb,.fbx,.obj,.3ds,.dae,.blend"
              required
            />
            {formData.model && (
              <div className="file-info">
                Выбран: {formData.model.name} ({(formData.model.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Загрузить модель'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModel;
