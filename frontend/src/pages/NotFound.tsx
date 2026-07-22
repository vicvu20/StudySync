import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#4F46E5' }}>404</h1>
      <h2>Oops! Page Not Found</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Looks like you took a wrong turn in StudySync.
      </p>
      <Link
        to="/"
        style={{
          backgroundColor: '#4F46E5',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 'bold',
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
};
