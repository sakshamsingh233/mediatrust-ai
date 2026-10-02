/**
 * StatusBadge — small pill for states like PROCESSING / SUCCESS / ERROR.
 */
const TONES = {
  neutral: 'badge badge--neutral',
  processing: 'badge badge--processing',
  success: 'badge badge--success',
  error: 'badge badge--error',
};

export default function StatusBadge({ tone = 'neutral', children }) {
  return <span className={TONES[tone] || TONES.neutral}>{children}</span>;
}
