/**
 * 🧪 Page de test simple - Test des routes
 */

import React from 'react';

const TestPage = () => {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#0a0a0a', color: 'white', minHeight: '100vh' }}>
      <h1>🧪 TEST PAGE WORKS!</h1>
      <p>Si vous voyez cette page, les routes fonctionnent correctement.</p>
      <p>URL: {window.location.pathname}</p>
    </div>
  );
};

export default TestPage;