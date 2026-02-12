import { getBaseUrl } from '../utils/urls';
import { useLang } from '../context/LangContext';
import '../styles/Scripts.css';

const SCRIPTS_DIR = { ko: 'KOR', en: 'ENG' };

const SCRIPT_SECTIONS = [
  {
    titleKo: '🐧 Linux 스크립트',
    titleEn: '🐧 Linux Scripts',
    scripts: [
      { name: 'install-docker.sh', descKo: 'Linux용 Docker 자동 설치 스크립트', descEn: 'Automated Docker installation script for Linux', icon: '🐳' },
      { name: 'setup-docker-registry.sh', descKo: 'Linux용 Docker Registry 설정 스크립트', descEn: 'Docker Registry setup and configuration script for Linux', icon: '⚙️' },
    ],
  },
  {
    titleKo: '🪟 Windows 스크립트',
    titleEn: '🪟 Windows Scripts',
    scripts: [
      { name: 'install-docker-windows.bat', descKo: 'Windows용 Docker Desktop 설치 스크립트', descEn: 'Docker Desktop installation script for Windows', icon: '🐳' },
      { name: 'setup-docker-registry-windows.bat', descKo: 'Windows용 Docker Registry 설정 스크립트', descEn: 'Docker Registry setup script for Windows', icon: '⚙️' },
    ],
  },
];

export default function Scripts() {
  const { lang } = useLang();
  const base = getBaseUrl();

  const scriptUrl = (script) => `${base}/scripts/${SCRIPTS_DIR[lang]}/${script.name}`;
  const desc = (script) => (lang === 'en' ? script.descEn : script.descKo);
  const sectionTitle = (section) => (lang === 'en' ? section.titleEn : section.titleKo);

  return (
    <>
      <div className="info-box">
        <strong>{lang === 'en' ? 'Installation & Setup Scripts' : '설치 및 설정 스크립트'}</strong>
        <br />
        {lang === 'en'
          ? 'Download scripts to automate Docker installation and Registry configuration.'
          : 'Docker 설치 및 Registry 설정을 위한 스크립트를 다운로드하세요.'}
        <br />
        <strong>Linux/macOS:</strong>{' '}
        <code>curl [URL] -o script.sh && chmod +x script.sh && ./script.sh</code>
        <br />
        <strong>Windows:</strong> <code>curl [URL] -o script.bat && script.bat</code>{' '}
        ({lang === 'en' ? 'Run as Admin' : '관리자 권한으로 실행'})
      </div>

      {SCRIPT_SECTIONS.map((section) => (
        <div key={section.titleEn} className="scripts-section">
          <h3>{sectionTitle(section)}</h3>
          <div className="file-list">
            {section.scripts.map((script) => (
              <div key={script.name} className="script-item">
                <div className="script-icon" aria-hidden>{script.icon}</div>
                <div className="script-info">
                  <div className="script-name">{script.name}</div>
                  <div className="script-desc">{desc(script)}</div>
                  <span className="script-size">~4 KB</span>
                </div>
                <a href={scriptUrl(script)} className="btn" download={script.name}>
                  {lang === 'en' ? 'Download' : '다운로드'}
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
