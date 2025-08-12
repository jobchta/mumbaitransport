document.addEventListener('DOMContentLoaded', function() {
  const commitInfoDiv = document.getElementById('commit-info');

  if (commitInfoDiv) {
    fetch('https://api.github.com/repos/jobchta/mumbaitransport/commits')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(commits => {
        if (commits && commits.length > 0) {
          const latestCommit = commits[0];
          const commitSha = latestCommit.sha.substring(0, 7);
          const commitMessage = latestCommit.commit.message.split('\n')[0]; // First line of message
          commitInfoDiv.innerHTML = `
            <span class="chip" style="background-color: var(--surface-hover);">
              <i class="fa-solid fa-code-commit"></i>
              <a href="https://github.com/jobchta/mumbaitransport/commit/${latestCommit.sha}" target="_blank" style="text-decoration: none; color: inherit;">
                ${commitSha}
              </a>: ${commitMessage}
            </span>
          `;
        } else {
          commitInfoDiv.textContent = 'Could not fetch commit information.';
        }
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        commitInfoDiv.textContent = 'Error fetching commit info.';
      });
  }
});
