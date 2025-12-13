import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ModelViewer from '../components/ModelViewer';
import './ModelDetail.css';

const ModelDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchModel();
  }, [id]);

  const fetchModel = async () => {
    try {
      const response = await axios.get(`/api/models/${id}`);
      setModel(response.data);
      setIsLiked(response.data.likes?.some(like => 
        typeof like === 'object' ? like._id === user?._id : like === user?._id
      ) || false);
    } catch (error) {
      console.error('Error fetching model:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isLiked) {
        await axios.post(`/api/models/${id}/unlike`);
        setIsLiked(false);
        setModel({ ...model, likes: model.likes.filter(l => 
          (typeof l === 'object' ? l._id : l) !== user._id
        )});
      } else {
        await axios.post(`/api/models/${id}/like`);
        setIsLiked(true);
        setModel({ ...model, likes: [...model.likes, user._id] });
      }
    } catch (error) {
      console.error('Error liking model:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Already liked')) {
        setIsLiked(true);
      }
    }
  };

  const handleDownload = () => {
    window.open(`/api/models/${id}/download`, '_blank');
  };

  if (loading) {
    return <div className="container"><div className="loading">Загрузка...</div></div>;
  }

  if (!model) {
    return <div className="container"><div className="error">Модель не найдена</div></div>;
  }

  return (
    <div className="container">
      <div className="model-detail">
        <div className="model-viewer-section">
          <ModelViewer 
            fileUrl={model.fileUrl} 
            hasAnimation={model.hasAnimation}
            fileFormat={model.fileFormat}
          />
        </div>

        <div className="model-info-section">
          <h1>{model.title}</h1>
          
          <div className="model-author-info">
            <Link to={`/profile/${model.author._id}`} className="author-link">
              <div className="author-avatar">
                {model.author.avatar ? (
                  <img src={model.author.avatar} alt={model.author.username} />
                ) : (
                  <div className="avatar-placeholder">{model.author.username[0]?.toUpperCase()}</div>
                )}
              </div>
              <span>{model.author.username}</span>
            </Link>
          </div>

          {model.description && (
            <div className="model-description">
              <h3>Описание</h3>
              <p>{model.description}</p>
            </div>
          )}

          <div className="model-meta">
            <div className="meta-item">
              <strong>Категория:</strong> {model.category?.name}
            </div>
            <div className="meta-item">
              <strong>Лицензия:</strong> {model.license}
            </div>
            <div className="meta-item">
              <strong>Формат:</strong> {model.fileFormat}
            </div>
            <div className="meta-item">
              <strong>Размер:</strong> {(model.fileSize / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          {model.tags && model.tags.length > 0 && (
            <div className="model-tags">
              {model.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}

          <div className="model-stats">
            <div className="stat-item">
              <span className="stat-value">{model.views || 0}</span>
              <span className="stat-label">Просмотров</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{model.likes?.length || 0}</span>
              <span className="stat-label">Лайков</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{model.downloads || 0}</span>
              <span className="stat-label">Скачиваний</span>
            </div>
          </div>

          <div className="model-actions">
            <button
              onClick={handleLike}
              className={`btn ${isLiked ? 'btn-liked' : 'btn-primary'}`}
            >
              {isLiked ? '❤️ Лайкнуто' : '🤍 Лайк'}
            </button>
            <button onClick={handleDownload} className="btn btn-secondary">
              ⬇️ Скачать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetail;
