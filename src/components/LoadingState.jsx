export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="loading-state">
      <span className="loader" />
      <p>{label}</p>
    </div>
  );
}
