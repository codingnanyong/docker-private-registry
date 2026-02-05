import { getBaseUrl } from '../utils/urls';
import BackLink from '../components/BackLink';
import '../styles/Scripts.css';

const SCRIPT_SECTIONS = [
  {
    title: '🐧 Linux Scripts',
    scripts: [
      { name: 'install-docker.sh', desc: 'Automated Docker installation script for Linux systems', size: '~4 KB', icon: '🐳' },
      { name: 'setup-docker-registry.sh', desc: 'Docker Registry setup and configuration script for Linux', size: '~4 KB', icon: '⚙️' },
    ],
  },
  {
    title: '🪟 Windows Scripts',
    scripts: [
      { name: 'install-docker-windows.bat', desc: 'Docker Desktop installation script for Windows', size: '~4 KB', icon: '🐳' },
      { name: 'setup-docker-registry-windows.bat', desc: 'Docker Registry setup script for Windows', size: '~3 KB', icon: '⚙️' },
    ],
  },
];

export default function Scripts() {
  const base = getBaseUrl();

  return (
    <>
      <div className="info-box">
        <strong>Installation & Setup Scripts</strong>
        <br />
        Download scripts to automate Docker installation and Registry configuration.
      </div>
      {SCRIPT_SECTIONS.map((section) => (
        <div key={section.title} className="scripts-section">
          <h3>{section.title}</h3>
          <div className="file-list">
            {section.scripts.map((script) => (
              <div key={script.name} className="script-item">
                <div className="script-icon" aria-hidden>{script.icon}</div>
                <div className="script-info">
                  <div className="script-name">{script.name}</div>
                  <div className="script-desc">{script.desc}</div>
                  <span className="script-size">{script.size}</span>
                </div>
                <a
                  href={`${base}/scripts/${script.name}`}
                  className="btn"
                  download={script.name}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="info-box">
        <strong>Linux/macOS:</strong> <code>curl [URL] -o script.sh && chmod +x script.sh && ./script.sh</code>
        <br />
        <strong>Windows:</strong> <code>curl [URL] -o script.bat && script.bat</code> (Run as Admin)
      </div>
      <BackLink />
    </>
  );
}
