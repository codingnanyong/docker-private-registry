import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRegistryUrl, getCurlBaseUrl } from '../utils/urls';

export default function Home() {
  const [copyLabel, setCopyLabel] = useState('Copy');
  const [stats, setStats] = useState({
    totalImages: '-',
    estimatedSize: '-',
    totalTags: '-',
    largestImage: '-',
    loading: true,
    error: null,
  });

  const registryUrl = getRegistryUrl();
  const curlBase = getCurlBaseUrl();

  const copyRegistryUrl = async (e) => {
    e?.preventDefault();
    try {
      await navigator.clipboard.writeText(registryUrl);
      setCopyLabel('Copied!');
      setTimeout(() => setCopyLabel('Copy'), 2000);
    } catch {
      setCopyLabel('Failed');
      setTimeout(() => setCopyLabel('Copy'), 2000);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v2/_catalog');
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        const repositories = data.repositories || [];
        if (cancelled) return;

        const totalImages = repositories.length;
        const estimatedSizeGB = (totalImages * 150 / 1024).toFixed(1);
        let totalTags = 0;
        const tagCounts = await Promise.all(
          repositories.map(async (repo) => {
            try {
              const r = await fetch(`/api/v2/${repo}/tags/list`);
              if (!r.ok) return 0;
              const d = await r.json();
              return (d.tags && d.tags.length) || 0;
            } catch {
              return 0;
            }
          })
        );
        totalTags = tagCounts.reduce((s, c) => s + c, 0);
        const largestImage = repositories.reduce((a, b) => (a.length > b.length ? a : b), '') || 'N/A';

        setStats({
          totalImages,
          estimatedSize: `~${estimatedSizeGB} GB`,
          totalTags,
          largestImage,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (!cancelled) setStats((s) => ({ ...s, loading: false, error: err.message }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div className="info-box">
        <strong>Welcome!</strong>
        <br />
        This server provides resources for connecting to the Docker Private Registry.
        <br />
        Download the certificate and scripts you need to get started and view the documentation.
      </div>

      <div className="section">
        <h2>Documentation</h2>
        <p>View comprehensive guides and documentation:</p>
        <ul>
          <li><strong>DOCKER_BASICS_GUIDE.md</strong> - Docker and Docker Compose fundamentals</li>
          <li><strong>DOCKER_INSTALL_GUIDE.md</strong> - Docker installation instructions</li>
          <li><strong>EXTERNAL_CLIENT_GUIDE.md</strong> - External clients connect guide</li>
          <li><strong>CERT_DOWNLOAD_GUIDE.md</strong> - Certificate download guide</li>
          <li><strong>REGISTRY_USAGE_GUIDE.md</strong> - Pushing/pulling to private registry</li>
        </ul>
        <Link to="/docs" className="btn btn-secondary">View All Documentation</Link>
      </div>

      <div className="section">
        <h2>Setup Scripts</h2>
        <p>Automated installation and configuration scripts for Linux, macOS, and Windows.</p>
        <div className="download-box">
          <strong>Install Docker:</strong>
          <br />
          Linux/macOS: <code>curl {curlBase}/scripts/install-docker.sh -o install-docker.sh</code>
          <br />
          Windows: <code>curl {curlBase}/scripts/install-docker-windows.bat -o install-docker-windows.bat</code>
        </div>
        <div className="download-box">
          <strong>Setup Registry:</strong>
          <br />
          Linux/macOS: <code>curl {curlBase}/scripts/setup-docker-registry.sh -o setup.sh</code>
          <br />
          Windows: <code>curl {curlBase}/scripts/setup-docker-registry-windows.bat -o setup.bat</code>
        </div>
        <Link to="/scripts" className="btn btn-secondary">Browse Scripts Directory</Link>
      </div>

      <div className="section">
        <h2>Certificates</h2>
        <p>Download the SSL certificate required to connect to the registry securely.</p>
        <div className="download-box">
          <strong>Download Certificate:</strong>
          <code>curl {curlBase}/certs/domain.crt -o domain.crt</code>
        </div>
        <Link to="/certs" className="btn">Browse Certificates Directory</Link>
      </div>

      <div className="registry-url-box">
        <strong>Registry URL</strong>
        <div className="registry-url-copy">
          <span>{registryUrl}</span>
          <button type="button" className="btn-copy" onClick={copyRegistryUrl}>
            {copyLabel}
          </button>
        </div>
      </div>

      {stats.error == null && (
        <div className="registry-stats">
          <h2>📊 Registry Statistics</h2>
          {stats.loading ? (
            <div className="stats-loading"><p>Loading statistics...</p></div>
          ) : (
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{stats.totalImages}</div>
                <div className="stat-label">Total Images</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.estimatedSize}</div>
                <div className="stat-label">Estimated Size</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.totalTags}</div>
                <div className="stat-label">Total Tags</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.largestImage}</div>
                <div className="stat-label">Largest Repository</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="section">
        <h2>Registry Resources</h2>
        <p>View Docker images and download compose files:</p>
        <div className="section-actions">
          <Link to="/registry-list" className="btn">View Image List</Link>
          <Link to="/compose-list" className="btn btn-secondary">Docker Compose Files</Link>
        </div>
      </div>
    </>
  );
}
