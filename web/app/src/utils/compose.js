const PINNED_NAME = 'example-compose.yml';

export function getComposeApiUrl() {
  return `${typeof window !== 'undefined' ? window.location.origin : ''}/docker/`;
}

/**
 * Parse nginx autoindex HTML and extract .yml/.yaml file links.
 */
export function parseComposeFilesFromHtml(html, baseUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = doc.querySelectorAll('a');
  const files = [];
  links.forEach((link) => {
    const href = link.getAttribute('href');
    const name = link.textContent.trim();
    if (href && (href.endsWith('.yml') || href.endsWith('.yaml')) && !href.startsWith('..')) {
      files.push({ name, url: baseUrl + href, path: href });
    }
  });
  return files.sort((a, b) => {
    const aPinned = a.name === PINNED_NAME;
    const bPinned = b.name === PINNED_NAME;
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    if (aPinned && bPinned) return 0;
    return a.name.localeCompare(b.name);
  });
}

export function sortWithPinnedFirst(files, pinned = PINNED_NAME) {
  return [...files].sort((a, b) => {
    const aPinned = a.name === pinned;
    const bPinned = b.name === pinned;
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return a.name.localeCompare(b.name);
  });
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
