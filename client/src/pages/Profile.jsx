import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', bio: '', avatar: '' });

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    fetchUser();
    fetchUserModels();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/users/${id}`);
      setUser(response.data);
      setEditData({
        username: response.data.username,
        bio: response.data.bio || '',
        avatar: response.data.avatar || ''
      });
      setIsFollowing(response.data.followers?.some(f => 
        (typeof f === 'object' ? f._id : f) === currentUser?._id
      ) || false);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserModels = async () => {
    try {
      const response = await axios.get('/api/models');
      const userModels = response.data.models.filter(m => m.author._id === id);
      setModels(userModels);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.post(`/api/users/${id}/unfollow`);
        setIsFollowing(false);
      } else {
        await axios.post(`/api/users/${id}/follow`);
        setIsFollowing(true);
      }
      fetchUser();
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/users/${id}`, editData);
      setEditing(false);
      fetchUser();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Загрузка...</div></div>;
  }

  if (!user) {
    return <div className="container"><div className="error">Пользователь не найден</div></div>;
  }

  return (
    <div className="container">
      <div className="profile">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <div className="avatar-placeholder-large">
                {user.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            {editing ? (
              <>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="edit-input"
                />
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="edit-textarea"
                  placeholder="О себе..."
                  maxLength={500}
                />
                <input
                  type="text"
                  value={editData.avatar}
                  onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                  className="edit-input"
                  placeholder="URL аватара"
                />
                <div className="edit-actions">
                  <button onClick={handleSave} className="btn btn-primary">Сохранить</button>
                  <button onClick={() => setEditing(false)} className="btn btn-secondary">Отмена</button>
                </div>
              </>
            ) : (
              <>
                <h1>{user.username}</h1>
                {user.bio && <p className="profile-bio">{user.bio}</p>}
                {isOwnProfile && (
                  <button onClick={() => setEditing(true)} className="btn btn-primary">
                    Редактировать профиль
                  </button>
                )}
                {!isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {isFollowing ? 'Отписаться' : 'Подписаться'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{models.length}</span>
            <span className="stat-label">Моделей</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.followers?.length || 0}</span>
            <span className="stat-label">Подписчиков</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.following?.length || 0}</span>
            <span className="stat-label">Подписок</span>
          </div>
        </div>

        <div className="profile-models">
          <h2>Модели пользователя</h2>
          {models.length === 0 ? (
            <div className="no-models">У пользователя пока нет моделей</div>
          ) : (
            <div className="models-grid">
              {models.map(model => (
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
                    <div className="model-stats-small">
                      <span>👁 {model.views || 0}</span>
                      <span>❤️ {model.likes?.length || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
