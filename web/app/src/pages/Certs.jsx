import { getBaseUrl, getCurlBaseUrl } from '../utils/urls';
import { useLang } from '../context/LangContext';
import '../styles/Certs.css';

const CERT_FILE = {
  name: 'domain.crt',
  descriptionEn: 'SSL Certificate File',
  descriptionKo: 'SSL 인증서 파일',
};

export default function Certs() {
  const { lang } = useLang();
  const base = getBaseUrl();
  const curlHost = getCurlBaseUrl();
  const certUrl = `${base}/certs/domain.crt`;
  const t = (en, ko) => (lang === 'en' ? en : ko);

  return (
    <>
      <div className="info-box">
        <strong>{t('SSL/TLS Certificates', 'SSL/TLS 인증서')}</strong>
        <br />
        {t(
          'Download the certificate file required to connect to the Docker Registry securely.',
          'Docker Registry에 안전하게 연결하기 위해 필요한 인증서 파일을 다운로드하세요.'
        )}
        <br />
        <strong>{t('Usage:', '사용법:')}</strong>{' '}
        {t('After downloading, install the certificate on your system:', '다운로드 후 시스템에 인증서를 설치하세요:')}
        <br />
        <code className="certs-usage-code">
          curl {curlHost}/certs/domain.crt -o domain.crt
        </code>
      </div>
      <div className="certs-file-list">
        <div className="certs-file-item">
          <div className="certs-file-icon" aria-hidden>🔐</div>
          <div className="certs-file-info">
            <div className="certs-file-name">{CERT_FILE.name}</div>
            <div className="certs-file-desc">{lang === 'en' ? CERT_FILE.descriptionEn : CERT_FILE.descriptionKo}</div>
          </div>
          <a href={certUrl} className="btn" download={CERT_FILE.name}>
            {t('Download', '다운로드')}
          </a>
        </div>
      </div>
    </>
  );
}
