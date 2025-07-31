import { useTranslation } from 'react-i18next';
import { FaYoutube, FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import '../../assets/styles/services.css';

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      id: 'youtube',
      icon: <FaYoutube />,
      title: t('services.youtube.title', 'YouTube Ads'),
      description: t('services.youtube.description', 'Campagnes publicitaires ciblées pour maximiser vos vues et votre engagement.')
    },
    {
      id: 'meta',
      icon: <div className="meta-icons"><FaFacebookF /><FaInstagram /></div>,
      title: t('services.meta.title', 'Meta Ads'),
      description: t('services.meta.description', 'Facebook et Instagram : touchez votre audience où elle se trouve.')
    },
    {
      id: 'tiktok',
      icon: <FaTiktok />,
      title: t('services.tiktok.title', 'TikTok Ads'),
      description: t('services.tiktok.description', 'La plateforme qui fait exploser les tendances musicales.')
    }
  ];

  return (
    <section id="services" className="services">
      <div className="container">
        <h2 className="section-title">{t('services.title', 'Nos Services')}</h2>
        <p className="section-subtitle">{t('services.subtitle', 'Des solutions publicitaires adaptées à chaque plateforme')}</p>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

