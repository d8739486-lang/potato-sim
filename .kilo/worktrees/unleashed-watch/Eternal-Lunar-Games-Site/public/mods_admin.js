/* mods_admin.js - Logic for Mods Management in Admin Panel */

let modsData = [];

function getSupabase() {
    if (window._sbClient) return window._sbClient;
    if (window.supabase && window.supabase.createClient) {
        window._sbClient = window.supabase.createClient(
            'https://wqcstpgssapruhxfrxen.supabase.co',
            'sb_publishable_69qcMTynbEjn0O32lgs0pw_IedYqSJI'
        );
    }
    return window._sbClient;
}

async function loadMods() {
    const { data, error } = await getSupabase().from('mods').select('*').order('created_at', { ascending: false });
    if (!error && data) {
        modsData = data;
        renderModsGrid();
    }
}

function renderModsGrid() {
    const grid = document.getElementById('modsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (modsData.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">No mods found. Create one!</div>';
        return;
    }

    modsData.forEach(mod => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.style.height = 'auto';
        card.style.minHeight = '140px';
        card.onclick = () => openModEditor(mod);

        const platforms = (() => { try { return JSON.parse(mod.platforms || '[]'); } catch { return []; } })();
        const mcVersions = (() => { try { return JSON.parse(mod.mc_versions || '[]'); } catch { return []; } })();
        const tags = (() => { try { return JSON.parse(mod.tags || '[]'); } catch { return []; } })();
        const fileSize = formatFileSize(mod.file_size);

        card.innerHTML = `
            <div style="display:flex;gap:14px;align-items:flex-start;">
                ${mod.icon_url
                ? `<img src="${mod.icon_url}" style="width:48px;height:48px;border-radius:12px;object-fit:cover;border:1px solid var(--border-color);flex-shrink:0;" alt="icon">`
                : `<div style="width:48px;height:48px;border-radius:12px;background:rgba(249,115,22,0.15);border:1px solid rgba(249,115,22,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <svg viewBox="0 0 24 24" style="width:22px;height:22px;stroke:var(--accent-blue);fill:none;stroke-width:2;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                       </div>`
            }
                <div style="flex:1;min-width:0;">
                    <div style="font-size:16px;font-weight:700;color:var(--text-main);margin-bottom:4px;">${mod.title}</div>
                    <div style="font-size:12px;color:var(--text-muted);line-height:1.4;margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${mod.short_description || 'Нет описания'}</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;">
                        ${platforms.slice(0, 2).map(p => `<span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;background:rgba(249,115,22,0.1);color:#fdba74;border:1px solid rgba(249,115,22,0.2);">${p}</span>`).join('')}
                        ${mcVersions.length > 0 ? `<span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;background:rgba(56,189,248,0.1);color:#7dd3fc;border:1px solid rgba(56,189,248,0.2);">${mcVersions[0]}</span>` : ''}
                        ${fileSize ? `<span style="font-size:11px;color:var(--text-muted);margin-left:4px;">${fileSize}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function formatFileSize(sizeStr) {
    if (!sizeStr) return '';
    const match = sizeStr.match(/(\d+)/);
    if (!match) return sizeStr;
    const kb = parseInt(match[1]);
    if (kb >= 1024) return (kb / 1024).toFixed(2).replace(/\.?0+$/, '') + ' MB';
    return kb + ' KB';
}

let currentEditingMod = null;

function openModEditor(mod = null) {
    currentEditingMod = mod;
    const modal = document.getElementById('modEditorModal');

    document.getElementById('modEditorTitle').innerText = mod ? 'Edit Mod' : 'New Mod';

    document.getElementById('modTitleInput').value = mod ? mod.title : '';
    document.getElementById('modSlugInput').value = mod ? mod.slug : '';
    document.getElementById('modShortDescInput').value = mod ? mod.short_description : '';
    document.getElementById('modLongDescInput').value = mod ? mod.long_description : '';
    document.getElementById('modIconInput').value = mod ? mod.icon_url : '';

    const platforms = mod ? JSON.parse(mod.platforms || '[]').join(', ') : '';
    const mcVersions = mod ? JSON.parse(mod.mc_versions || '[]').join(', ') : '';
    const tags = mod ? JSON.parse(mod.tags || '[]').join(', ') : '';

    document.getElementById('modPlatformsInput').value = platforms;
    document.getElementById('modMcVersionsInput').value = mcVersions;
    document.getElementById('modTagsInput').value = tags;

    // File inputs
    document.getElementById('modFileUrlInput').value = mod && mod.file_url ? mod.file_url : '';
    document.getElementById('modFileSizeInput').value = mod && mod.file_size ? mod.file_size : '';
    document.getElementById('modFileNameDisplay').innerText = mod && mod.file_url ? (mod.file_size ? `File uploaded (${mod.file_size})` : 'File uploaded') : 'No file chosen';
    document.getElementById('modFileInputRaw').value = '';

    // Buttons
    const DEFAULT_BTNS = [
        { label: 'Скачать мод', url: '', enabled: true, style: 'primary' },
        { label: 'Посмотреть на GitHub', url: '', enabled: false, style: 'secondary' },
        { label: 'Поддержать автора', url: '', enabled: false, style: 'secondary' },
    ];
    let btns = DEFAULT_BTNS;
    if (mod && mod.buttons) {
        try { btns = JSON.parse(mod.buttons); } catch { }
    }
    for (let i = 0; i < 3; i++) {
        const b = btns[i] || DEFAULT_BTNS[i];
        document.getElementById(`modBtn${i}Enabled`).checked = !!b.enabled;
        document.getElementById(`modBtn${i}Label`).value = b.label || '';
        document.getElementById(`modBtn${i}Url`).value = b.url || '';
        const sel = document.getElementById(`modBtn${i}Style`);
        sel.value = b.style === 'primary' ? 'primary' : 'secondary';
        renderModButtonPreview(i);
    }

    if (mod && mod.icon_url) {
        document.getElementById('modIconDropZone').classList.add('has-image');
        document.getElementById('modIconPreview').src = mod.icon_url;
    } else {
        document.getElementById('modIconDropZone').classList.remove('has-image');
        document.getElementById('modIconPreview').removeAttribute('src');
    }

    if (mod) {
        document.getElementById('modDeleteBtn').style.display = 'block';
    } else {
        document.getElementById('modDeleteBtn').style.display = 'none';
    }

    modal.classList.add('active');

    // Always reset save button state on open
    const saveBtn = document.getElementById('saveModBtn');
    if (saveBtn) {
        saveBtn.innerHTML = mod ? '<span>Save Changes</span>' : '<span>Upload Mod</span>';
        saveBtn.style.pointerEvents = '';
        saveBtn.style.opacity = '';
    }
}

function closeModEditor() {
    document.getElementById('modEditorModal').classList.remove('active');
    currentEditingMod = null;
}

async function saveMod() {
    const btn = document.getElementById('saveModBtn');
    const title = document.getElementById('modTitleInput').value.trim();
    const slug = document.getElementById('modSlugInput').value.trim();
    const short_desc = document.getElementById('modShortDescInput').value.trim();
    const long_desc = document.getElementById('modLongDescInput').value.trim();
    const icon_url = document.getElementById('modIconInput').value.trim();

    const platforms = JSON.stringify(document.getElementById('modPlatformsInput').value.split(',').map(s => s.trim()).filter(Boolean));
    const mc_versions = JSON.stringify(document.getElementById('modMcVersionsInput').value.split(',').map(s => s.trim()).filter(Boolean));
    const tags = JSON.stringify(document.getElementById('modTagsInput').value.split(',').map(s => s.trim()).filter(Boolean));
    let file_url = document.getElementById('modFileUrlInput').value.trim();
    const buttons = JSON.stringify(getModButtons());
    let file_size = document.getElementById('modFileSizeInput').value.trim();

    if (!title || !slug) {
        if (typeof showToast === 'function') showToast('Title and Slug are required!');
        return;
    }

    // If a file is selected but not yet uploaded, upload it first
    const fileInput = document.getElementById('modFileInputRaw');
    if (fileInput.files && fileInput.files.length > 0) {
        const originalText = btn ? btn.innerHTML : '';
        if (btn) {
            btn.innerHTML = '<span>Uploading...</span>';
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.7';
        }
        try {
            const file = fileInput.files[0];
            const sizeKb = Math.round(file.size / 1024);
            const sizeStr = sizeKb >= 1024 ? (sizeKb / 1024).toFixed(2).replace(/\.?0+$/, '') + ' MB' : sizeKb + ' KB';
            const slug = document.getElementById('modSlugInput').value.trim() || 'mod';
            const ext = file.name.split('.').pop() || 'jar';
            const fileName = `mods/${slug}.${ext}`;

            const { data, error } = await getSupabase().storage
                .from('project_files')
                .upload(fileName, file, { upsert: true });

            if (error) {
                if (typeof showToast === 'function') showToast('Error uploading file: ' + error.message);
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.style.pointerEvents = '';
                    btn.style.opacity = '';
                }
                return;
            }

            const { data: urlData } = getSupabase().storage.from('project_files').getPublicUrl(fileName);
            file_url = urlData.publicUrl;
            file_size = sizeStr;
            document.getElementById('modFileUrlInput').value = file_url;
            document.getElementById('modFileSizeInput').value = file_size;
            document.getElementById('modFileNameDisplay').innerText = `${file.name} (${sizeStr})`;
        } catch (err) {
            if (typeof showToast === 'function') showToast('Upload failed: ' + err.message);
            if (btn) {
                btn.innerHTML = originalText;
                btn.style.pointerEvents = '';
                btn.style.opacity = '';
            }
            return;
        }
    }

    if (btn) {
        btn.innerHTML = '<span>Saving...</span>';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';
    }

    const payload = {
        title, slug, short_description: short_desc, long_description: long_desc,
        icon_url, platforms, mc_versions, tags, file_url, file_size, buttons,
        status: 'Active', downloads: 0, followers: 0, changelog: '', links: '{}'
    };

    try {
        if (currentEditingMod) {
            const { error } = await getSupabase().from('mods').update(payload).eq('id', currentEditingMod.id);
            if (error) {
                if (typeof showToast === 'function') showToast('Error updating mod: ' + error.message);
                resetBtn();
                return;
            }
            if (typeof showToast === 'function') showToast('Mod updated!');
        } else {
            const { error } = await getSupabase().from('mods').insert([payload]);
            if (error) {
                if (typeof showToast === 'function') showToast('Error creating mod: ' + error.message);
                resetBtn();
                return;
            }
            if (typeof showToast === 'function') showToast('Mod uploaded!');
        }

        // Reset file input
        fileInput.value = '';
        document.getElementById('modFileNameDisplay').innerText = 'No file chosen';
        resetBtn();
        closeModEditor();
        loadMods();
    } catch (err) {
        if (typeof showToast === 'function') showToast('Error: ' + err.message);
        resetBtn();
    }

    function resetBtn() {
        if (btn) {
            btn.innerHTML = currentEditingMod ? '<span>Save Changes</span>' : '<span>Upload Mod</span>';
            btn.style.pointerEvents = '';
            btn.style.opacity = '';
        }
    }
}

async function deleteMod() {
    if (!currentEditingMod) return;
    if (!confirm('Are you sure you want to delete this mod?')) return;

    // Try to remove file from storage if exists
    if (currentEditingMod.file_url) {
        try {
            const url = new URL(currentEditingMod.file_url);
            const pathParts = url.pathname.split('/storage/v1/object/public/project_files/');
            if (pathParts.length > 1) {
                const filePath = pathParts[1];
                await getSupabase().storage.from('project_files').remove([filePath]);
            }
        } catch (e) { /* ignore storage cleanup errors */ }
    }

    // Try to remove icon from storage if exists
    if (currentEditingMod.icon_url) {
        try {
            const url = new URL(currentEditingMod.icon_url);
            const pathParts = url.pathname.split('/storage/v1/object/public/project_files/');
            if (pathParts.length > 1) {
                const filePath = pathParts[1];
                await getSupabase().storage.from('project_files').remove([filePath]);
            }
        } catch (e) { /* ignore storage cleanup errors */ }
    }

    const { error } = await getSupabase().from('mods').delete().eq('id', currentEditingMod.id);
    if (error) {
        if (typeof showToast === 'function') showToast('Error deleting mod: ' + error.message);
        return;
    }

    if (typeof showToast === 'function') showToast('Mod deleted!');
    closeModEditor();
    loadMods();
}

function autoGenerateSlug() {
    const titleInput = document.getElementById('modTitleInput');
    const slugInput = document.getElementById('modSlugInput');
    // Only auto-generate if slug is empty or matches previous auto-generation
    // For simplicity, just update if it's new
    if (!currentEditingMod && document.activeElement === titleInput) {
        let slug = titleInput.value.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        slugInput.value = slug;
    }
}

function getModButtons() {
    const btns = [];
    for (let i = 0; i < 3; i++) {
        btns.push({
            label: document.getElementById(`modBtn${i}Label`).value.trim() || `Кнопка ${i + 1}`,
            url: document.getElementById(`modBtn${i}Url`).value.trim(),
            enabled: document.getElementById(`modBtn${i}Enabled`).checked,
            style: document.getElementById(`modBtn${i}Style`).value,
        });
    }
    return btns;
}

function renderModButtonPreview(i) {
    const preview = document.getElementById(`modBtn${i}Preview`);
    if (!preview) return;
    const enabled = document.getElementById(`modBtn${i}Enabled`).checked;
    const label = document.getElementById(`modBtn${i}Label`).value.trim() || `Кнопка ${i + 1}`;
    const style = document.getElementById(`modBtn${i}Style`).value;

    if (!enabled) {
        preview.innerHTML = '<span style="font-size:11px;color:var(--text-muted);font-family:\'Inter\',sans-serif;">Отключена — не будет показана</span>';
        return;
    }

    const baseStyle = `display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:8px 18px;border-radius:12px;font-size:13px;font-weight:700;font-family:'Inter',sans-serif;white-space:nowrap;line-height:1;`;

    if (style === 'primary') {
        preview.innerHTML = `<div style="${baseStyle}background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;box-shadow:0 4px 14px rgba(249,115,22,0.4);">
            <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#fff;fill:none;stroke-width:2.5;flex-shrink:0;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>${label}</span>
        </div>`;
    } else {
        preview.innerHTML = `<div style="${baseStyle}background:rgba(255,255,255,0.06);color:#cbd5e1;border:1px solid rgba(255,255,255,0.12);backdrop-filter:blur(4px);">
            <svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:#94a3b8;fill:none;stroke-width:2;flex-shrink:0;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>${label}</span>
        </div>`;
    }
}

async function handleModFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Calculate size in KB
    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb >= 1024 ? (sizeKb / 1024).toFixed(2).replace(/\.?0+$/, '') + ' MB' : sizeKb + ' KB';

    document.getElementById('modFileNameDisplay').innerText = `Uploading ${file.name}...`;

    const slug = currentEditingMod ? (currentEditingMod.slug || 'mod') : 'mod';
    const ext = file.name.split('.').pop() || 'jar';
    const fileName = `mods/${slug}.${ext}`;

    const { data, error } = await getSupabase().storage
        .from('project_files')
        .upload(fileName, file, { upsert: true });

    if (error) {
        showToast('Error uploading file: ' + error.message);
        document.getElementById('modFileNameDisplay').innerText = 'Upload failed';
        return;
    }

    const { data: urlData } = getSupabase().storage.from('project_files').getPublicUrl(fileName);

    document.getElementById('modFileUrlInput').value = urlData.publicUrl;
    document.getElementById('modFileSizeInput').value = sizeStr;
    document.getElementById('modFileNameDisplay').innerText = `${file.name} (${sizeStr})`;
    showToast('Mod file uploaded successfully!');
}

// ─── Tag / Mechanic Picker ────────────────────────────────────────────────────
const MOD_TAG_CATEGORIES = {
    'Жанры': ['QoL', 'Adventure', 'Magic', 'Tech', 'RPG', 'Survival', 'Combat', 'Exploration', 'Building', 'Automation', 'Vanilla+', 'Hardcore', 'Cosmetic', 'Economy', 'Multiplayer']
};

let selectedModTags = [];

function renderTagPicker() {
    const container = document.getElementById('modTagsPicker');
    if (!container) return;
    container.innerHTML = '';

    for (const [category, tags] of Object.entries(MOD_TAG_CATEGORIES)) {
        const catLabel = document.createElement('div');
        catLabel.className = 'tag-chip-category';
        catLabel.textContent = category;
        container.appendChild(catLabel);

        tags.forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'tag-chip' + (selectedModTags.includes(tag) ? ' selected' : '');
            chip.textContent = tag;
            chip.onclick = () => toggleModTag(tag);
            container.appendChild(chip);
        });
    }
}

function toggleModTag(tag) {
    const idx = selectedModTags.indexOf(tag);
    if (idx >= 0) {
        selectedModTags.splice(idx, 1);
    } else {
        selectedModTags.push(tag);
    }
    syncTagsToInput();
    renderTagPicker();
}

function syncTagsToInput() {
    document.getElementById('modTagsInput').value = selectedModTags.join(', ');
}

function syncTagsFromInput() {
    const val = document.getElementById('modTagsInput').value.trim();
    if (!val) {
        selectedModTags = [];
    } else {
        selectedModTags = val.split(',').map(s => s.trim()).filter(Boolean);
    }
    renderTagPicker();
}

function handleModTagKey(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const input = document.getElementById('modTagsInput');
        const val = input.value.trim();
        if (!val) return;
        const parts = val.split(',').map(s => s.trim()).filter(Boolean);
        parts.forEach(p => {
            if (!selectedModTags.includes(p)) selectedModTags.push(p);
        });
        input.value = '';
        syncTagsToInput();
        renderTagPicker();
    }
}

// Override openModEditor to also init tag picker
const _origOpenModEditor = openModEditor;
openModEditor = function (mod) {
    _origOpenModEditor(mod);
    const tags = mod ? (typeof mod.tags === 'string' ? JSON.parse(mod.tags || '[]') : (mod.tags || [])) : [];
    selectedModTags = Array.isArray(tags) ? [...tags] : [];
    renderTagPicker();
    // Show tags in input
    document.getElementById('modTagsInput').value = selectedModTags.join(', ');
};

// Hook into existing switchSection to load mods when tab is clicked
const originalSwitchSection = window.switchSection;
window.switchSection = function (sectionId, element) {
    if (originalSwitchSection) originalSwitchSection(sectionId, element);
    if (sectionId === 'mods-section') {
        loadMods();
    }
}

// Initial load if mods section is active
setTimeout(() => {
    if (document.getElementById('mods-section') && document.getElementById('mods-section').classList.contains('active')) {
        loadMods();
    }
}, 500);
