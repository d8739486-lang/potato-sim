const fs = require('fs');

const path = 'public/ApiKey_generator.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace Link group in New Project Modal
const newProjectModalTarget = `            <div class="form-group">
                <label>Link (Play/Download)</label>
                <input type="text" id="projectLinkInput" class="form-input" placeholder="e.g. /games/pc-master or https://...">
            </div>`;

const newProjectModalReplacement = `            <div class="form-group" id="gameLinkGroup">
                <label>Web Link (Play Game)</label>
                <input type="text" id="projectLinkInput" class="form-input" placeholder="e.g. https://...">
            </div>

            <div class="form-group" id="modFileGroup" style="display:none;">
                <label>Upload Mod File (.jar, .zip)</label>
                <input type="file" id="projectFileInput" class="form-input" accept=".jar,.zip,.rar">
            </div>

            <div id="modSettingsGroup" style="display:none; flex-direction:column; gap:16px; margin-bottom:16px;">
                <div class="form-group" style="margin-bottom:0;">
                    <label>Minecraft Version</label>
                    <input type="text" id="projectMcVersion" class="form-input" placeholder="e.g. 1.20.1">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Modloader</label>
                    <select id="projectModloader" class="form-select">
                        <option value="Forge">Forge</option>
                        <option value="Fabric">Fabric</option>
                        <option value="Quilt">Quilt</option>
                        <option value="NeoForge">NeoForge</option>
                    </select>
                </div>
            </div>`;

content = content.replace(newProjectModalTarget, newProjectModalReplacement);

// 2. Replace Link group in Detail Modal
const detailModalTarget = `            <div class="form-group">
                <label>Link (Play/Download)</label>
                <input type="text" id="pDetailLinkInput" class="form-input">
            </div>`;

const detailModalReplacement = `            <div class="form-group" id="pDetailGameLinkGroup">
                <label>Web Link (Play Game)</label>
                <input type="text" id="pDetailLinkInput" class="form-input">
            </div>

            <div class="form-group" id="pDetailModFileGroup" style="display:none;">
                <label>Upload New Mod File (Leave empty to keep current)</label>
                <input type="file" id="pDetailFileInput" class="form-input" accept=".jar,.zip,.rar">
                <div id="pDetailCurrentFile" style="font-size:12px; color:var(--accent-blue); margin-top:4px;"></div>
            </div>

            <div id="pDetailModSettingsGroup" style="display:none; flex-direction:column; gap:16px; margin-bottom:16px;">
                <div class="form-group" style="margin-bottom:0;">
                    <label>Minecraft Version</label>
                    <input type="text" id="pDetailMcVersion" class="form-input">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Modloader</label>
                    <select id="pDetailModloader" class="form-select">
                        <option value="Forge">Forge</option>
                        <option value="Fabric">Fabric</option>
                        <option value="Quilt">Quilt</option>
                        <option value="NeoForge">NeoForge</option>
                    </select>
                </div>
            </div>`;

content = content.replace(detailModalTarget, detailModalReplacement);

// 3. Add Event Listeners to JS
const toggleScript = `
    document.getElementById('projectTypeInput').addEventListener('change', (e) => {
        const isMod = e.target.value === 'mod';
        document.getElementById('gameLinkGroup').style.display = isMod ? 'none' : 'block';
        document.getElementById('modFileGroup').style.display = isMod ? 'block' : 'none';
        document.getElementById('modSettingsGroup').style.display = isMod ? 'flex' : 'none';
    });

    document.getElementById('pDetailTypeInput').addEventListener('change', (e) => {
        const isMod = e.target.value === 'mod';
        document.getElementById('pDetailGameLinkGroup').style.display = isMod ? 'none' : 'block';
        document.getElementById('pDetailModFileGroup').style.display = isMod ? 'block' : 'none';
        document.getElementById('pDetailModSettingsGroup').style.display = isMod ? 'flex' : 'none';
    });

    async function uploadFileToSupabase(file) {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = Date.now() + '_' + Math.random().toString(36).substring(7) + '.' + fileExt;
        
        const { data, error } = await supabase.storage
            .from('project_files')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });
            
        if (error) {
            console.error('Upload error:', error);
            throw error;
        }
        
        const { data: publicUrlData } = supabase.storage
            .from('project_files')
            .getPublicUrl(fileName);
            
        return publicUrlData.publicUrl;
    }
`;
content = content.replace('let activeRawKey = \'\';', 'let activeRawKey = \'\';\n' + toggleScript);

// 4. Update handleCreateProject
const newHandleCreateProject = `
    async function handleCreateProject() {
        const title = document.getElementById('projectTitleInput').value.trim() || 'New Project';
        const desc = document.getElementById('projectDescInput').value.trim() || 'Workspace project.';
        const type = document.getElementById('projectTypeInput').value;
        const cover_url = document.getElementById('projectCoverInput').value.trim();
        const status = document.getElementById('projectStatusInput').value;
        
        let finalLink = document.getElementById('projectLinkInput').value.trim();
        let mc_version = null;
        let modloader = null;

        if (type === 'mod') {
            const fileInput = document.getElementById('projectFileInput');
            if (fileInput.files.length > 0) {
                try {
                    showToast('Uploading file...');
                    finalLink = await uploadFileToSupabase(fileInput.files[0]);
                } catch(e) {
                    showToast('Failed to upload file!');
                    return;
                }
            }
            mc_version = document.getElementById('projectMcVersion').value.trim();
            modloader = document.getElementById('projectModloader').value;
        }

        const { error } = await supabase.from('projects').insert([{
            title: title,
            description: desc,
            type: type,
            cover_url: cover_url,
            link: finalLink,
            status: status,
            mc_version: mc_version,
            modloader: modloader
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
content = content.replace(/async function handleCreateProject\(\) \{[\s\S]*?\}\n\n/g, newHandleCreateProject + '\n\n');

// 5. Update openProjectDetailsModal
const newOpenProjectDetailsModal = `
    function openProjectDetailsModal(id) {
        const p = projects.find(item => item.id === id);
        if (!p) return;

        currentSelectedProjectId = id;
        document.getElementById('pDetailTitleInput').value = p.title;
        document.getElementById('pDetailDescInput').value = p.description || p.desc || '';
        document.getElementById('pDetailTypeInput').value = p.type || 'game';
        document.getElementById('pDetailCoverInput').value = p.cover_url || '';
        document.getElementById('pDetailStatusInput').value = p.status || 'Active';
        
        // Trigger change event to set visibility
        document.getElementById('pDetailTypeInput').dispatchEvent(new Event('change'));

        if (p.type === 'mod') {
            document.getElementById('pDetailMcVersion').value = p.mc_version || '';
            document.getElementById('pDetailModloader').value = p.modloader || 'Forge';
            document.getElementById('pDetailCurrentFile').innerText = p.link ? 'Current file uploaded' : 'No file uploaded yet';
        } else {
            document.getElementById('pDetailLinkInput').value = p.link || '';
        }
        
        const count = apiKeys.filter(k => k.project === p.title).length;
        document.getElementById('pDetailKeysCount').innerText = \`\${count} \${count === 1 ? 'Key' : 'Keys'} Linked\`;

        document.getElementById('projectDetailsModal').classList.add('active');
    }
`;
content = content.replace(/function openProjectDetailsModal\(id\) \{[\s\S]*?\}\n\n/g, newOpenProjectDetailsModal + '\n\n');

// 6. Update handleSaveProjectEdits
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
        const newStatus = document.getElementById('pDetailStatusInput').value;

        let finalLink = p.link;
        let mc_version = null;
        let modloader = null;

        if (newType === 'mod') {
            const fileInput = document.getElementById('pDetailFileInput');
            if (fileInput.files.length > 0) {
                try {
                    showToast('Uploading new file...');
                    finalLink = await uploadFileToSupabase(fileInput.files[0]);
                } catch(e) {
                    showToast('Failed to upload file!');
                    return;
                }
            }
            mc_version = document.getElementById('pDetailMcVersion').value.trim();
            modloader = document.getElementById('pDetailModloader').value;
        } else {
            finalLink = document.getElementById('pDetailLinkInput').value.trim();
        }

        const { error } = await supabase.from('projects').update({
            title: newTitle,
            description: newDesc,
            type: newType,
            cover_url: newCover,
            link: finalLink,
            status: newStatus,
            mc_version: mc_version,
            modloader: modloader
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
content = content.replace(/async function handleSaveProjectEdits\(\) \{[\s\S]*?\}\n\n/g, newHandleSaveProjectEdits + '\n\n');

fs.writeFileSync(path, content, 'utf8');
console.log('HTML patched for mods functionality.');
