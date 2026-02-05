export const REGISTRY_HOST = typeof window !== 'undefined' ? `${window.location.hostname}:5000` : 'localhost:5000';

function extractDockerfileCommands(createdBy, existingContent) {
  let content = '';
  if ((createdBy.includes('FROM') || createdBy.includes('from')) && !existingContent.includes('FROM')) {
    const fromMatch = createdBy.match(/FROM\s+([^\s]+)/i);
    if (fromMatch) content += `FROM ${fromMatch[1]}\n\n`;
  }
  if (createdBy.includes('ENV') || createdBy.includes('env')) {
    const m = createdBy.match(/ENV\s+([^\n]+)/i);
    if (m) content += `ENV ${m[1]}\n`;
  }
  if (createdBy.includes('COPY') || createdBy.includes('copy')) {
    const m = createdBy.match(/COPY\s+([^\n]+)/i);
    if (m) content += `COPY ${m[1]}\n`;
  }
  if (createdBy.includes('ADD') || createdBy.includes('add')) {
    const m = createdBy.match(/ADD\s+([^\n]+)/i);
    if (m) content += `ADD ${m[1]}\n`;
  }
  if (createdBy.includes('RUN') || createdBy.includes('run')) {
    const m = createdBy.match(/RUN\s+([^\n]+)/i);
    if (m) content += `# RUN ${m[1]}\n`;
  }
  if (createdBy.includes('EXPOSE') || createdBy.includes('expose')) {
    const m = createdBy.match(/EXPOSE\s+([^\n]+)/i);
    if (m) content += `EXPOSE ${m[1]}\n`;
  }
  if (createdBy.includes('CMD') || createdBy.includes('cmd')) {
    const m = createdBy.match(/CMD\s+\[([^\]]+)\]/i);
    if (m) content += `CMD [${m[1]}]\n`;
    else {
      const m2 = createdBy.match(/CMD\s+([^\n]+)/i);
      if (m2) content += `CMD ${m2[1]}\n`;
    }
  }
  if (createdBy.includes('WORKDIR') || createdBy.includes('workdir')) {
    const m = createdBy.match(/WORKDIR\s+([^\n]+)/i);
    if (m) content += `WORKDIR ${m[1]}\n`;
  }
  return content;
}

function extractConfigData(configData) {
  let content = '';
  if (configData.Env && configData.Env.length > 0) {
    content += '\n# Environment variables\n';
    configData.Env.forEach((env) => {
      content += `ENV ${env}\n`;
    });
  }
  if (configData.ExposedPorts) {
    content += '\n# Exposed ports\n';
    Object.keys(configData.ExposedPorts).forEach((port) => {
      content += `EXPOSE ${port.replace('/tcp', '').replace('/udp', '')}\n`;
    });
  }
  if (configData.Cmd && configData.Cmd.length > 0) {
    content += '\n# Command\n';
    content += `CMD ${JSON.stringify(configData.Cmd)}\n`;
  }
  return content;
}

export function reconstructDockerfile(config, repoName, tag) {
  let dockerfileContent = '';
  if (config.history && config.history.length > 0) {
    for (let i = config.history.length - 1; i >= 0; i--) {
      const entry = config.history[i];
      if (entry.created_by) {
        dockerfileContent += extractDockerfileCommands(entry.created_by, dockerfileContent);
      }
    }
  }
  if (config.config) {
    dockerfileContent += extractConfigData(config.config);
  }
  if (!dockerfileContent.includes('FROM')) {
    const baseImage = config.config?.Image || repoName;
    dockerfileContent = `FROM ${baseImage}\n\n${dockerfileContent}`;
  }
  return dockerfileContent;
}

export function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Build pull/run command block for a given repo and tag.
 */
export function buildCommands(repoName, tag) {
  const imageName = `${REGISTRY_HOST}/${repoName}:${tag}`;
  const shortName = repoName.split('/').pop();
  return `📥 Download Commands for ${repoName}:${tag}

🐳 Pull Docker Image:
docker pull ${imageName}

💡 Quick Start:
# 1. Pull the image
docker pull ${imageName}

# 2. Run the container
docker run -d --name ${shortName} \\
  -p 8080:8080 \\
  ${imageName}`;
}
