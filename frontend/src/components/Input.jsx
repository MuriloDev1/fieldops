export default function Input({ label, value, onChange, placeholder, type = 'text', name, className = '' }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span>{label}</span> : null}
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}
