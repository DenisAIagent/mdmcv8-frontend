import React, { useState, useEffect, useRef } from 'react';

// Design Tokens
const DESIGN_TOKENS = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px'
  },
  colors: {
    primary: '#cc271a',
    primaryLight: '#e63946',
    primaryDark: '#a91f15',
    white: '#ffffff',
    black: '#0a0a0a',
    gray: {
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    mdmc: '0 10px 30px rgba(204, 39, 26, 0.3)'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Poppins', 'system-ui', 'sans-serif']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    }
  }
};

// Button Component avec micro-interactions
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  onClick,
  className = '',
  ariaLabel,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled || loading) return;

    // Effet ripple
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Nettoyer après animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  const baseStyles = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50px',
    border: 'none',
    fontFamily: DESIGN_TOKENS.typography.fontFamily.display.join(', '),
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    outline: 'none',
    textDecoration: 'none'
  };

  const variants = {
    primary: {
      backgroundColor: loading || disabled ? '#666' : DESIGN_TOKENS.colors.primary,
      color: DESIGN_TOKENS.colors.white,
      transform: isPressed ? 'scale(0.98)' : 'scale(1)'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: DESIGN_TOKENS.colors.white,
      border: `2px solid ${DESIGN_TOKENS.colors.white}`,
      transform: isPressed ? 'scale(0.98)' : 'scale(1)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: DESIGN_TOKENS.colors.primary,
      transform: isPressed ? 'scale(0.98)' : 'scale(1)'
    }
  };

  const sizes = {
    sm: {
      padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md}`,
      fontSize: DESIGN_TOKENS.typography.fontSize.sm,
      minHeight: '36px'
    },
    md: {
      padding: `${DESIGN_TOKENS.spacing.md} ${DESIGN_TOKENS.spacing.lg}`,
      fontSize: DESIGN_TOKENS.typography.fontSize.base,
      minHeight: '48px'
    },
    lg: {
      padding: `${DESIGN_TOKENS.spacing.lg} ${DESIGN_TOKENS.spacing.xl}`,
      fontSize: DESIGN_TOKENS.typography.fontSize.lg,
      minHeight: '56px'
    }
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        opacity: disabled ? 0.6 : 1
      }}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      aria-label={ariaLabel}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            animation: 'ripple 0.6s linear',
            pointerEvents: 'none'
          }}
        />
      ))}
      
      {/* Loading spinner */}
      {loading && (
        <span
          style={{
            position: 'absolute',
            width: 20,
            height: 20,
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}
      
      {/* Content */}
      <span style={{ opacity: loading ? 0 : 1 }}>
        {children}
      </span>

      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: ${DESIGN_TOKENS.shadows.mdmc};
        }

        .btn:focus-visible {
          outline: 3px solid ${DESIGN_TOKENS.colors.primary};
          outline-offset: 2px;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: ${DESIGN_TOKENS.colors.white};
          color: ${DESIGN_TOKENS.colors.black};
        }

        .btn-ghost:hover:not(:disabled) {
          background-color: rgba(204, 39, 26, 0.1);
        }
      `}</style>
    </button>
  );
};

// Card Component avec animations
const Card = ({ 
  children, 
  className = '', 
  hoverable = false, 
  clickable = false,
  onClick,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  // Intersection Observer pour animation d'entrée
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const cardStyles = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.lg,
    transition: 'all 0.3s ease',
    transform: isVisible 
      ? isHovered && hoverable 
        ? 'translateY(-8px) scale(1.02)' 
        : 'translateY(0)' 
      : 'translateY(20px)',
    opacity: isVisible ? 1 : 0,
    cursor: clickable ? 'pointer' : 'default',
    boxShadow: isHovered && hoverable 
      ? DESIGN_TOKENS.shadows.lg 
      : DESIGN_TOKENS.shadows.sm
  };

  return (
    <div
      ref={cardRef}
      style={cardStyles}
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ 
  testimonial = {}, 
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <Card className={`testimonial-card loading ${className}`}>
        <div className="testimonial-skeleton">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-line medium"></div>
          </div>
        </div>

        <style jsx>{`
          .testimonial-skeleton {
            display: flex;
            gap: ${DESIGN_TOKENS.spacing.md};
            align-items: flex-start;
          }

          .skeleton-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: ${DESIGN_TOKENS.spacing.sm};
          }

          .skeleton-line {
            height: 16px;
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-line.short { width: 60%; }
          .skeleton-line.medium { width: 80%; }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </Card>
    );
  }

  const { name, company, text, rating = 5, avatar } = testimonial;

  return (
    <Card hoverable className={`testimonial-card ${className}`}>
      <div className="testimonial-header">
        {avatar ? (
          <img 
            src={avatar} 
            alt={`Avatar de ${name}`}
            className="testimonial-avatar"
          />
        ) : (
          <div className="testimonial-avatar-placeholder">
            {name?.charAt(0) || '?'}
          </div>
        )}
        
        <div className="testimonial-info">
          <h4 className="testimonial-name">{name || 'Client anonyme'}</h4>
          {company && <p className="testimonial-company">{company}</p>}
          
          <div className="testimonial-rating" aria-label={`Note: ${rating} sur 5 étoiles`}>
            {[...Array(5)].map((_, i) => (
              <span 
                key={i} 
                className={`star ${i < rating ? 'filled' : ''}`}
                aria-hidden="true"
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {text && (
        <blockquote className="testimonial-text">
          "{text}"
        </blockquote>
      )}

      <style jsx>{`
        .testimonial-header {
          display: flex;
          gap: ${DESIGN_TOKENS.spacing.md};
          align-items: flex-start;
          margin-bottom: ${DESIGN_TOKENS.spacing.md};
        }

        .testimonial-avatar,
        .testimonial-avatar-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .testimonial-avatar-placeholder {
          background: linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary}, ${DESIGN_TOKENS.colors.primaryLight});
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: ${DESIGN_TOKENS.typography.fontSize.xl};
        }

        .testimonial-info {
          flex: 1;
        }

        .testimonial-name {
          margin: 0 0 ${DESIGN_TOKENS.spacing.xs} 0;
          font-size: ${DESIGN_TOKENS.typography.fontSize.lg};
          font-weight: 600;
          color: ${DESIGN_TOKENS.colors.white};
        }

        .testimonial-company {
          margin: 0 0 ${DESIGN_TOKENS.spacing.sm} 0;
          font-size: ${DESIGN_TOKENS.typography.fontSize.sm};
          color: ${DESIGN_TOKENS.colors.primary};
        }

        .testimonial-rating {
          display: flex;
          gap: 2px;
        }

        .star {
          color: #666;
          transition: color 0.2s ease;
        }

        .star.filled {
          color: #ffd700;
        }

        .testimonial-text {
          margin: 0;
          font-style: italic;
          line-height: 1.6;
          color: ${DESIGN_TOKENS.colors.gray[300]};
          border-left: 3px solid ${DESIGN_TOKENS.colors.primary};
          padding-left: ${DESIGN_TOKENS.spacing.md};
        }
      `}</style>
    </Card>
  );
};

// Section avec animation d'entrée
const AnimatedSection = ({ children, className = '', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <section
      ref={sectionRef}
      className={`animated-section ${isVisible ? 'visible' : ''} ${className}`}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.8s ease'
      }}
    >
      {children}
    </section>
  );
};

export { Button, Card, TestimonialCard, AnimatedSection, DESIGN_TOKENS };
