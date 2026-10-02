export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <strong>Something went wrong</strong>
      <p>{message}</p>
      {onRetry && (
        <button className="secondary-button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
