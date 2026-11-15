import './digit-counter.css'

function Digits({ value }: { value: number }) {
  return (
    <span className="digit-counter__digits">
      {String(value)
        .padStart(2, '0')
        .split('')
        .map((digit, index) => (
          <span key={index} className="digit-counter__digit">
            <span
              className="digit-counter__reel"
              style={{ transform: `translateY(${-Number(digit) * 10}%)` }}
            >
              {'0123456789'.split('').map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ))}
    </span>
  )
}

/** "01 / 06": value é 1-based. Os dígitos rolam ao trocar. */
export default function DigitCounter({
  value,
  total,
  className = '',
}: {
  value: number
  total: number
  className?: string
}) {
  return (
    <span className={`digit-counter ${className}`.trim()} aria-hidden="true">
      <Digits value={value} />
      <span className="digit-counter__slash">/</span>
      <span>{String(total).padStart(2, '0')}</span>
    </span>
  )
}
