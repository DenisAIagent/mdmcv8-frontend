const express = require('express');
const router = express.Router();

// Route de debug temporaire pour éviter la boucle
router.get('/dashboard-temp', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Debug Dashboard | MDMC SmartLinks</title>
      <style>
        body { 
          font-family: 'Inter', sans-serif; 
          background: #0a0a0a; 
          color: #fff; 
          padding: 2rem; 
        }
        .debug-container {
          max-width: 800px;
          margin: 0 auto;
          background: #111;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        h1 { color: #E50914; }
        .debug-info {
          background: #1a1a1a;
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          font-family: monospace;
        }
        .btn {
          background: #E50914;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin: 10px;
          text-decoration: none;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="debug-container">
        <h1>🔧 Dashboard Debug - MDMC SmartLinks</h1>
        
        <div class="debug-info">
          <strong>Statut:</strong> Accès temporaire sans authentification<br>
          <strong>Problème:</strong> Boucle de redirection sur /dashboard<br>
          <strong>Solution:</strong> Diagnostic en cours...
        </div>
        
        <h2>Actions disponibles :</h2>
        <a href="/login" class="btn">🔑 Page de connexion</a>
        <a href="/dashboard/create" class="btn">➕ Créer SmartLink</a>
        <a href="/api/auth/status" class="btn">🔍 Vérifier Auth API</a>
        
        <h2>Diagnostic :</h2>
        <div class="debug-info">
          <strong>Cookies reçus:</strong><br>
          <pre id="cookies">Chargement...</pre>
          
          <strong>LocalStorage:</strong><br>
          <pre id="localStorage">Chargement...</pre>
        </div>
        
        <script>
          // Affichage des cookies
          document.getElementById('cookies').textContent = document.cookie || 'Aucun cookie';
          
          // Affichage du localStorage
          const token = localStorage.getItem('mdmc_token');
          const user = localStorage.getItem('mdmc_user');
          document.getElementById('localStorage').textContent = 
            'Token: ' + (token ? 'Présent (' + token.substring(0, 20) + '...)' : 'Absent') + '\\n' +
            'User: ' + (user || 'Absent');
            
          // Test de l'API
          async function testAuth() {
            try {
              const response = await fetch('/api/auth/verify', {
                method: 'GET',
                headers: {
                  'Authorization': 'Bearer ' + token
                }
              });
              console.log('Test API auth:', response.status, await response.text());
            } catch (error) {
              console.error('Erreur test auth:', error);
            }
          }
          
          if (token) testAuth();
        </script>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;