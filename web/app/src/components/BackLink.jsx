import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';

export default function BackLink() {
  const { lang } = useLang();
  return (
    <div className="back-link-container">
      <Link to="/" className="back-link">
        ← {lang === 'en' ? 'Back to Home' : '홈으로'}
      </Link>
    </div>
  );
}
