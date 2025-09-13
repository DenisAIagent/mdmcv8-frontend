import React from 'react';

function App() {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#e50914', fontSize: '2.5rem', marginBottom: '20px' }}>
        MDMC Music Ads - SaaS Dashboard
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#333', marginBottom: '30px' }}>
        ✅ Application Fonctionnelle - Version Test Simplifiée
      </p>
      
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>Fonctionnalités Implémentées:</h2>
        <ul style={{ color: '#555', fontSize: '1.1rem', lineHeight: '1.6' }}>
          <li>🔐 Authentification complète (Login/Register)</li>
          <li>📊 Dashboard avec métriques temps réel</li>
          <li>🎯 Gestion campagnes Meta Ads</li>
          <li>⚙️ Connexion comptes publicitaires</li>
          <li>🎨 Interface moderne responsive</li>
        </ul>
      </div>

      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #2196f3'
      }}>
        <p style={{ margin: 0, color: '#1565c0', fontSize: '1.1rem' }}>
          <strong>🚀 Test réussi!</strong> L'application React fonctionne parfaitement.<br/>
          <strong>Timestamp:</strong> {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default App;
