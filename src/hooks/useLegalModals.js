import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const useLegalModals = () => {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (type) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Contenus légaux
  const getLegalContent = (type) => {
    switch (type) {
      case 'privacy':
        return {
          title: t('footer.legal_privacy', 'Politique de Confidentialité'),
          content: (
            <div>
              <h3>1. Collecte des données</h3>
              <p>Nous collectons les données personnelles que vous nous fournissez volontairement lors de l'utilisation de nos services de marketing musical.</p>
              
              <h3>2. Utilisation des données</h3>
              <p>Vos données sont utilisées pour :</p>
              <ul>
                <li>Fournir et améliorer nos services de marketing</li>
                <li>Communiquer avec vous concernant nos services</li>
                <li>Analyser l'utilisation de notre plateforme</li>
                <li>Respecter nos obligations légales</li>
              </ul>
              
              <h3>3. Protection des données</h3>
              <p>Nous mettons en place des mesures de sécurité appropriées pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction.</p>
              
              <h3>4. Vos droits</h3>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul>
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement de vos données</li>
                <li>Droit à la portabilité de vos données</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
              
              <h3>5. Contact</h3>
              <p>Pour toute question concernant cette politique, contactez-nous à : <strong>contact@mdmcmusicads.com</strong></p>
            </div>
          )
        };
      
      case 'terms':
        return {
          title: t('footer.legal_terms', 'Conditions Générales'),
          content: (
            <div>
              <h3>1. Objet</h3>
              <p>Les présentes conditions générales régissent l'utilisation de nos services de marketing musical digital proposés par MDMC.</p>
              
              <h3>2. Acceptation des conditions</h3>
              <p>L'utilisation de nos services implique l'acceptation pleine et entière des présentes conditions générales.</p>
              
              <h3>3. Services proposés</h3>
              <p>Nous proposons des services de marketing digital pour artistes et labels, incluant :</p>
              <ul>
                <li>Campagnes publicitaires sur plateformes sociales</li>
                <li>Optimisation et ciblage d'audience</li>
                <li>Création et gestion de SmartLinks</li>
                <li>Analyse et reporting détaillé</li>
                <li>Conseil stratégique en marketing musical</li>
              </ul>
              
              <h3>4. Responsabilités du client</h3>
              <p>Le client s'engage à :</p>
              <ul>
                <li>Fournir des contenus conformes aux réglementations en vigueur</li>
                <li>Respecter les droits d'auteur et de propriété intellectuelle</li>
                <li>Fournir des informations exactes et à jour</li>
              </ul>
              
              <h3>5. Limitation de responsabilité</h3>
              <p>Notre responsabilité est limitée aux services directement fournis. Nous ne pouvons garantir des résultats spécifiques en termes de vues, streams ou ventes.</p>
              
              <h3>6. Propriété intellectuelle</h3>
              <p>Le client conserve tous les droits sur ses contenus musicaux. MDMC conserve les droits sur ses outils et méthodes de marketing.</p>
            </div>
          )
        };
      
      case 'mentions':
        return {
          title: t('footer.legal_mentions', 'Mentions Légales'),
          content: (
            <div>
              <h3>Éditeur du site</h3>
              <p>
                <strong>Raison sociale :</strong> MDMC OÜ<br />
                <strong>Forme juridique :</strong> Société à responsabilité limitée<br />
                <strong>Adresse :</strong> Harju maakond, Tallinn, Lasnamäe linnaosa, Sepapaja tn 6, 15551 Tallinn, Estonie<br />
                <strong>Numéro de TVA :</strong> EE102477612<br />
                <strong>Email :</strong> contact@mdmcmusicads.com
              </p>
              
              <h3>Directeur de publication</h3>
              <p>
                <strong>Nom :</strong> Denis Adam<br />
                <strong>Qualité :</strong> Gérant
              </p>
              
              <h3>Hébergement</h3>
              <p>
                <strong>Hébergeur :</strong> Railway<br />
                <strong>Site web :</strong> https://railway.app<br />
                <strong>Localisation :</strong> Serveurs basés en Europe (conformité RGPD)
              </p>
              
              <h3>Propriété intellectuelle</h3>
              <p>L'ensemble des contenus présents sur ce site (textes, images, vidéos, logos) sont protégés par le droit d'auteur et sont la propriété exclusive de MDMC OÜ, sauf mention contraire.</p>
              
              <h3>Cookies et données personnelles</h3>
              <p>Ce site utilise des cookies pour améliorer l'expérience utilisateur. Consultez notre politique de cookies pour plus d'informations.</p>
              
              <h3>Droit applicable</h3>
              <p>Le présent site est soumis au droit estonien. En cas de litige, les tribunaux estoniens seront seuls compétents.</p>
            </div>
          )
        };
      
      case 'cookies':
        return {
          title: t('footer.legal_cookies', 'Politique des Cookies'),
          content: (
            <div>
              <h3>Qu'est-ce qu'un cookie ?</h3>
              <p>Un cookie est un petit fichier texte stocké sur votre ordinateur, tablette ou smartphone lorsque vous visitez un site web. Il permet au site de mémoriser vos actions et préférences.</p>
              
              <h3>Types de cookies utilisés</h3>
              
              <h4>Cookies essentiels</h4>
              <p>Ces cookies sont nécessaires au fonctionnement du site. Ils permettent :</p>
              <ul>
                <li>La navigation sur le site</li>
                <li>L'utilisation des fonctionnalités essentielles</li>
                <li>La sécurisation des connexions</li>
              </ul>
              
              <h4>Cookies analytiques</h4>
              <p>Nous utilisons Google Analytics pour comprendre comment les visiteurs utilisent notre site :</p>
              <ul>
                <li>Pages les plus visitées</li>
                <li>Durée de visite</li>
                <li>Source de trafic</li>
                <li>Comportement de navigation</li>
              </ul>
              
              <h4>Cookies de préférence</h4>
              <p>Ces cookies mémorisent vos choix :</p>
              <ul>
                <li>Langue préférée</li>
                <li>Paramètres d'affichage</li>
                <li>Préférences utilisateur</li>
              </ul>
              
              <h3>Gestion des cookies</h3>
              <p>Vous pouvez contrôler et gérer les cookies de plusieurs façons :</p>
              
              <h4>Paramètres du navigateur</h4>
              <p>Tous les navigateurs permettent de :</p>
              <ul>
                <li>Voir quels cookies sont stockés</li>
                <li>Supprimer les cookies individuellement</li>
                <li>Bloquer les cookies de certains sites</li>
                <li>Bloquer tous les cookies tiers</li>
                <li>Effacer tous les cookies à la fermeture</li>
              </ul>
              
              <h4>Outils de désactivation</h4>
              <p>Pour Google Analytics : <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Désactiver Google Analytics</a></p>
              
              <h3>Conséquences de la désactivation</h3>
              <p>La désactivation de certains cookies peut affecter le fonctionnement du site et votre expérience utilisateur.</p>
            </div>
          )
        };
      
      default:
        return {
          title: 'Contenu non trouvé',
          content: <p>Le contenu demandé n'est pas disponible.</p>
        };
    }
  };

  return {
    activeModal,
    openModal,
    closeModal,
    getLegalContent
  };
};

export default useLegalModals;