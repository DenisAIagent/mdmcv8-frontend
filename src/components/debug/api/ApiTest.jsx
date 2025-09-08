// src/components/debug/ApiTest.jsx - Composant de test API

import React, { useState } from 'react';
import apiService from '../../services/api.service';
import API_CONFIG from '../../config/api.config';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results = {};

    // Test 1: Configuration API
    console.log('🔍 Test 1: Configuration API');
    results.config = {
      baseURL: API_CONFIG.BASE_URL,
      environment: process.env.NODE_ENV,
      frontendURL: window.location.origin
    };

    // Test 2: Ping API général
    console.log('🔍 Test 2: Ping API général');
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/api`);
      const data = await response.json();
      results.ping = { success: true, data, status: response.status };
      console.log('✅ API Ping réussi:', data);
    } catch (error) {
      results.ping = { success: false, error: error.message };
      console.error('❌ API Ping échoué:', error);
    }

    // Test 3: Test Reviews API
    console.log('🔍 Test 3: Test Reviews API');
    try {
      const reviewsResponse = await apiService.reviews.getReviews({ status: 'approved' });
      results.reviews = { success: true, data: reviewsResponse };
      console.log('✅ Reviews API réussi:', reviewsResponse);
    } catch (error) {
      results.reviews = { success: false, error: error.message };
      console.error('❌ Reviews API échoué:', error);
    }

    // Test 4: Test CORS direct
    console.log('🔍 Test 4: Test CORS direct');
    try {
      const corsResponse = await fetch(`${API_CONFIG.BASE_URL}/reviews?status=approved`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (corsResponse.ok) {
        const corsData = await corsResponse.json();
        results.cors = { success: true, data: corsData, status: corsResponse.status };
        console.log('✅ CORS Test réussi:', corsData);
      } else {
        results.cors = { success: false, error: `HTTP ${corsResponse.status}`, status: corsResponse.status };
        console.error('❌ CORS Test échoué - Status:', corsResponse.status);
      }
    } catch (error) {
      results.cors = { success: false, error: error.message };
      console.error('❌ CORS Test échoué:', error);
    }

    setTestResults(results);
    setIsLoading(false);

    // Afficher le résumé
    console.log('📊 Résumé des tests:', results);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #ff3a3a', 
      borderRadius: '8px', 
      padding: '16px', 
      zIndex: 999999,
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <h3 style={{ color: '#ff3a3a', margin: '0 0 12px 0' }}>🔧 Debug API</h3>
      
      <button 
        onClick={runTests} 
        disabled={isLoading}
        style={{
          background: '#ff3a3a',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1
        }}
      >
        {isLoading ? 'Test en cours...' : 'Tester l\'API'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div style={{ marginTop: '12px', fontSize: '12px' }}>
          <strong>Résultats:</strong>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '8px', 
            borderRadius: '4px', 
            overflow: 'auto',
            maxHeight: '200px',
            fontSize: '11px'
          }}>
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
        <div><strong>Backend:</strong> {API_CONFIG.BASE_URL}</div>
        <div><strong>Frontend:</strong> {window.location.origin}</div>
      </div>
    </div>
  );
};

export default ApiTest;
