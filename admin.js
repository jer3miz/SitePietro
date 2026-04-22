// ========================================
// ADMIN INTERFACE FUNCTIONALITY
// ========================================

const API_URL = '/api';

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

let projects = [];
let actus = [];

// ========================================
// AUTH HELPERS
// ========================================

function getToken() {
  return localStorage.getItem('adminToken');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

function showDashboard(username) {
  loginScreen.style.display = 'none';
  adminDashboard.style.display = 'block';
  document.getElementById('adminUsername').textContent = username;
  fetchProjects();
  fetchActus();
}

function showLogin() {
  loginScreen.style.display = 'flex';
  adminDashboard.style.display = 'none';
  localStorage.removeItem('adminToken');
}

// ========================================
// LOGIN & AUTHENTICATION
// ========================================

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const btn = loginForm.querySelector('button[type="submit"]');

  btn.disabled = true;
  btn.textContent = 'Connexion...';

  try {
    const res = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Identifiants incorrects');
      return;
    }

    localStorage.setItem('adminToken', data.token);
    showDashboard(data.username);
    loginForm.reset();
  } catch (err) {
    alert('Erreur de connexion au serveur');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Se connecter';
  }
});

logoutBtn.addEventListener('click', () => {
  showLogin();
  loginForm.reset();
});

// Vérifier le token au chargement
(async () => {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/auth`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const { username } = await res.json();
      showDashboard(username);
    } else {
      showLogin();
    }
  } catch {
    showLogin();
  }
})();

// ========================================
// NAVIGATION
// ========================================

adminNavBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;

    if (section === 'site') {
      window.open('/', '_blank');
      return;
    }

    adminNavBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

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
      headers: authHeaders(),
      body: JSON.stringify(projectData)
    });

    if (response.status === 401) {
      alert('Session expirée, veuillez vous reconnecter.');
      showLogin();
      return null;
    }

    if (!response.ok) throw new Error('API error');
    return await response.json();
  } catch (error) {
    console.error('Error saving project:', error);
    alert('Erreur lors de la sauvegarde du projet.');
    return null;
  }
}

async function deleteProjectAPI(id) {
  try {
    const response = await fetch(`${API_URL}/projects?id=${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    if (response.status === 401) {
      alert('Session expirée, veuillez vous reconnecter.');
      showLogin();
    }
  } catch (error) {
    console.error('Error deleting project:', error);
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
      headers: authHeaders(),
      body: JSON.stringify(actuData)
    });

    if (response.status === 401) {
      alert('Session expirée, veuillez vous reconnecter.');
      showLogin();
      return null;
    }

    if (!response.ok) throw new Error('API error');
    return await response.json();
  } catch (error) {
    console.error('Error saving actu:', error);
    alert('Erreur lors de la sauvegarde de l\'actualité.');
    return null;
  }
}

async function deleteActuAPI(id) {
  try {
    const response = await fetch(`${API_URL}/actus?id=${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    if (response.status === 401) {
      alert('Session expirée, veuillez vous reconnecter.');
      showLogin();
    }
  } catch (error) {
    console.error('Error deleting actu:', error);
  }
}

// ========================================
// PROJECTS MANAGEMENT
// ========================================

function renderProjects() {
  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = projects.map(project => {
    const tags = Array.isArray(project.tags) ? project.tags : [];
    return `
      <tr>
        <td><img src="${project.image || ''}" alt="" class="table-thumb"></td>
        <td>
          ${project.title}
          ${project.homepage ? '<br><small style="color: var(--blue); font-weight: 600;"><i class="fa-solid fa-home"></i> Page d\'accueil</small>' : ''}
        </td>
        <td>${project.description || ''}</td>
        <td>${tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</td>
        <td>
          <button class="btn-icon edit-project" data-id="${project.id}"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon delete-project" data-id="${project.id}"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');

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
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectImage').value = project.image || '';
    document.getElementById('projectViews').value = project.views || '';
    document.getElementById('projectEngagement').value = project.engagement || '';
    document.getElementById('projectConversion').value = project.conversion || '';
    const tags = Array.isArray(project.tags) ? project.tags : [];
    document.getElementById('projectTags').value = tags.join(', ');
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
  if (project) openProjectModal(project);
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
    tags: formData.get('tags').split(',').map(t => t.trim()).filter(Boolean),
    homepage: document.getElementById('projectHomepage').checked
  };

  const savedProject = await saveProject(projectData);
  if (savedProject) {
    if (projectData.id) {
      const index = projects.findIndex(p => p.id === projectData.id);
      if (index !== -1) projects[index] = savedProject;
    } else {
      projects.unshift(savedProject);
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
      <td><img src="${actu.image || ''}" alt="" class="table-thumb"></td>
      <td>
        ${actu.title}
        ${actu.homepage ? '<br><small style="color: var(--blue); font-weight: 600;"><i class="fa-solid fa-home"></i> Page d\'accueil</small>' : ''}
      </td>
      <td><span class="badge">${actu.category || ''}</span></td>
      <td>${formatDate(actu.date)}</td>
      <td>
        <button class="btn-icon edit-actu" data-id="${actu.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon delete-actu" data-id="${actu.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.edit-actu').forEach(btn => {
    btn.addEventListener('click', () => editActu(parseInt(btn.dataset.id)));
  });
  document.querySelectorAll('.delete-actu').forEach(btn => {
    btn.addEventListener('click', () => deleteActu(parseInt(btn.dataset.id)));
  });
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function openActuModal(actu = null) {
  actuModal.classList.add('active');
  actuModal.style.display = 'flex';

  if (actu) {
    document.getElementById('actuModalTitle').textContent = 'Modifier l\'Actualité';
    document.getElementById('actuId').value = actu.id;
    document.getElementById('actuTitle').value = actu.title;
    document.getElementById('actuExcerpt').value = actu.excerpt || '';
    document.getElementById('actuContent').value = actu.content || '';
    document.getElementById('actuImage').value = actu.image || '';
    document.getElementById('actuCategory').value = actu.category || '';
    document.getElementById('actuDate').value = actu.date ? actu.date.split('T')[0] : '';
    document.getElementById('actuAuthor').value = actu.author || '';
    document.getElementById('actuHomepage').checked = actu.homepage !== false;
  } else {
    document.getElementById('actuModalTitle').textContent = 'Nouvelle Actualité';
    actuForm.reset();
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
  if (actu) openActuModal(actu);
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
      if (index !== -1) actus[index] = savedActu;
    } else {
      actus.unshift(savedActu);
    }
    renderActus();
    closeActuModalFunc();
  }
});

projectModal.addEventListener('click', (e) => {
  if (e.target === projectModal) closeProjectModalFunc();
});

actuModal.addEventListener('click', (e) => {
  if (e.target === actuModal) closeActuModalFunc();
});
