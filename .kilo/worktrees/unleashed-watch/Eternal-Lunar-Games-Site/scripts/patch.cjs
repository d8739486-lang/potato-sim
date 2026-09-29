const fs = require('fs');

const path = 'public/ApiKey_generator.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject Supabase Script Tag
const supabaseScript = `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
    const supabaseUrl = 'https://wqcstpgssapruhxfrxen.supabase.co';
    const supabaseKey = 'sb_publishable_69qcMTynbEjn0O32lgs0pw_IedYqSJI';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
</script>
`;
if (!content.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js@2')) {
    content = content.replace('</body>', `${supabaseScript}\n</body>`);
}

// 2. Replace renderProjectsGrid
const newRenderProjectsGrid = `
    async function renderProjectsGrid() {
        const grid = document.getElementById('projectsGrid');
        grid.innerHTML = '<div style="color:var(--text-muted)">Loading...</div>';

        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching projects:', error);
            showToast('Error loading projects');
            return;
        }
        projects = data || [];

        grid.innerHTML = '';
        if (projects.length === 0) {
            grid.innerHTML = '<div style="color:var(--text-muted)">No projects/games found.</div>';
            return;
        }

        projects.forEach(p => {
            const keysCount = apiKeys.filter(k => k.project === p.title).length;
            const card = document.createElement('div');
            const isDisabled = p.status === 'Disabled';
            card.className = \`project-card \${isDisabled ? 'is-disabled' : ''}\`;
            card.onclick = () => openProjectDetailsModal(p.id);

            card.innerHTML = \`
                <div>
                    <div class="project-title">\${p.title} <span style="font-size:10px; color:var(--text-muted)">(\${p.type || 'game'})</span></div>
                    <div class="project-desc">\${p.desc || p.description || 'No description provided.'}</div>
                </div>
                <div class="project-meta">
                    <span>\${keysCount} \${keysCount === 1 ? 'API Key' : 'API Keys'}</span>
                    <span class="badge-tier \${isDisabled ? 'disabled' : ''}">\${p.status || 'Active'}</span>
                </div>
            \`;
            grid.appendChild(card);
        });
    }
`;
content = content.replace(/function renderProjectsGrid\(\) \{[\s\S]*?\}\n\n/g, newRenderProjectsGrid + '\n\n');

// 3. Replace handleCreateProject
const newHandleCreateProject = `
    async function handleCreateProject() {
        const title = document.getElementById('projectTitleInput').value.trim() || 'New Project';
        const desc = document.getElementById('projectDescInput').value.trim() || 'Workspace project.';
        const type = document.getElementById('projectTypeInput').value;
        const cover_url = document.getElementById('projectCoverInput').value.trim();
        const link = document.getElementById('projectLinkInput').value.trim();
        const status = document.getElementById('projectStatusInput').value;

        const { error } = await supabase.from('projects').insert([{
            title: title,
            description: desc,
            type: type,
            cover_url: cover_url,
            link: link,
            status: status
        }]);
        
        if (error) {
            showToast('Error creating project!');
            console.error(error);
            return;
        }

        renderProjectsGrid();
        closeNewProjectModal();
        showToast(\`Project "\${title}" created!\`);
    }
`;
content = content.replace(/function handleCreateProject\(\) \{[\s\S]*?\}\n\n/g, newHandleCreateProject + '\n\n');

// 4. Replace handleSaveProjectEdits
const newHandleSaveProjectEdits = `
    async function handleSaveProjectEdits() {
        if (!currentSelectedProjectId) return;
        const p = projects.find(item => item.id === currentSelectedProjectId);
        if (!p) return;

        const oldTitle = p.title;
        const newTitle = document.getElementById('pDetailTitleInput').value.trim() || oldTitle;
        const newDesc = document.getElementById('pDetailDescInput').value.trim();
        const newType = document.getElementById('pDetailTypeInput').value;
        const newCover = document.getElementById('pDetailCoverInput').value.trim();
        const newLink = document.getElementById('pDetailLinkInput').value.trim();
        const newStatus = document.getElementById('pDetailStatusInput').value;

        const { error } = await supabase.from('projects').update({
            title: newTitle,
            description: newDesc,
            type: newType,
            cover_url: newCover,
            link: newLink,
            status: newStatus
        }).eq('id', p.id);

        if (error) {
            showToast('Error updating project!');
            return;
        }

        // Sync linked keys project name (locally)
        apiKeys.forEach(k => {
            if (k.project === oldTitle) k.project = newTitle;
        });

        saveKeys();
        renderProjectsGrid();
        renderKeysTable();
        closeProjectDetailsModal();
        showToast('Project updated successfully!');
    }
`;
content = content.replace(/function handleSaveProjectEdits\(\) \{[\s\S]*?\}\n\n/g, newHandleSaveProjectEdits + '\n\n');

// 5. Replace handleDeleteCurrentProject
const newHandleDeleteCurrentProject = `
    async function handleDeleteCurrentProject() {
        if (!currentSelectedProjectId) return;
        const p = projects.find(item => item.id === currentSelectedProjectId);
        if (!p) return;

        const { error } = await supabase.from('projects').delete().eq('id', p.id);
        
        if (error) {
            showToast('Error deleting project!');
            return;
        }

        renderProjectsGrid();
        closeProjectDetailsModal();
        showToast(\`Project "\${p.title}" deleted.\`);
    }
`;
content = content.replace(/function handleDeleteCurrentProject\(\) \{[\s\S]*?\}\n\n/g, newHandleDeleteCurrentProject + '\n\n');

// 6. Update openProjectDetailsModal to populate new fields
const newOpenProjectDetailsModal = `
    function openProjectDetailsModal(id) {
        const p = projects.find(item => item.id === id);
        if (!p) return;

        currentSelectedProjectId = id;
        document.getElementById('pDetailTitleInput').value = p.title;
        document.getElementById('pDetailDescInput').value = p.description || p.desc || '';
        document.getElementById('pDetailTypeInput').value = p.type || 'game';
        document.getElementById('pDetailCoverInput').value = p.cover_url || '';
        document.getElementById('pDetailLinkInput').value = p.link || '';
        document.getElementById('pDetailStatusInput').value = p.status || 'Active';
        
        const count = apiKeys.filter(k => k.project === p.title).length;
        document.getElementById('pDetailKeysCount').innerText = \`\${count} \${count === 1 ? 'Key' : 'Keys'} Linked\`;

        document.getElementById('projectDetailsModal').classList.add('active');
    }
`;
content = content.replace(/function openProjectDetailsModal\(id\) \{[\s\S]*?\}\n\n/g, newOpenProjectDetailsModal + '\n\n');


// Also remove the old \`let projects = JSON.parse(localStorage.getItem('studio_projects')) || defaultProjects;\` initialization
// to avoid conflicts, and change it to just \`let projects = [];\`
content = content.replace(
    /let projects = JSON\.parse\(localStorage\.getItem\('studio_projects'\)\) \|\| defaultProjects;/g, 
    "let projects = [];"
);


fs.writeFileSync(path, content, 'utf8');
console.log('Patch complete.');
