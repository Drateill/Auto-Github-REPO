import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import InputField from './components/InputField';
import FileUploader from './components/FileUploader';
import ErrorMessage from './components/ErrorMessage';
import SuccessMessage from './components/SuccessMessage';
import GitCommands from './components/GitCommands';
import gitIgnoreContent from './components/GitIgnore';
import './App.css';
import { FaTrash } from 'react-icons/fa';

const API_URLS = {
  USER: 'https://api.github.com/user',
  REPO: 'https://api.github.com/user/repos',
};





function App() {
  const [organization, setOrganization] = useState('');
  const [repoName, setRepoName] = useState('');
  const [branch, setBranch] = useState('');
  const [token, setToken] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [selectedWorkflows, setSelectedWorkflows] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [importedWorkflows, setImportedWorkflows] = useState([]);
  const [isTerraformRepository, setIsTerraformRepository] = useState(false);
  const [repositoryType, setRepositoryType] = useState('Default');
  const [repositoryTypes, setRepositoryTypes] = useState(['Default', 'Terraform']);



  useEffect(() => {
    // Fetch workflowsData or import them from another source
    const workflowsData = [];

    setWorkflowsData(workflowsData);
  }, []);

  const fetchUsername = async () => {
    try {
      const response = await fetch(API_URLS.USER, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.login;
      } else {
        setErrorMessage('Error fetching username.');
        return null;
      }
    } catch (error) {
      setErrorMessage('An error occurred.');
      console.error(error);
      return null;
    }
  };

  const checkExistingRepository = async (username) => {
    try {
      const repositoryResponse = await fetch(`${API_URLS.REPO}/${username}/${repoName}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (repositoryResponse.ok) {
        const data = await repositoryResponse.json();
        const repoUrl = data.html_url;
        setRepositoryUrl(repoUrl);
        setErrorMessage('Repository already exists.');
        return true;
      } else if (repositoryResponse.status === 404) {
        return false;
      } else {
        setErrorMessage('Error checking existing repository.');
        return true;
      }
    } catch (error) {
      setErrorMessage('An error occurred.');
      console.error(error);
      return true;
    }
  };

  const createRepository = async (username) => {
    try {
      const repositoryData = { name: repoName };
      if (organization) {
        repositoryData.owner = organization;
      }

      const repositoryResponse = await fetch(API_URLS.REPO, {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repositoryData),
      });

      if (repositoryResponse.status === 201) {
        setResponseMessage('Repository created successfully.');

        const createOrUpdateFile = async () => {
          const fileData = {
            message: 'Initial commit',
            content: btoa(unescape(encodeURIComponent('initial commit'))),
            branch: branch,
          };

          try {
            const fileResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/README.md`, {
              method: 'PUT',
              headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(fileData),
            });

            if (fileResponse.ok) {
              setResponseMessage('Initial commit created successfully.');

              const repositoryUrlResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
                headers: {
                  Authorization: `token ${token}`,
                  Accept: 'application/vnd.github.v3+json',
                },
              });

              if (repositoryUrlResponse.ok) {
                const data = await repositoryUrlResponse.json();
                const repoUrl = data.html_url;
                setRepositoryUrl(repoUrl);
                await addSelectedWorkflows(username);
                await addTerraformFiles(username);
              } else {
                setErrorMessage('Error fetching repository URL.');
              }
            } else {
              const errorData = await fileResponse.json();
              throw new Error(`Error creating initial commit: ${errorData.message}`);
            }
          } catch (error) {
            throw new Error(`An error occurred: ${error.message}`);
          }
        };

        await createOrUpdateFile();
      } else {
        setErrorMessage('Error creating repository.');
      }
    } catch (error) {
      setErrorMessage('An error occurred.');
      console.error(error);
    }
  };

  const addSelectedWorkflows = async (username, branchSHA) => {
    try {
      for (const workflow of selectedWorkflows) {
        const base64Content = btoa(unescape(encodeURIComponent(workflow.content)));

        const workflowData = {
          message: `Add ${workflow.name} workflow`,
          content: base64Content,
          branch: branch,
          sha: branchSHA,
        };

        const workflowResponse = await fetch(
          `https://api.github.com/repos/${username}/${repoName}/contents/.github/workflows/${workflow.name}.yml`,
          {
            method: 'PUT',
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(workflowData),
          }
        );

        if (workflowResponse.ok) {
          setResponseMessage(`Workflow "${workflow.name}" added successfully.`);
        } else {
          const errorData = await workflowResponse.json();
          throw new Error(`Error adding workflow "${workflow.name}": ${errorData.message}`);
        }
      }

      for (const workflow of importedWorkflows) {
        const base64Content = btoa(unescape(encodeURIComponent(workflow.content)));

        const workflowData = {
          message: `Add ${workflow.name} workflow`,
          content: base64Content,
          branch: branch,
          sha: branchSHA,
        };

        const workflowResponse = await fetch(
          `https://api.github.com/repos/${username}/${repoName}/contents/.github/workflows/${workflow.name}.yml`,
          {
            method: 'PUT',
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(workflowData),
          }
        );

        if (workflowResponse.ok) {
          setResponseMessage(`Workflow "${workflow.name}" added successfully.`);
        } else {
          const errorData = await workflowResponse.json();
          throw new Error(`Error adding workflow "${workflow.name}": ${errorData.message}`);
        }
      }
    } catch (error) {
      setErrorMessage(`An error occurred while adding workflows: ${error.message}`);
      console.error(error);
    }
  };

  const setWorkflowsData = (data) => {
    if (Array.isArray(data)) {
      setSelectedWorkflows(data);
    }
  };

  const handleWorkflowFileChange = (event) => {
    const files = event.target.files;
    const newImportedWorkflows = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const workflowContent = event.target.result;
        const workflowName = file.name.replace(/\.[^/.]+$/, '');
        const importedWorkflow = { name: workflowName, content: workflowContent };
        newImportedWorkflows.push(importedWorkflow);

        console.log(`Content of ${workflowName}:`);
        console.log(workflowContent);

        if (i === files.length - 1) {
          setImportedWorkflows((prevImportedWorkflows) => [...prevImportedWorkflows, ...newImportedWorkflows]);
        }
      };

      reader.readAsText(file);
    }
  };

  const removeImportedWorkflow = (workflowName) => {
    setImportedWorkflows((prevImportedWorkflows) =>
      prevImportedWorkflows.filter((workflow) => workflow.name !== workflowName)
    );
  };

  const renderImportedWorkflows = () => {
    return (
      <div>
        <h3>Imported Workflows:</h3>
        <div className="imported-workflows">
          {importedWorkflows.map((workflow, index) => (
            <div key={index} className="imported-workflow">
              <span>{workflow.name}</span>
              <FaTrash className="trash-icon" onClick={() => removeImportedWorkflow(workflow.name)} />
            </div>
          ))}
        </div>
      </div>
    );
  };
  

  const createRepositoryWithInitialCommitAndWorkflows = async () => {
    setErrorMessage('');
    setResponseMessage('');
    setRepositoryUrl('');

    if (!repoName || !branch || !token) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      const username = await fetchUsername();

      if (username) {
        const isExistingRepository = await checkExistingRepository(username);

        if (!isExistingRepository) {
          await createRepository(username);

        }
      }
    } catch (error) {
      setErrorMessage('An error occurred.');
      console.error(error);
    }
  };

  const addTerraformFiles = async (username) => {
    if (repositoryType === 'Terraform') {
      console.log("Adding terraform file")
      const mainTfData = {
        message: 'Add Terraform placeholder file',
        content: btoa(''),
        branch: branch,
      };
  
      try {
        // Create and commit the main.tf file
        await createAndCommitFile(username, repoName, 'terraform/main.tf', mainTfData);
  
        setResponseMessage('Terraform placeholder files added successfully.');
        console.log("Terraform file added")
      } catch (error) {
        setErrorMessage(`An error occurred while adding the Terraform placeholder files: ${error.message}`);
        console.error(error);
      }
    }
  };
  

  const createAndCommitFile = async (username, repoName, filePath, fileData) => {
    const fileResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fileData),
    });

    if (fileResponse.ok) {
      const fileContent = await fileResponse.json();
      const commitData = {
        message: fileData.message,
        content: fileContent.content.sha,
        branch: branch,
      };

      await fetch(`https://api.github.com/repos/${username}/${repoName}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commitData),
      });
    } else {
      const errorData = await fileResponse.json();
      throw new Error(`Error adding file "${filePath}": ${errorData.message}`);
    }
  };

  const handleRepositoryTypeChange = (e) => {
    setRepositoryType(e.target.value);
    console.log(e.target.value)
  };

  return (
    <div className="App">
      <h1>Create Repository with Initial Commit and Workflows</h1>
      <div className="form-row">
        <div className="col-md-6">
          <InputField label="Organization (Optional)" id="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} />
        </div>
        <div className="col-md-6">
          <InputField label="Repository Name" id="repoName" value={repoName} onChange={(e) => setRepoName(e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="col-md-6">
          <InputField label="Branch Name" id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} />
        </div>
        <div className="col-md-6">
          <InputField label="Personal Access Token" id="token" value={token} onChange={(e) => setToken(e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="col-md-6">
          <Form.Group controlId="formRepositoryType">
            <Form.Label>Repository Type</Form.Label>
            <Form.Control as="select" value={repositoryType} onChange={(e) => handleRepositoryTypeChange(e)}>
              {repositoryTypes.map(type=> (
                <option value={type} key={type}>{type}</option>
              ))
              }
            </Form.Control>
          </Form.Group>
        </div>
        <div className="col-md-6">
          <FileUploader label="Import Workflow File" id="workflowFile" onChange={handleWorkflowFileChange} />
        </div>
      </div>
      {renderImportedWorkflows()}
      <button onClick={createRepositoryWithInitialCommitAndWorkflows}>Create Repository with Initial Commit and Workflows</button>
      {errorMessage && <ErrorMessage message={errorMessage} />}
      {responseMessage && <SuccessMessage message={responseMessage} />}
      <GitCommands repositoryUrl={repositoryUrl} />
    </div>
  );
    
}

export default App;