import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Breadcrumbs = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  const pathnames = location.pathname.split('/').filter(x => x);
  
  const breadcrumbNames = {
    'services': t('nav.services'),
    'youtube-ads': 'YouTube Ads',
    'meta-ads': 'Meta Ads', 
    'tiktok-ads': 'TikTok Ads',
    'a-propos': t('nav.about'),
    'contact': t('nav.contact'),
    'articles': t('nav.articles')
  };

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <div className="breadcrumbs-container">
        <ol itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/" itemProp="item">
              <span itemProp="name">Accueil</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          {pathnames.map((pathname, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            
            return (
              <li key={pathname} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                {isLast ? (
                  <span itemProp="name" aria-current="page">
                    {breadcrumbNames[pathname] || pathname}
                  </span>
                ) : (
                  <Link to={routeTo} itemProp="item">
                    <span itemProp="name">{breadcrumbNames[pathname] || pathname}</span>
                  </Link>
                )}
                <meta itemProp="position" content={index + 2} />
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;

