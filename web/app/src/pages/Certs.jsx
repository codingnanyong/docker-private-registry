import { getBaseUrl, getCurlBaseUrl } from '../utils/urls';
import BackLink from '../components/BackLink';
import '../styles/Certs.css';

const CERT_FILE = {
  name: 'domain.crt',
  description: 'SSL Certificate File',
};

export default function Certs() {
  const base = getBaseUrl();
  const curlHost = getCurlBaseUrl();
  const certUrl = `${base}/certs/domain.crt`;

  return (
    <>
      <div className="info-box">
        <strong>SSL/TLS Certificates</strong>
        <br />
        Download the certificate file required to connect to the Docker Registry securely.
      </div>
      <div className="certs-file-list">
        <div className="certs-file-item">
          <div className="certs-file-icon" aria-hidden>🔐</div>
          <div className="certs-file-info">
            <div className="certs-file-name">{CERT_FILE.name}</div>
            <div className="certs-file-desc">{CERT_FILE.description}</div>
          </div>
          <a href={certUrl} className="btn" download={CERT_FILE.name}>
            Download
          </a>
        </div>
      </div>
      <div className="info-box">
        <strong>Usage:</strong>
        <br />
        After downloading, install the certificate on your system:
        <br />
        <code className="certs-usage-code">
          curl {curlHost}/certs/domain.crt -o domain.crt
        </code>
      </div>
      <BackLink />
    </>
  );
}
