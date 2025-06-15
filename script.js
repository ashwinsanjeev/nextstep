const API_BASE_URL = 'http://localhost:5000';

// DOM Elements
const resumeUpload = document.getElementById('resume-upload');
const fileNameDisplay = document.getElementById('file-name');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingSection = document.getElementById('loading');
const resultsSection = document.getElementById('results');
const skillsContainer = document.getElementById('skills-container');
const jobsContainer = document.getElementById('jobs-container');
const errorSection = document.getElementById('error-section');

// Event Listeners
resumeUpload.addEventListener('change', handleFileUpload);
analyzeBtn.addEventListener('click', analyzeResume);

// Handle file upload
function handleFileUpload(e) {
    const fileName = e.target.files[0] ? e.target.files[0].name : 'No file selected';
    fileNameDisplay.textContent = fileName;
    analyzeBtn.style.display = fileName !== 'No file selected' ? 'inline-block' : 'none';
    errorSection.style.display = 'none';
}

// Main analysis function
async function analyzeResume() {
    const file = resumeUpload.files[0];
    if (!file) {
        showError('Please select a file first');
        return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
        // Show loading state
        loadingSection.style.display = 'block';
        analyzeBtn.disabled = true;
        resultsSection.style.display = 'none';
        errorSection.style.display = 'none';

        // Analyze resume
        const analysisResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            body: formData
        });

        if (!analysisResponse.ok) {
            const errorData = await analysisResponse.json();
            throw new Error(errorData.error || 'Analysis failed');
        }

        const analysisData = await analysisResponse.json();
        displayResults(analysisData.data);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message.includes('rate limit') 
            ? 'Server is busy. Please try again shortly.'
            : error.message
        );
    } finally {
        loadingSection.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

function displayResults(data) {
  // Skills display (handles both string and object skills)
  skillsContainer.innerHTML = data.skills.map(skill => {
    const skillName = typeof skill === 'object' ? skill.skill : skill;
    const skillType = typeof skill === 'object' ? skill.type : 'general';
    return `
      <div class="skill-item ${skillType}">
        ${skillName}
        ${skillType !== 'general' ? `<span class="skill-type">${skillType}</span>` : ''}
      </div>
    `;
  }).join('');

  // Jobs display
  jobsContainer.innerHTML = data.jobs.map(job => `
  <div class="job-card">
    <div class="job-header">
      <h3>${job.title}</h3>
      <span class="match-score">${job.match}% match</span>
    </div>
    <p class="company">${job.company}</p>
    <p class="location">${job.location}</p>
    <a href="${job.url}" 
       target="_blank" 
       rel="noopener noreferrer"
       class="linkedin-link">
      View →
    </a>
  </div>
`).join('');

  // Show metadata
  const metaInfo = `
    <div class="meta-info">
      Processed ${data.meta.processed} characters | 
      Found ${data.meta.skillsFound} skills | 
      ${data.meta.jobsFound} jobs
    </div>
  `;
  
  resultsSection.innerHTML = metaInfo + resultsSection.innerHTML;
  resultsSection.style.display = 'block';
}

// async function getJobRecommendations(skills) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/jobs`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ skills })
//     });
    
//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Fetch Error:', error);
//     throw error;
//   }
// }


// Display skills function
function displaySkills(skills) {
    skillsContainer.innerHTML = '';
    if (!skills || skills.length === 0) {
        skillsContainer.innerHTML = '<p>No skills detected</p>';
        return;
    }

    skills.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'skill-tag';
        skillTag.textContent = skill;
        skillsContainer.appendChild(skillTag);
    });
}

// Display jobs function
function displayJobs(jobs) {
    jobsContainer.innerHTML = '';
    if (!jobs || jobs.length === 0) {
        jobsContainer.innerHTML = '<p>No matching jobs found</p>';
        return;
    }

    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            ${job.match ? `<span class="match-score">${job.match}% Match</span>` : ''}
            <h3 class="job-title">${job.title}</h3>
            <p class="company">${job.company} • ${job.location}</p>
            <p>${job.description}</p>
            ${job.url ? `<a href="${job.url}" target="_blank" style="color: var(--primary);">View on LinkedIn</a>` : ''}
        `;
        jobsContainer.appendChild(jobCard);
    });
}

// Error handling function
function showError(message) {
    errorSection.innerHTML = `<p>${message}</p>`;
    errorSection.style.display = 'block';
    analyzeBtn.style.display = 'inline-block';
}