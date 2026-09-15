export default function Select({ label, value, onChange, options, name, className = '', placeholder = 'Selecione' }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span>{label}</span> : null}
      <select name={name} value={value} onChange={onChange}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
