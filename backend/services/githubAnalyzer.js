const https = require('https');

/**
 * Extract owner and repo name from GitHub URL
 */
function parseGitHubUrl(url) {
  if (!url) return null;

  const regex = /github\.com\/([^\/]+)\/([^\/\s]+)/i;
  const match = url.match(regex);

  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, '')
  };
}

/**
 * Base GitHub request helper
 */
function githubRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method: 'GET',
      headers: {
        'User-Agent': 'CPMS-Project-Evaluator',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    };

    const req = https.request(options, res => {
      let data = '';

      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Invalid JSON from GitHub'));
          }
        } else if (res.statusCode === 404) {
          reject(new Error('Repository not found or private repo access denied'));
        } else if (res.statusCode === 401) {
          reject(new Error('Invalid GitHub token'));
        } else if (res.statusCode === 403) {
          reject(new Error('GitHub rate limit exceeded'));
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', err =>
      reject(new Error(`GitHub request failed: ${err.message}`))
    );

    req.end();
  });
}

/**
 * Fetch repo details
 */
const fetchGitHubRepo = (owner, repo) =>
  githubRequest(`/repos/${owner}/${repo}`);

/**
 * Fetch repo languages
 */
const fetchGitHubLanguages = (owner, repo) =>
  githubRequest(`/repos/${owner}/${repo}/languages`).catch(() => ({}));

/**
 * Check README existence
 */
async function fetchReadme(owner, repo) {
  try {
    await githubRequest(`/repos/${owner}/${repo}/readme`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Main analyzer
 */
async function analyzeGitHubRepo(repoUrl) {
  try {
    console.log('🔍 Analyzing GitHub repository:', repoUrl);

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return { valid: false, error: 'Invalid GitHub URL' };
    }

    const { owner, repo } = parsed;
    console.log(`📦 Fetching ${owner}/${repo}`);

    const repoData = await fetchGitHubRepo(owner, repo);
    const languages = await fetchGitHubLanguages(owner, repo);
    const hasReadme = await fetchReadme(owner, repo);

    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
    const languagePercentages = {};

    if (totalBytes > 0) {
      for (const [lang, bytes] of Object.entries(languages)) {
        languagePercentages[lang] = (
          (bytes / totalBytes) *
          100
        ).toFixed(1);
      }
    }

    console.log('✅ GitHub analysis complete');

    return {
      valid: true,
      name: repoData.name,
      description: repoData.description || 'No description',
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: repoData.open_issues_count,
      watchers: repoData.subscribers_count,
      sizeKB: repoData.size,
      languages: languagePercentages,
      hasReadme,
      isPrivate: repoData.private,
      license: repoData.license?.name || 'No license',
      topics: repoData.topics || [],
      defaultBranch: repoData.default_branch,
      createdAt: repoData.created_at,
      updatedAt: repoData.updated_at,
      url: repoData.html_url,
      owner: {
        login: repoData.owner.login,
        type: repoData.owner.type
      }
    };
  } catch (error) {
    console.error('❌ GitHub analysis failed:', error.message);
    return { valid: false, error: error.message };
  }
}

module.exports = {
  parseGitHubUrl,
  analyzeGitHubRepo
};