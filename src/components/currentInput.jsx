import { formatNumberInput, parseFormattedNumber } from "../utils/formatNumber.js";

function CurrencyInput({
  value,
  onChange,
  placeholder,
  className,
  ...props
}) {
  const handleChange = (e) => {
    const raw = e?.target?.value ?? "";
    const formatted = formatNumberInput(raw);
    onChange?.(formatted === "" ? "" : parseFormattedNumber(formatted));
  };

  const displayValue = value === "" || value === null || value === undefined
    ? ""
    : formatNumberInput(value);

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9.]"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      className={className}
      {...props}
    />
  );
}

export default CurrencyInput;
