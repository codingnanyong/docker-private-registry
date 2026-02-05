import { Link } from 'react-router-dom';

export default function BackLink() {
  return (
    <div className="back-link-container">
      <Link to="/" className="back-link">
        ← Back to Home
      </Link>
    </div>
  );
}
