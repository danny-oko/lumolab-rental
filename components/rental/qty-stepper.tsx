type QtyStepperProps = {
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

export function QtyStepper({ value, max, disabled, onChange }: QtyStepperProps) {
  return (
    <div className="qty-stepper">
      <button
        type="button"
        className="btn sm ghost qty-stepper__btn"
        disabled={value <= 0}
        onClick={() => onChange(value - 1)}
        aria-label="Багасгах"
      >
        −
      </button>
      <input
        type="number"
        className="num qty-stepper__input"
        min={0}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(+e.target.value)}
        aria-label="Тоо"
      />
      <button
        type="button"
        className="btn sm ghost qty-stepper__btn"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        aria-label="Нэмэх"
      >
        +
      </button>
    </div>
  );
}
