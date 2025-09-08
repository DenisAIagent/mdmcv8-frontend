/**
 * 🧪 Validation du contenu - Étape 2
 * Test que tout le contenu textuel exact est bien intégré
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

const TestContentValidation = () => {
  const { t } = useTranslation();

  const validationTests = [
    {
      name: "FAQ - Question 1",
      test: () => t('faq.answer_1_p1').includes('ancien salarié de Google'),
      expected: "Contient 'ancien salarié de Google'"
    },
    {
      name: "FAQ - Email dans texte",
      test: () => t('faq.answer_1_p1').includes('contact@mdmcmusicads.com') || t('privacy.rights_text').includes('privacy@mdmcmusicads.com'),
      expected: "Emails présents dans le contenu"
    },
    {
      name: "Mentions légales - MDMC OÜ",
      test: () => t('mentions.vat').includes('EE102477612'),
      expected: "Numéro TVA estonien présent"
    },
    {
      name: "Privacy - RGPD",
      test: () => t('privacy.storage_text').includes('RGPD'),
      expected: "Référence RGPD présente"
    },
    {
      name: "Cookies - 13 mois",
      test: () => t('cookies.duration_text').includes('13 mois'),
      expected: "Durée des cookies correcte"
    },
    {
      name: "CGU - Estonie",
      test: () => t('cgu.article_9_text').includes('Estonie'),
      expected: "Juridiction Estonie mentionnée"
    }
  ];

  return (
    <div style={{ padding: '2rem', backgroundColor: '#0a0a0a', color: 'white', minHeight: '100vh' }}>
      <h1>🧪 Validation Contenu - ÉTAPE 2</h1>
      <p>Vérification que tout le contenu textuel exact est intégré</p>
      
      <div style={{ marginTop: '2rem' }}>
        {validationTests.map((test, index) => {
          const result = test.test();
          return (
            <div key={index} style={{ 
              padding: '1rem', 
              margin: '1rem 0', 
              backgroundColor: result ? '#1a5a1a' : '#5a1a1a',
              borderRadius: '8px',
              border: `2px solid ${result ? '#4CAF50' : '#f44336'}`
            }}>
              <h3>{result ? '✅' : '❌'} {test.name}</h3>
              <p><strong>Attendu:</strong> {test.expected}</p>
              <p><strong>Résultat:</strong> {result ? 'PASS' : 'FAIL'}</p>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
        <h2>📋 Statut ÉTAPE 2</h2>
        <p>
          {validationTests.every(test => test.test()) 
            ? '✅ ÉTAPE 2 COMPLÈTE - Tout le contenu textuel est correctement intégré'
            : '⚠️ ÉTAPE 2 EN COURS - Quelques ajustements nécessaires'
          }
        </p>
      </div>
    </div>
  );
};

export default TestContentValidation;