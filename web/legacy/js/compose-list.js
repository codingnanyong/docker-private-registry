// Docker Compose List JavaScript
const COMPOSE_API_URL = '/docker/';

let allComposeFiles = [];
let filteredFiles = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadComposeFiles();
    setupSearch();
});

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        filterFiles(e.target.value);
    });
}

// Load compose files from /docker directory
async function loadComposeFiles() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const composeList = document.getElementById('composeList');
    const searchControls = document.querySelector('.search-controls');

    try {
        loading.style.display = 'block';
        error.style.display = 'none';
        
        // Fetch directory listing from /docker
        const response = await fetch(COMPOSE_API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch compose files: ${response.status}`);
        }
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract file links from nginx directory listing
        const links = doc.querySelectorAll('a');
        allComposeFiles = [];
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            const name = link.textContent.trim();
            
            // Filter for docker-compose files (yml, yaml)
            if (href && (href.endsWith('.yml') || href.endsWith('.yaml')) && !href.startsWith('..')) {
                allComposeFiles.push({
                    name: name,
                    url: COMPOSE_API_URL + href,
                    path: href
                });
            }
        });
        
        if (allComposeFiles.length === 0) {
            error.textContent = 'No docker-compose files found in /docker directory';
            error.style.display = 'block';
            loading.style.display = 'none';
            return;
        }
        
        // example-compose.yml 항상 최상위, 나머지는 가나다순
        const PINNED_NAME = 'example-compose.yml';
        allComposeFiles.sort((a, b) => {
            const aPinned = a.name === PINNED_NAME;
            const bPinned = b.name === PINNED_NAME;
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            if (aPinned && bPinned) return 0;
            return a.name.localeCompare(b.name);
        });
        
        filteredFiles = [...allComposeFiles];
        renderComposeFiles();
        
        loading.style.display = 'none';
        composeList.style.display = 'grid';
        searchControls.style.display = 'block';
        updateSearchStats();
        
    } catch (err) {
        console.error('Error loading compose files:', err);
        error.textContent = 'Error loading compose files. Make sure /docker directory is accessible.';
        error.style.display = 'block';
        loading.style.display = 'none';
    }
}

// Filter files based on search query (example-compose.yml은 검색 시에도 최상위 유지)
function filterFiles(query) {
    const searchTerm = query.toLowerCase().trim();
    const PINNED_NAME = 'example-compose.yml';
    
    if (!searchTerm) {
        filteredFiles = [...allComposeFiles];
    } else {
        filteredFiles = allComposeFiles.filter(file => 
            file.name.toLowerCase().includes(searchTerm)
        );
        filteredFiles.sort((a, b) => {
            const aPinned = a.name === PINNED_NAME;
            const bPinned = b.name === PINNED_NAME;
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            if (aPinned && bPinned) return 0;
            return a.name.localeCompare(b.name);
        });
    }
    
    renderComposeFiles();
    updateSearchStats();
}

// Render compose files
function renderComposeFiles() {
    const composeList = document.getElementById('composeList');
    
    if (filteredFiles.length === 0) {
        composeList.innerHTML = '<div class="no-results">No compose files found matching your search.</div>';
        return;
    }
    
    composeList.innerHTML = filteredFiles.map(file => `
        <div class="compose-card">
            <div class="compose-header">
                <div class="compose-icon">📦</div>
                <div class="compose-info">
                    <div class="compose-name">${escapeHtml(file.name)}</div>
                    <div class="compose-path">${escapeHtml(file.path)}</div>
                </div>
            </div>
            <div class="compose-actions">
                <button class="btn btn-primary" onclick="downloadCompose('${escapeHtml(file.url)}', '${escapeHtml(file.name)}')">
                    Download
                </button>
                <button class="btn btn-secondary" onclick="viewCompose('${escapeHtml(file.url)}', '${escapeHtml(file.name)}')">
                    View
                </button>
            </div>
        </div>
    `).join('');
}

// Update search statistics
function updateSearchStats() {
    document.getElementById('searchCount').textContent = filteredFiles.length;
    document.getElementById('totalCount').textContent = allComposeFiles.length;
}

// Download compose file
async function downloadCompose(url, filename) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        showToast('Downloaded: ' + filename);
    } catch (err) {
        console.error('Download error:', err);
        showToast('Error downloading file', 'error');
    }
}

// View compose file in modal
async function viewCompose(url, filename) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load file');
        
        const content = await response.text();
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${escapeHtml(filename)}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <pre><code>${escapeHtml(content)}</code></pre>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn btn-primary" onclick="copyToClipboard(\`${escapeHtml(content).replace(/`/g, '\\`')}\`, 'Content copied!')">
                        Copy Content
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
    } catch (err) {
        console.error('View error:', err);
        showToast('Error loading file', 'error');
    }
}

// Copy to clipboard utility
function copyToClipboard(text, message = 'Copied!') {
    navigator.clipboard.writeText(text).then(() => {
        showToast(message);
    }).catch(err => {
        console.error('Copy failed:', err);
        showToast('Copy failed', 'error');
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// HTML escape utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
