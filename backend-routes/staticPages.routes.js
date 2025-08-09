// backend-routes/staticPages.routes.js
// Routes pour la gestion des pages statiques

const express = require('express');
const router = express.Router();
const {
  generateStaticPage,
  regenerateAllPages,
  deleteStaticPage
} = require('../backend-endpoints/staticPages');

// POST /api/v1/static-pages/generate
// Génère une page statique pour un SmartLink
router.post('/generate', generateStaticPage);

// POST /api/v1/static-pages/regenerate-all
// Régénère toutes les pages statiques
router.post('/regenerate-all', regenerateAllPages);

// DELETE /api/v1/static-pages/:shortId
// Supprime une page statique
router.delete('/:shortId', deleteStaticPage);

module.exports = router;