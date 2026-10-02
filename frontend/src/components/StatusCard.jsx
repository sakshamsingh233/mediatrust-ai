/**
 * StatusCard — connection/status row used on the dashboard.
 * Reused from the original dashboard; now theme-aware.
 */
export default function StatusCard({ label, detail, state }) {
  return (
    <section className={`status-card status-card--${state}`}>
      <span className={`status-dot status-dot--${state}`} aria-hidden="true" />
      <span className="status-card__label">{label}</span>
      <span className="status-card__detail">{detail}</span>
    </section>
  );
}
