// ========================================
// ADMIN INTERFACE FUNCTIONALITY
// ========================================

// API Configuration
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const adminNavBtns = document.querySelectorAll('.admin-nav-btn');
const adminSections = document.querySelectorAll('.admin-section');

// Modal Elements
const projectModal = document.getElementById('projectModal');
const actuModal = document.getElementById('actuModal');
const addProjectBtn = document.getElementById('addProjectBtn');
const addActuBtn = document.getElementById('addActuBtn');
const closeProjectModal = document.getElementById('closeProjectModal');
const closeActuModal = document.getElementById('closeActuModal');
const cancelProject = document.getElementById('cancelProject');
const cancelActu = document.getElementById('cancelActu');
const projectForm = document.getElementById('projectForm');
const actuForm = document.getElementById('actuForm');

// Data Storage (in production, this would be replaced with API calls)
let projects = [
  {
    id: 1,
    title: 'TechStart',
    description: 'Site web moderne pour startup tech',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    views: '50k',
    engagement: '+40%',
    conversion: '+25%',
    tags: ['Web Design', 'Branding'],
    homepage: true
  },
  {
    id: 2,
    title: 'FashionLux',
    description: 'Boutique en ligne élégante',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',
    views: '75k',
    engagement: '+60%',
    conversion: '+35%',
    tags: ['E-commerce', 'UX/UI'],
    homepage: true
  },
  {
    id: 3,
    title: 'GreenEco',
    description: 'Application écologique',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400',
    views: '30k',
    engagement: '+50%',
    conversion: '+20%',
    tags: ['Mobile', 'Strategy'],
    homepage: true
  }
];

let actus = [
  {
    id: 1,
    title: 'L\'Importance du Rebranding',
    excerpt: 'Comment une nouvelle identité peut transformer votre entreprise',
    content: 'Le rebranding est un processus stratégique qui peut revitaliser votre marque...',
    image: 'Production-de-contenu-audiovisuel-4.jpg',
    category: 'Tendances',
    date: '2024-12-15',
    author: 'Second Wind Team',
    homepage: true
  },
  {
    id: 2,
    title: 'Design Trends 2025',
    excerpt: 'Les dernières tendances en design digital',
    content: 'Découvrez les tendances qui vont marquer l\'année 2025...',
    image: 'ZeratoR,_mégaphone_en_main,_lors_du_ZEVENT_2025.jpg',
    category: 'Design',
    date: '2024-12-12',
    author: 'Second Wind Team',
    homepage: true
  },
  {
    id: 3,
    title: 'Comment réussir votre stratégie digitale',
    excerpt: 'Guide complet pour une présence en ligne efficace',
    content: 'Une stratégie digitale bien pensée est essentielle...',
    image: 'différence-seo-et-sea.png',
    category: 'Stratégie',
    date: '2024-12-08',
    author: 'Second Wind Team',
    homepage: true
  }
];

// ========================================
// LOGIN & AUTHENTICATION
// ========================================

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Simple authentication (in production, use proper backend authentication)
  if (username === 'admin' && password === 'admin') {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'block';
    document.getElementById('adminUsername').textContent = username;
    localStorage.setItem('adminLoggedIn', 'true');
  } else {
    alert('Nom d\'utilisateur ou mot de passe incorrect');
  }
});

logoutBtn.addEventListener('click', () => {
  loginScreen.style.display = 'flex';
  adminDashboard.style.display = 'none';
  localStorage.removeItem('adminLoggedIn');
  loginForm.reset();
});

// Check if already logged in
if (localStorage.getItem('adminLoggedIn') === 'true') {
  loginScreen.style.display = 'none';
  adminDashboard.style.display = 'block';
}

// ========================================
// NAVIGATION
// ========================================

adminNavBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;

    // Special case: view site
    if (section === 'site') {
      window.open('index.html', '_blank');
      return;
    }

    // Update active button
    adminNavBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update active section
    adminSections.forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}Section`).classList.add('active');
  });
});

// ========================================
// API FUNCTIONS
// ========================================

async function fetchProjects() {
  try {
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data)) {
      projects = data;
      renderProjects();
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
}

async function saveProject(projectData) {
  try {
    const method = projectData.id ? 'PUT' : 'POST';
    const response = await fetch(`${API_URL}/projects`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!response.ok) throw new Error('API error');
    return await response.json();
  } catch (error) {
    console.error('Error saving project:', error);
    alert('Erreur lors de la sauvegarde du projet. Vérifiez que la base de données est configurée sur Vercel.');
  }
}

async function deleteProjectAPI(id) {
  try {
    await fetch(`${API_URL}/projects?id=${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting project:', error);
    alert('Erreur lors de la suppression du projet');
  }
}

async function fetchActus() {
  try {
    const response = await fetch(`${API_URL}/actus`);
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data)) {
      actus = data;
      renderActus();
    }
  } catch (error) {
    console.error('Error fetching actus:', error);
  }
}

async function saveActu(actuData) {
  try {
    const method = actuData.id ? 'PUT' : 'POST';
    const response = await fetch(`${API_URL}/actus`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actuData)
    });
    if (!response.ok) throw new Error('API error');
    return await response.json();
  } catch (error) {
    console.error('Error saving actu:', error);
    alert('Erreur lors de la sauvegarde de l\'actualité. Vérifiez que la base de données est configurée sur Vercel.');
  }
}

async function deleteActuAPI(id) {
  try {
    await fetch(`${API_URL}/actus?id=${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting actu:', error);
    alert('Erreur lors de la suppression de l\'actualité');
  }
}

// ========================================
// PROJECTS MANAGEMENT
// ========================================

function renderProjects() {
  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = projects.map(project => `
    <tr>
      <td><img src="${project.image}" alt="" class="table-thumb"></td>
      <td>
        ${project.title}
        ${project.homepage ? '<br><small style="color: var(--blue); font-weight: 600;"><i class="fa-solid fa-home"></i> Page d\'accueil</small>' : ''}
      </td>
      <td>${project.description}</td>
      <td>${project.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</td>
      <td>
        <button class="btn-icon edit-project" data-id="${project.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon delete-project" data-id="${project.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');

  // Attach event listeners
  document.querySelectorAll('.edit-project').forEach(btn => {
    btn.addEventListener('click', () => editProject(parseInt(btn.dataset.id)));
  });
  document.querySelectorAll('.delete-project').forEach(btn => {
    btn.addEventListener('click', () => deleteProject(parseInt(btn.dataset.id)));
  });
}

function openProjectModal(project = null) {
  projectModal.classList.add('active');
  projectModal.style.display = 'flex';

  if (project) {
    document.getElementById('projectModalTitle').textContent = 'Modifier le Projet';
    document.getElementById('projectId').value = project.id;
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectDescription').value = project.description;
    document.getElementById('projectImage').value = project.image;
    document.getElementById('projectViews').value = project.views || '';
    document.getElementById('projectEngagement').value = project.engagement || '';
    document.getElementById('projectConversion').value = project.conversion || '';
    document.getElementById('projectTags').value = project.tags.join(', ');
    document.getElementById('projectHomepage').checked = project.homepage !== false;
  } else {
    document.getElementById('projectModalTitle').textContent = 'Nouveau Projet';
    projectForm.reset();
    document.getElementById('projectHomepage').checked = true;
  }
}

function closeProjectModalFunc() {
  projectModal.classList.remove('active');
  projectModal.style.display = 'none';
  projectForm.reset();
}

function editProject(id) {
  const project = projects.find(p => p.id === id);
  if (project) {
    openProjectModal(project);
  }
}

function deleteProject(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
    deleteProjectAPI(id).then(() => {
      projects = projects.filter(p => p.id !== id);
      renderProjects();
    });
  }
}

addProjectBtn.addEventListener('click', () => openProjectModal());
closeProjectModal.addEventListener('click', closeProjectModalFunc);
cancelProject.addEventListener('click', closeProjectModalFunc);

projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(projectForm);
  const projectData = {
    id: formData.get('id') ? parseInt(formData.get('id')) : undefined,
    title: formData.get('title'),
    description: formData.get('description'),
    image: formData.get('image'),
    views: formData.get('views'),
    engagement: formData.get('engagement'),
    conversion: formData.get('conversion'),
    tags: formData.get('tags').split(',').map(tag => tag.trim()),
    homepage: document.getElementById('projectHomepage').checked
  };

  const savedProject = await saveProject(projectData);
  
  if (savedProject) {
    if (projectData.id) {
      const index = projects.findIndex(p => p.id === projectData.id);
      projects[index] = savedProject;
    } else {
      projects.push(savedProject);
    }
    renderProjects();
    closeProjectModalFunc();
  }
});

// ========================================
// ACTUS MANAGEMENT
// ========================================

function renderActus() {
  const actusList = document.getElementById('actusList');
  actusList.innerHTML = actus.map(actu => `
    <tr>
      <td><img src="${actu.image}" alt="" class="table-thumb"></td>
      <td>
        ${actu.title}
        ${actu.homepage ? '<br><small style="color: var(--blue); font-weight: 600;"><i class="fa-solid fa-home"></i> Page d\'accueil</small>' : ''}
      </td>
      <td><span class="badge">${actu.category}</span></td>
      <td>${formatDate(actu.date)}</td>
      <td>
        <button class="btn-icon edit-actu" data-id="${actu.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon delete-actu" data-id="${actu.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');

  // Attach event listeners
  document.querySelectorAll('.edit-actu').forEach(btn => {
    btn.addEventListener('click', () => editActu(parseInt(btn.dataset.id)));
  });
  document.querySelectorAll('.delete-actu').forEach(btn => {
    btn.addEventListener('click', () => deleteActu(parseInt(btn.dataset.id)));
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('fr-FR', options);
}

function openActuModal(actu = null) {
  actuModal.classList.add('active');
  actuModal.style.display = 'flex';

  if (actu) {
    document.getElementById('actuModalTitle').textContent = 'Modifier l\'Actualité';
    document.getElementById('actuId').value = actu.id;
    document.getElementById('actuTitle').value = actu.title;
    document.getElementById('actuExcerpt').value = actu.excerpt;
    document.getElementById('actuContent').value = actu.content;
    document.getElementById('actuImage').value = actu.image;
    document.getElementById('actuCategory').value = actu.category;
    document.getElementById('actuDate').value = actu.date;
    document.getElementById('actuAuthor').value = actu.author || '';
    document.getElementById('actuHomepage').checked = actu.homepage !== false;
  } else {
    document.getElementById('actuModalTitle').textContent = 'Nouvelle Actualité';
    actuForm.reset();
    // Set today's date as default
    document.getElementById('actuDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('actuHomepage').checked = true;
  }
}

function closeActuModalFunc() {
  actuModal.classList.remove('active');
  actuModal.style.display = 'none';
  actuForm.reset();
}

function editActu(id) {
  const actu = actus.find(a => a.id === id);
  if (actu) {
    openActuModal(actu);
  }
}

function deleteActu(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
    deleteActuAPI(id).then(() => {
      actus = actus.filter(a => a.id !== id);
      renderActus();
    });
  }
}

addActuBtn.addEventListener('click', () => openActuModal());
closeActuModal.addEventListener('click', closeActuModalFunc);
cancelActu.addEventListener('click', closeActuModalFunc);

actuForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(actuForm);
  const actuData = {
    id: formData.get('id') ? parseInt(formData.get('id')) : undefined,
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    image: formData.get('image'),
    category: formData.get('category'),
    date: formData.get('date'),
    author: formData.get('author') || 'Second Wind Team',
    homepage: document.getElementById('actuHomepage').checked
  };

  const savedActu = await saveActu(actuData);
  
  if (savedActu) {
    if (actuData.id) {
      const index = actus.findIndex(a => a.id === actuData.id);
      actus[index] = savedActu;
    } else {
      actus.push(savedActu);
    }
    renderActus();
    closeActuModalFunc();
  }
});

// Close modals on outside click
projectModal.addEventListener('click', (e) => {
  if (e.target === projectModal) {
    closeProjectModalFunc();
  }
});

actuModal.addEventListener('click', (e) => {
  if (e.target === actuModal) {
    closeActuModalFunc();
  }
});

// ========================================
// INITIALIZE
// ========================================

// Load data from API on startup
fetchProjects();
fetchActus();

// Check if already logged in
if (localStorage.getItem('adminLoggedIn') === 'true') {
  loginScreen.style.display = 'none';
  adminDashboard.style.display = 'block';
}

// ========================================
// API FUNCTIONS (for production use)
// ========================================

// These functions would be used to connect to a real backend
// Example structure:

/*
async function fetchProjects() {
  try {
    const response = await fetch('/api/projects');
    projects = await response.json();
    renderProjects();
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
}

async function saveProject(projectData) {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving project:', error);
  }
}

async function updateProject(id, projectData) {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating project:', error);
  }
}

async function deleteProjectAPI(id) {
  try {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting project:', error);
  }
}

// Similar functions for actus...
*/
