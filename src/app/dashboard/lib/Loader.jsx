// Shared loader for the dashboard — logo mark + spinner ring + message.
// Used for full-page loads (session check, server data) and route loading.
export default function Loader({ text }) {
  return (
    <div className="mps-loader">
      <img src="/logo-mark.svg" alt="Modern Product Slider" />
      <span className="mps-spin" aria-hidden="true" />
      {text && <p>{text}</p>}
    </div>
  );
}

// Small inline spinner for buttons while an action is running.
export function BtnSpinner() {
  return <span className="btn-spin" aria-hidden="true" />;
}
