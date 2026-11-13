function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly = false
}) {
  return <label className="form-field">
      {label}
      <input
    type={type}
    value={value}
    placeholder={placeholder}
    readOnly={readOnly}
    onChange={(e) => onChange?.(e.target.value)}
  />
    </label>;
}
export {
  Field
};
