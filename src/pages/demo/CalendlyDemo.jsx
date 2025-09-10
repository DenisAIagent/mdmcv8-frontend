import React from 'react';
import CalendlyBookingSystem from '../../components/booking/CalendlyBookingSystem';

const CalendlyDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Démo Système de Réservation Calendly
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Testez notre nouveau système de réservation intégré avec Calendly. 
            Sélectionnez un expert et réservez directement via leur calendrier.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <CalendlyBookingSystem 
            displayMode="inline"
            onScheduled={(data) => {
              console.log('✅ Démo: RDV programmé', data);
              alert(`Réservation confirmée avec ${data.expert?.name} !`);
            }}
          />
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            Fonctionnalités du système :
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li>✅ Sélection d'expert simplifiée (layout minimal)</li>
            <li>✅ Intégration Calendly native avec react-calendly</li>
            <li>✅ Pré-remplissage automatique des informations</li>
            <li>✅ Tracking Analytics (GA4 + Facebook Pixel)</li>
            <li>✅ Support multilingue (FR/EN)</li>
            <li>✅ UTM tracking pour attribution</li>
            <li>✅ Callbacks pour webhooks personnalisés</li>
            <li>✅ Design responsive et accessible</li>
          </ul>
        </div>

        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            Configuration requise :
          </h3>
          <div className="text-yellow-800 space-y-2">
            <p><strong>URLs Calendly valides</strong> pour chaque expert dans ExpertSelector.jsx</p>
            <p><strong>Webhooks Calendly</strong> (optionnel) pour synchronisation CRM</p>
            <p><strong>Analytics configurés</strong> pour le tracking des conversions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendlyDemo;