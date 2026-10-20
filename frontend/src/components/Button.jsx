export default function Button({ children, variant = 'primary', size = 'md', icon, onClick, type = 'button', className = '', disabled = false }) {
  const variants = {
    primary: 'button button-primary',
    secondary: 'button button-secondary',
    ghost: 'button button-ghost',
    danger: 'button button-danger',
    success: 'button button-success',
  };

  const sizes = {
    sm: 'button-sm',
    md: 'button-md',
    lg: 'button-lg',
  };

  return (
    <button type={type} className={`${variants[variant]} ${sizes[size]} ${className}`.trim()} onClick={onClick} disabled={disabled}>
      {icon ? <span className="button-icon">{icon}</span> : null}
      {children}
    </button>
  );
}
