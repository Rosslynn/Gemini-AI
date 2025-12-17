
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'danger';
  size?: 'sm' | 'md' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading,
  disabled,
  type = 'button', // Default seguro para evitar submit accidental en formularios
  ...props 
}) => {
  
  // Estilos base seguros
  const baseStyles: React.CSSProperties = {
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid transparent',
    fontFamily: 'inherit',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    borderRadius: '6px',
    position: 'relative',
    overflow: 'hidden',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--primary)', color: 'var(--primary-fg)' },
    secondary: { backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border)' },
    ghost: { backgroundColor: 'transparent', color: 'var(--text-muted)' },
    icon: { backgroundColor: 'transparent', color: 'var(--text-muted)', padding: '4px' },
    danger: { backgroundColor: '#ef4444', color: '#fff' }
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { fontSize: '12px', padding: '4px 10px', height: '28px' },
    md: { fontSize: '13px', padding: '6px 16px', height: '36px' },
    icon: { padding: '6px', width: '32px', height: '32px' }
  };

  const computedStyle = { ...baseStyles, ...variantStyles[variant], ...sizeStyles[size] };

  return (
    <button 
      type={type}
      style={computedStyle}
      className={className}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      {...props}
      onMouseEnter={(e) => {
          if (!disabled && !isLoading && variant !== 'primary' && variant !== 'danger') {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-main)';
          }
      }}
      onMouseLeave={(e) => {
          if (!disabled && !isLoading && variant !== 'primary' && variant !== 'danger') {
              e.currentTarget.style.backgroundColor = variantStyles[variant].backgroundColor as string;
              e.currentTarget.style.color = variantStyles[variant].color as string;
          }
      }}
    >
      {isLoading ? <span className="spinner">...</span> : children}
    </button>
  );
};
