/* projects_admin.js - Complete Realtime Logic for Projects/Games Management in Admin Panel */

function escapeHtmlAttr(str) {
    return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let projectsData = [];
let currentEditingProject = null;
let projectRealtimeChannel = null;

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

async function loadProjects() {
    const grid = document.getElementById('projectsGrid');
    if (grid && projectsData.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted);padding:20px 0;">Загрузка проектов...</div>';
    }

    try {
        const { data, error } = await getSupabase()
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            projectsData = data;
            window.projects = data; // sync with global if used by keys select
            renderProjectsGrid();
        } else {
            console.error('Failed to load projects:', error);
            if (typeof showToast === 'function') showToast('Ошибка загрузки проектов');
        }
    } catch (err) {
        console.error('Projects fetch error:', err);
    }

    // Subscribe to realtime changes once
    if (!projectRealtimeChannel && getSupabase()) {
        try {
            projectRealtimeChannel = getSupabase()
                .channel('public:projects:admin')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'projects' },
                    async () => {
                        const { data } = await getSupabase()
                            .from('projects')
                            .select('*')
                            .order('created_at', { ascending: false });
                        if (data) {
                            projectsData = data;
                            window.projects = data;
                            renderProjectsGrid();
                        }
                    }
                )
                .subscribe();
        } catch (e) {
            console.warn('Realtime subscription failed:', e);
        }
    }
}

function renderProjectsGrid() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (projectsData.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; padding: 40px 20px; text-align:center;">
                <div style="font-size:16px;font-weight:600;color:var(--text-main);margin-bottom:6px;">Нет проектов</div>
                <div style="font-size:13px;color:var(--text-muted);">Нажмите кнопку "New Project", чтобы выложить игру или проект в реальном времени.</div>
            </div>
        `;
        return;
    }

    projectsData.forEach(p => {
        const card = document.createElement('div');
        const isDisabled = p.status === 'Disabled';
        const hasChapters = p.display_type === 'chapters';
        let chaptersCount = 0;
        if (hasChapters && p.chapters) {
            try {
                const parsed = typeof p.chapters === 'string' ? JSON.parse(p.chapters) : p.chapters;
                chaptersCount = Array.isArray(parsed) ? parsed.length : 0;
            } catch (e) { }
        }

        card.className = `project-card ${isDisabled ? 'is-disabled' : ''}`;
        card.style.height = 'auto';
        card.style.minHeight = '140px';
        card.onclick = () => openProjectEditor(p);

        let typeLabel = 'Игра';
        let typeBadgeColor = 'background:rgba(62,207,142,0.12);color:#3ecf8e;border:1px solid rgba(62,207,142,0.25);';
        if (p.type === 'app') {
            typeLabel = 'Приложение';
            typeBadgeColor = 'background:rgba(20,184,166,0.12);color:#2dd4bf;border:1px solid rgba(20,184,166,0.25);';
        } else if (p.type === 'web') {
            typeLabel = 'Веб-проект';
            typeBadgeColor = 'background:rgba(56,189,248,0.12);color:#38bdf8;border:1px solid rgba(56,189,248,0.25);';
        }

        card.innerHTML = `
            <div style="display:flex;gap:16px;align-items:flex-start;">
                ${p.cover_url
                ? `<div style="width:72px;height:72px;border-radius:14px;overflow:hidden;background:#0c1017;border:1px solid var(--border-color);flex-shrink:0;">
                         <img src="${p.cover_url}" style="width:100%;height:100%;object-fit:cover;" alt="cover" onerror="this.parentElement.innerHTML='<div style=\\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a202c;color:#94a3b8;\\\'></div>'">
                       </div>`
                : `<div style="width:72px;height:72px;border-radius:14px;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#c084fc;">
                         <svg viewBox="0 0 24 24" style="width:32px;height:32px;stroke:currentColor;fill:none;stroke-width:2;"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4m-2-2v4"/><circle cx="17" cy="10" r="1"/><circle cx="15" cy="14" r="1"/></svg>
                       </div>`
            }
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
                        <div style="font-size:16px;font-weight:700;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.title}</div>
                        <span class="badge-tier ${isDisabled ? 'disabled' : ''}" style="margin:0;font-size:10px;padding:2px 8px;">${p.status || 'Active'}</span>
                    </div>
                    <div style="font-size:12px;color:var(--text-muted);line-height:1.4;margin-bottom:10px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
                        ${p.description || p.desc || 'Нет описания'}
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
                        <span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;${typeBadgeColor}">
                            ${typeLabel}
                        </span>
                        ${hasChapters
                ? `<span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:rgba(168,85,247,0.12);color:#d8b4fe;border:1px solid rgba(168,85,247,0.25);display:flex;align-items:center;gap:4px;">
                                 <svg viewBox="0 0 24 24" style="width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                                 ${chaptersCount} ${chaptersCount === 1 ? 'глава' : 'глав'}
                               </span>`
                : (p.link ? `<span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:500;background:rgba(255,255,255,0.05);color:var(--text-muted);border:1px solid var(--border-color);">${p.link}</span>` : '')
            }
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function openProjectEditor(project = null) {
    currentEditingProject = project;
    const modal = document.getElementById('projectEditorModal');
    if (!modal) return;

    document.getElementById('projectModalTitle').innerText = project ? 'Edit Project / Game' : 'Create New Project / Game';

    document.getElementById('projectTitleInput').value = project ? project.title : '';
    document.getElementById('projectTypeInput').value = project ? (project.type || 'game') : 'game';
    document.getElementById('projectStatusInput').value = project ? (project.status || 'Active') : 'Active';
    document.getElementById('projectDescInput').value = project ? (project.description || project.desc || '') : '';
    document.getElementById('projectLinkInput').value = project ? (project.link || '') : '';
    document.getElementById('projectActionTextInput').value = project ? (project.action_text || 'Запустить') : 'Запустить';
    document.getElementById('projectChaptersTextInput').value = project ? (project.chapters_text || '') : '';

    // Cover image setup
    const coverUrl = project ? (project.cover_url || '') : '';
    document.getElementById('projectCoverUrlInput').value = coverUrl;
    document.getElementById('projectCoverInput').value = coverUrl;

    const dropZone = document.getElementById('projectCoverDropZone');
    const previewImg = document.getElementById('projectCoverPreview');
    if (dropZone && previewImg) {
        if (coverUrl) {
            dropZone.classList.add('has-image');
            previewImg.src = coverUrl;
        } else {
            dropZone.classList.remove('has-image');
            previewImg.removeAttribute('src');
        }
    }

    // Build file input reset
    document.getElementById('projectFileInputRaw').value = '';
    document.getElementById('projectFileNameDisplay').innerText = 'No file chosen';

    // Display mode & chapters
    let displayType = project ? (project.display_type || 'simple') : 'simple';
    if (project && (project.title?.toLowerCase().includes('pc master') || project.chapters)) {
        displayType = 'chapters';
    }
    setProjectDisplayType(displayType);

    if (displayType === 'chapters') {
        let chaptersData = project ? project.chapters : null;
        if (!chaptersData && project && project.title?.toLowerCase().includes('pc master')) {
            chaptersData = [
                {
                    title: 'Глава 1',
                    subtitle: 'Начало пути',
                    description: 'Игрок успешно справился с вирусом и устроился работать, но что-то пошло не так...',
                    link: 'https://pc-master-chapter1.vercel.app',
                    cover_url: '',
                    available: true
                },
                {
                    title: 'Глава 2',
                    subtitle: 'Digital Dreams',
                    description: 'Компания Digital Dreams захватила компьютер главного героя, но ему помог его друг... но это не конец.',
                    link: 'https://pc-master-chapter2.vercel.app',
                    cover_url: '',
                    available: true
                },
                {
                    title: 'Глава 3',
                    subtitle: 'Сомнения',
                    description: 'Подозрение, что друг с этим как-то замешан...',
                    link: '',
                    cover_url: '',
                    available: false
                }
            ];
        }
        if (chaptersData) {
            loadProjectChaptersIntoEditor(chaptersData);
        }
    } else {
        document.getElementById('projectChaptersList').innerHTML = '';
        projectChapterCounter = 0;
    }

    // Delete button visibility
    const delBtn = document.getElementById('projectDeleteBtn');
    if (delBtn) {
        delBtn.style.display = project ? 'block' : 'none';
    }

    // Save button reset
    const saveBtn = document.getElementById('saveProjectBtn');
    if (saveBtn) {
        saveBtn.innerHTML = project ? '<span>Save Changes</span>' : '<span>Create Project</span>';
        saveBtn.style.pointerEvents = '';
        saveBtn.style.opacity = '';
    }

    modal.classList.add('active');
}

function closeProjectEditor() {
    const modal = document.getElementById('projectEditorModal');
    if (modal) modal.classList.remove('active');
    currentEditingProject = null;
}

function setProjectDisplayType(type) {
    const simpleBtn = document.getElementById('projTypeSimpleBtn');
    const chaptersBtn = document.getElementById('projTypeChaptersBtn');
    const container = document.getElementById('projectChaptersContainer');
    const hiddenInput = document.getElementById('projectDisplayTypeInput');

    if (simpleBtn) simpleBtn.classList.toggle('active', type === 'simple');
    if (chaptersBtn) chaptersBtn.classList.toggle('active', type === 'chapters');
    if (container) container.classList.toggle('visible', type === 'chapters');
    if (hiddenInput) hiddenInput.value = type;

    if (type === 'chapters') {
        const list = document.getElementById('projectChaptersList');
        if (list && list.children.length === 0) {
            if (currentEditingProject && currentEditingProject.chapters) {
                loadProjectChaptersIntoEditor(currentEditingProject.chapters);
            } else if (currentEditingProject && currentEditingProject.title?.toLowerCase().includes('pc master')) {
                loadProjectChaptersIntoEditor([
                    {
                        title: 'Глава 1',
                        subtitle: 'Начало пути',
                        description: 'Игрок успешно справился с вирусом и устроился работать, но что-то пошло не так...',
                        link: 'https://pc-master-chapter1.vercel.app',
                        cover_url: '',
                        available: true
                    },
                    {
                        title: 'Глава 2',
                        subtitle: 'Digital Dreams',
                        description: 'Компания Digital Dreams захватила компьютер главного героя, но ему помог его друг... но это не конец.',
                        link: 'https://pc-master-chapter2.vercel.app',
                        cover_url: '',
                        available: true
                    },
                    {
                        title: 'Глава 3',
                        subtitle: 'Сомнения',
                        description: 'Подозрение, что друг с этим как-то замешан...',
                        link: '',
                        cover_url: '',
                        available: false
                    }
                ]);
            } else {
                addProjectChapter();
            }
        }
    }
}

let projectChapterCounter = 0;

function createChapterElement(idx, ch = {}) {
    const item = document.createElement('div');
    item.className = 'chapter-item';
    item.dataset.chapterIdx = idx;
    const coverUrl = ch.cover_url || '';

    item.innerHTML = `
        <div class="chapter-item-header">
            <span class="chapter-label">Глава / Версия ${idx}</span>
            <button class="chapter-delete-btn" type="button" onclick="removeProjectChapter(this)">
                <svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="chapter-fields">
            <div>
                <input class="chapter-input" type="text" placeholder="Название (напр. Глава ${idx})" data-field="title" value="${escapeHtmlAttr(ch.title || '')}">
            </div>
            <div>
                <input class="chapter-input" type="text" placeholder="Подзаголовок / Версия" data-field="subtitle" value="${escapeHtmlAttr(ch.subtitle || '')}">
            </div>
            <div class="full-width">
                <input class="chapter-input" type="text" placeholder="Описание главы" data-field="description" value="${escapeHtmlAttr(ch.description || '')}">
            </div>
            <div class="full-width">
                <input class="chapter-input" type="text" placeholder="Ссылка для запуска (https://...)" data-field="link" value="${escapeHtmlAttr(ch.link || '')}">
            </div>
            <div class="full-width" style="margin-top:4px;">
                <label style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;display:block;">
                    Обложка главы (Drag & Drop + Сетка обрезки)
                </label>
                <div class="image-drop-zone chapter-drop-zone ${coverUrl ? 'has-image' : ''}" style="width:100%;min-height:130px;max-height:200px;aspect-ratio:16/9;padding:12px;display:flex;align-items:center;justify-content:center;position:relative;" onclick="triggerChapterFileInput(this)">
                    <input type="file" accept="image/*" class="chapter-file-input" style="display:none;" onchange="handleChapterFileSelect(this)">
                    <div class="drop-icon" style="width:40px;height:40px;">
                        <svg viewBox="0 0 24 24" style="width:18px;height:18px;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div class="drop-label" style="font-size:12px;">Перетащите обложку главы или <u>выберите файл</u> (откроется сетка)</div>
                    <img class="preview-img chapter-preview-img" src="${escapeHtmlAttr(coverUrl)}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;${coverUrl ? 'display:block;' : 'display:none;'}">
                    <button type="button" class="remove-img-btn" onclick="removeChapterImage(event, this)" style="${coverUrl ? 'display:flex;' : 'display:none;'}">
                        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <input class="chapter-input" type="text" placeholder="Или прямая ссылка на обложку..." data-field="cover_url" value="${escapeHtmlAttr(coverUrl)}" style="font-size:11px;margin-top:6px;" oninput="syncChapterCoverInput(this)">
            </div>
            <div class="full-width">
                <label class="custom-checkbox-wrap">
                    <input type="checkbox" data-field="available" ${ch.available !== false ? 'checked' : ''}>
                    <span class="custom-checkbox-box">
                        <svg viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3"/></svg>
                    </span>
                    Доступна для запуска / игры
                </label>
            </div>
        </div>
    `;

    // Attach Drag and Drop to the chapter dropzone
    const dropZone = item.querySelector('.chapter-drop-zone');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                openCropperForChapter(e.dataTransfer.files[0], item);
            }
        });
    }

    return item;
}

function addProjectChapter() {
    projectChapterCounter++;
    const list = document.getElementById('projectChaptersList');
    if (!list) return;
    const item = createChapterElement(projectChapterCounter, {});
    list.appendChild(item);
}

function removeProjectChapter(btn) {
    const item = btn.closest('.chapter-item');
    if (item) item.remove();
}

function triggerChapterFileInput(dropZone) {
    const fileInput = dropZone.querySelector('.chapter-file-input');
    if (fileInput) fileInput.click();
}

function handleChapterFileSelect(input) {
    if (input.files && input.files[0]) {
        const item = input.closest('.chapter-item');
        openCropperForChapter(input.files[0], item);
    }
}

function openCropperForChapter(file, chapterItem) {
    if (!file || !chapterItem) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        if (typeof openCropModal === 'function') {
            openCropModal(dataUrl, file, null, null, null, (publicUrl) => {
                const coverInput = chapterItem.querySelector('[data-field="cover_url"]');
                if (coverInput) coverInput.value = publicUrl;

                const dropZone = chapterItem.querySelector('.chapter-drop-zone');
                const previewImg = dropZone ? dropZone.querySelector('.chapter-preview-img') : null;
                const removeBtn = dropZone ? dropZone.querySelector('.remove-img-btn') : null;

                if (previewImg) {
                    previewImg.src = publicUrl;
                    previewImg.style.display = 'block';
                }
                if (removeBtn) {
                    removeBtn.style.display = 'flex';
                }
                if (dropZone) dropZone.classList.add('has-image');
                showToast('✅ Обложка главы сохранена!');
            });
        }
    };
    reader.readAsDataURL(file);
}

function removeChapterImage(e, btn) {
    e.stopPropagation();
    const chapterItem = btn.closest('.chapter-item');
    if (!chapterItem) return;
    const dropZone = chapterItem.querySelector('.chapter-drop-zone');
    const coverInput = chapterItem.querySelector('[data-field="cover_url"]');
    const previewImg = dropZone ? dropZone.querySelector('.chapter-preview-img') : null;

    if (coverInput) coverInput.value = '';
    if (previewImg) {
        previewImg.removeAttribute('src');
        previewImg.style.display = 'none';
    }
    btn.style.display = 'none';
    if (dropZone) dropZone.classList.remove('has-image');
}

function syncChapterCoverInput(input) {
    const chapterItem = input.closest('.chapter-item');
    if (!chapterItem) return;
    const dropZone = chapterItem.querySelector('.chapter-drop-zone');
    const previewImg = dropZone ? dropZone.querySelector('.chapter-preview-img') : null;
    const removeBtn = dropZone ? dropZone.querySelector('.remove-img-btn') : null;
    const url = input.value.trim();

    if (url && previewImg && dropZone) {
        previewImg.src = url;
        previewImg.style.display = 'block';
        if (removeBtn) removeBtn.style.display = 'flex';
        dropZone.classList.add('has-image');
    } else if (previewImg && dropZone) {
        previewImg.removeAttribute('src');
        previewImg.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'none';
        dropZone.classList.remove('has-image');
    }
}

function collectProjectChapters() {
    const list = document.getElementById('projectChaptersList');
    if (!list) return [];
    const items = list.querySelectorAll('.chapter-item');
    return Array.from(items).map(item => ({
        title: (item.querySelector('[data-field="title"]')?.value || '').trim(),
        subtitle: (item.querySelector('[data-field="subtitle"]')?.value || '').trim(),
        description: (item.querySelector('[data-field="description"]')?.value || '').trim(),
        link: (item.querySelector('[data-field="link"]')?.value || '').trim(),
        cover_url: (item.querySelector('[data-field="cover_url"]')?.value || '').trim(),
        available: !!item.querySelector('[data-field="available"]')?.checked
    })).filter(ch => ch.title || ch.link);
}

function loadProjectChaptersIntoEditor(chaptersJson) {
    const list = document.getElementById('projectChaptersList');
    if (!list) return;
    list.innerHTML = '';
    projectChapterCounter = 0;

    let chapters = [];
    try {
        chapters = typeof chaptersJson === 'string' ? JSON.parse(chaptersJson) : chaptersJson;
    } catch (e) {
        return;
    }

    if (!Array.isArray(chapters)) return;

    chapters.forEach(ch => {
        projectChapterCounter++;
        const item = createChapterElement(projectChapterCounter, ch);
        list.appendChild(item);
    });
}

async function handleProjectFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb >= 1024 ? (sizeKb / 1024).toFixed(2).replace(/\.?0+$/, '') + ' MB' : sizeKb + ' KB';

    document.getElementById('projectFileNameDisplay').innerText = `Uploading ${file.name} (${sizeStr})...`;

    const title = document.getElementById('projectTitleInput').value.trim() || 'project';
    const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const ext = file.name.split('.').pop() || 'zip';
    const fileName = `builds/${slug}_${Date.now()}.${ext}`;

    try {
        const { data, error } = await getSupabase().storage
            .from('project_files')
            .upload(fileName, file, { upsert: true });

        if (error) {
            showToast('Ошибка загрузки файла: ' + error.message);
            document.getElementById('projectFileNameDisplay').innerText = 'Upload failed';
            return;
        }

        const { data: urlData } = getSupabase().storage.from('project_files').getPublicUrl(fileName);
        document.getElementById('projectLinkInput').value = urlData.publicUrl;
        document.getElementById('projectFileNameDisplay').innerText = `${file.name} (${sizeStr})`;
        showToast('Файл проекта загружен в облако!');
    } catch (err) {
        showToast('Ошибка загрузки: ' + err.message);
    }
}

async function saveProject() {
    const btn = document.getElementById('saveProjectBtn');
    const title = document.getElementById('projectTitleInput').value.trim();
    const type = document.getElementById('projectTypeInput').value;
    const status = document.getElementById('projectStatusInput').value;
    const description = document.getElementById('projectDescInput').value.trim();
    let link = document.getElementById('projectLinkInput').value.trim();
    let cover_url = (document.getElementById('projectCoverUrlInput').value || document.getElementById('projectCoverInput').value || '').trim();
    const display_type = document.getElementById('projectDisplayTypeInput').value;
    const chaptersList = display_type === 'chapters' ? collectProjectChapters() : [];
    const chapters = display_type === 'chapters' && chaptersList.length > 0 ? JSON.stringify(chaptersList) : null;

    const action_text = document.getElementById('projectActionTextInput').value.trim() || 'Запустить';
    const chapters_text = document.getElementById('projectChaptersTextInput').value.trim() || (display_type === 'chapters' ? 'Несколько глав' : 'Играть онлайн');

    if (!title) {
        showToast('Введите название проекта!');
        document.getElementById('projectTitleInput').focus();
        return;
    }

    // Check if raw build file needs uploading first
    const fileInput = document.getElementById('projectFileInputRaw');
    if (fileInput && fileInput.files && fileInput.files.length > 0 && !link) {
        if (btn) {
            btn.innerHTML = '<span>Загрузка файла игры...</span>';
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.7';
        }
        try {
            const file = fileInput.files[0];
            const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
            const ext = file.name.split('.').pop() || 'zip';
            const fileName = `builds/${slug}_${Date.now()}.${ext}`;

            const { data, error } = await getSupabase().storage
                .from('project_files')
                .upload(fileName, file, { upsert: true });

            if (!error) {
                const { data: urlData } = getSupabase().storage.from('project_files').getPublicUrl(fileName);
                link = urlData.publicUrl;
                document.getElementById('projectLinkInput').value = link;
            }
        } catch (e) {
            console.warn('File upload exception:', e);
        }
    }

    if (btn) {
        btn.innerHTML = '<span>Сохранение...</span>';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';
    }

    let currentPayload = {
        title,
        type,
        status,
        description,
        link,
        cover_url,
        display_type,
        chapters,
        action_text,
        chapters_text
    };

    let saveSuccess = false;
    let maxRetries = 6;

    while (!saveSuccess && maxRetries > 0) {
        maxRetries--;
        try {
            if (currentEditingProject) {
                const { error } = await getSupabase()
                    .from('projects')
                    .update(currentPayload)
                    .eq('id', currentEditingProject.id);

                if (error) {
                    const match = error.message.match(/Could not find the '([^']+)' column/i);
                    if (match && match[1] && currentPayload.hasOwnProperty(match[1])) {
                        console.warn(`[DB Schema] Removing unsupported column '${match[1]}' and retrying...`);
                        delete currentPayload[match[1]];
                        continue;
                    }
                    showToast('Ошибка сохранения: ' + error.message);
                    resetBtn();
                    return;
                }
                saveSuccess = true;
                showToast(`Проект "${title}" успешно обновлен!`);
            } else {
                const { error } = await getSupabase()
                    .from('projects')
                    .insert([currentPayload]);

                if (error) {
                    const match = error.message.match(/Could not find the '([^']+)' column/i);
                    if (match && match[1] && currentPayload.hasOwnProperty(match[1])) {
                        console.warn(`[DB Schema] Removing unsupported column '${match[1]}' and retrying...`);
                        delete currentPayload[match[1]];
                        continue;
                    }
                    showToast('Ошибка создания: ' + error.message);
                    resetBtn();
                    return;
                }
                saveSuccess = true;
                showToast(`Проект "${title}" опубликован в реальном времени!`);
            }
        } catch (err) {
            showToast('Ошибка: ' + err.message);
            resetBtn();
            return;
        }
    }

    resetBtn();
    closeProjectEditor();
    loadProjects();

    function resetBtn() {
        if (btn) {
            btn.innerHTML = currentEditingProject ? '<span>Save Changes</span>' : '<span>Create Project</span>';
            btn.style.pointerEvents = '';
            btn.style.opacity = '';
        }
    }
}

async function deleteProject() {
    if (!currentEditingProject) return;
    if (!confirm(`Вы действительно хотите удалить проект "${currentEditingProject.title}"?`)) return;

    try {
        // Cleanup storage if needed
        if (currentEditingProject.cover_url && currentEditingProject.cover_url.includes('/project_files/')) {
            try {
                const parts = currentEditingProject.cover_url.split('/project_files/');
                if (parts[1]) await getSupabase().storage.from('project_files').remove([parts[1]]);
            } catch (e) { }
        }

        const { error } = await getSupabase()
            .from('projects')
            .delete()
            .eq('id', currentEditingProject.id);

        if (error) {
            showToast('Ошибка удаления: ' + error.message);
            return;
        }

        showToast(`Проект "${currentEditingProject.title}" удален`);
        closeProjectEditor();
        loadProjects();
    } catch (err) {
        showToast('Ошибка: ' + err.message);
    }
}

// Global aliases for existing buttons/calls
window.openNewProjectModal = function () {
    openProjectEditor(null);
};

window.openProjectDetailsModal = function (id) {
    const p = projectsData.find(item => item.id === id);
    if (p) openProjectEditor(p);
};

// Hook into existing switchSection to load projects when tab is clicked
const origSwitchSection = window.switchSection;
window.switchSection = function (sectionId, element) {
    if (origSwitchSection) origSwitchSection(sectionId, element);
    if (sectionId === 'projects-section') {
        loadProjects();
    }
};

// Initial load
setTimeout(() => {
    loadProjects();
}, 300);
