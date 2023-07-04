import React from 'react';

const GitCommands = ({ repositoryUrl }) => {
  const gitCommands = `# Initialize a new Git repository
git init

# Add the remote repository as the origin
git remote add origin ${repositoryUrl}

# Fetch the latest changes from the remote repository
git fetch

# Checkout the main branch
git checkout main

# Pull the latest changes from the remote repository
git pull origin main`;

  return (
    <div>
      <h3>Git Commands:</h3>
      <pre>{gitCommands}</pre>
    </div>
  );
};

export default GitCommands;
