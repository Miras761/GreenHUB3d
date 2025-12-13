import React, { useRef, useEffect, Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, useAnimations } from '@react-three/drei';
import './ModelViewer.css';

function Model({ url, hasAnimation, setLoading }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    setLoading(false);
  }, [scene, setLoading]);

  useEffect(() => {
    if (hasAnimation && animations.length > 0 && actions) {
      const action = Object.values(actions)[0];
      if (action) {
        action.play();
      }
    }
  }, [animations, actions, hasAnimation]);

  return (
    <primitive ref={group} object={scene} scale={1} />
  );
}

const ModelViewer = ({ fileUrl, hasAnimation = false, fileFormat }) => {
  const [loading, setLoading] = useState(true);
  
  const fullUrl = fileUrl.startsWith('http') 
    ? fileUrl 
    : `${window.location.origin}${fileUrl}`;

  // Only GLTF/GLB files are supported for web viewing
  const isSupported = fileFormat?.toLowerCase() === 'gltf' || 
                      fileFormat?.toLowerCase() === 'glb' ||
                      fileUrl.toLowerCase().endsWith('.gltf') ||
                      fileUrl.toLowerCase().endsWith('.glb');

  if (!isSupported) {
    return (
      <div className="model-viewer-container model-viewer-unsupported">
        <div className="unsupported-message">
          <p>Предварительный просмотр доступен только для GLTF/GLB файлов</p>
          <p>Этот формат ({fileFormat}) можно скачать, но просмотр недоступен</p>
        </div>
      </div>
    );
  }

  return (
    <div className="model-viewer-container">
      {loading && (
        <div className="model-viewer-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка модели...</p>
        </div>
      )}
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          <Model 
            url={fullUrl} 
            hasAnimation={hasAnimation}
            setLoading={setLoading}
          />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={20}
          />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ModelViewer;
