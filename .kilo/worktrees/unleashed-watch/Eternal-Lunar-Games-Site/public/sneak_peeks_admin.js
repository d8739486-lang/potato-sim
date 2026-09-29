/* sneak_peeks_admin.js - Logic for Sneak Peeks & Projects Management in Admin Panel */

let sneakPeeksData = [];

function getSupabaseClient() {
    if (window._sbClient) return window._sbClient;
    if (window.supabase && window.supabase.createClient) {
        window._sbClient = window.supabase.createClient(
            'https://wqcstpgssapruhxfrxen.supabase.co',
            'sb_publishable_69qcMTynbEjn0O32lgs0pw_IedYqSJI'
        );
    }
    return window._sbClient;
}

async function loadSneakPeeks() {
    const { data, error } = await getSupabaseClient().from('sneak_peeks').select('*').order('created_at', { ascending: false });
    
    if (!error && data) {
        // Remove diagnostic test row and deduplicate by slug/title
        const seen = new Map();
        data.forEach(item => {
            if (item.id === 'a1b2c3d4-0000-0000-0000-000000000001') return;
            const key = (item.slug || item.title || item.id).toLowerCase().trim();
            if (!seen.has(key)) seen.set(key, item);
        });
        sneakPeeksData = Array.from(seen.values());
    } else {
        sneakPeeksData = [];
        if (typeof showToast === 'function') showToast('Ошибка загрузки из базы данных. Проверьте подключение.');
    }
    renderSneakPeeksGrid();
}


function renderSneakPeeksGrid() {
    const grid = document.getElementById('sneakPeeksGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (sneakPeeksData.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">No sneak peeks found. Create your first one!</div>';
        return;
    }

    sneakPeeksData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.style.height = 'auto';
        card.style.minHeight = '140px';
        card.onclick = () => openSneakPeekEditor(item);

        const isColdForest = item.slug === 'cold-forest' || item.title.toLowerCase().includes('cold forest');
        const tags = (() => { try { return typeof item.tags === 'string' ? JSON.parse(item.tags) : (item.tags || []); } catch { return []; } })();

        card.innerHTML = `
            <div style="display:flex;gap:14px;align-items:flex-start;">
                <div style="width:48px;height:48px;border-radius:12px;background:${isColdForest ? 'rgba(6,182,212,0.2)' : 'rgba(168,85,247,0.15)'};border:1px solid ${isColdForest ? 'rgba(6,182,212,0.4)' : 'rgba(168,85,247,0.2)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <svg viewBox="0 0 24 24" style="width:22px;height:22px;stroke:${isColdForest ? '#22d3ee' : '#c084fc'};fill:none;stroke-width:2;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <div style="font-size:16px;font-weight:700;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.title}</div>
                        <span style="font-size:12px;font-weight:700;color:#38bdf8;background:rgba(56,189,248,0.1);padding:2px 8px;border-radius:10px;">${item.progress || 0}%</span>
                    </div>
                    <div style="font-size:12px;color:var(--text-muted);line-height:1.4;margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${item.short_description || 'Нет описания'}</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;">
                        <span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;background:rgba(168,199,250,0.1);color:var(--accent-blue);">${item.category || 'sneak_peek'}</span>
                        <span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;background:rgba(251,191,36,0.1);color:#fcd34d;">${item.status || 'In Dev'}</span>
                        ${tags.slice(0, 2).map(t => `<span style="font-size:11px;color:var(--text-muted);">#${t}</span>`).join(' ')}
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

let currentEditingSneakPeek = null;

function openSneakPeekEditor(item = null) {
    currentEditingSneakPeek = item;
    const modal = document.getElementById('sneakPeekEditorModal');
    if (!modal) return;

    document.getElementById('sneakPeekModalTitle').innerText = item ? 'Edit Sneak Peek / Project' : 'New Sneak Peek / Project';
    document.getElementById('spTitleInput').value = item ? item.title : '';
    document.getElementById('spSlugInput').value = item ? item.slug : '';
    const categoryVal = item ? item.category : 'browser_game';
    const categorySelect = document.getElementById('spCategoryInput');
    if (categorySelect) {
        const hasCat = Array.from(categorySelect.options).some(opt => opt.value === categoryVal);
        categorySelect.value = hasCat ? categoryVal : 'browser_game';
    }
    const scaleVal = item ? (item.project_scale || 'medium') : 'medium';
    const scaleSelect = document.getElementById('spScaleInput');
    if (scaleSelect) scaleSelect.value = scaleVal;

    document.getElementById('spStatusInput').value = item ? item.status : 'In Development';
    const prog = item ? (item.progress || 0) : 50;
    document.getElementById('spProgressInput').value = prog;
    if (document.getElementById('spProgressNumInput')) {
        document.getElementById('spProgressNumInput').value = prog;
    }
    document.getElementById('spProgressVal').innerText = `${prog}%`;

    document.getElementById('spShortDescInput').value = item ? item.short_description : '';
    document.getElementById('spFullContentInput').value = item ? (item.full_content || '') : '';
    const coverUrl = item ? (item.cover_url || '') : '';
    document.getElementById('spCoverUrlInput').value = coverUrl;

    const spDropZone = document.getElementById('spCoverDropZone');
    const spPreviewImg = document.getElementById('spCoverPreviewImg');
    if (spDropZone && spPreviewImg) {
        if (coverUrl) {
            spDropZone.classList.add('has-image');
            spPreviewImg.src = coverUrl;
        } else {
            spDropZone.classList.remove('has-image');
            spPreviewImg.removeAttribute('src');
        }
    }

    const tags = item ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : (item.tags || [])).join(', ') : 'Web, HTML5, Browser';
    document.getElementById('spTagsInput').value = tags;
    const mcVer = item ? (item.mc_version || '') : '';
    const plat = item ? (item.platform || '') : '';

    document.getElementById('spMcVersionInput').value = mcVer;
    document.getElementById('spPlatformInput').value = plat;

    const mcSel = document.getElementById('spMcVersionSelect');
    if (mcSel) {
        const hasOption = Array.from(mcSel.options).some(opt => opt.value === mcVer);
        mcSel.value = hasOption ? mcVer : (mcVer ? 'custom' : '');
    }

    const platSel = document.getElementById('spPlatformSelect');
    if (platSel) {
        const hasOption = Array.from(platSel.options).some(opt => opt.value === plat);
        platSel.value = hasOption ? plat : (plat ? 'custom' : '');
    }

    document.getElementById('spDeleteBtn').style.display = item ? 'block' : 'none';
    modal.classList.add('active');
}

function closeSneakPeekEditor() {
    const modal = document.getElementById('sneakPeekEditorModal');
    if (modal) modal.classList.remove('active');
    currentEditingSneakPeek = null;
}

async function saveSneakPeek() {
    const btnEl = document.querySelector('[onclick="saveSneakPeek()"]') || document.getElementById('spSaveBtn');
    const origText = btnEl ? btnEl.innerHTML : '';

    // Show saving state
    if (btnEl) {
        btnEl.innerHTML = '<span>Публикация...</span>';
        btnEl.style.pointerEvents = 'none';
        btnEl.style.opacity = '0.6';
    }

    const reset = () => {
        if (btnEl) {
            btnEl.innerHTML = origText;
            btnEl.style.pointerEvents = '';
            btnEl.style.opacity = '';
        }
    };

    const title = document.getElementById('spTitleInput').value.trim();
    const slug = document.getElementById('spSlugInput').value.trim() || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = document.getElementById('spCategoryInput').value;
    const project_scale = (document.getElementById('spScaleInput') || {}).value || 'medium';
    const status = document.getElementById('spStatusInput').value;
    const progress = parseInt(document.getElementById('spProgressInput').value) || 0;
    const short_description = document.getElementById('spShortDescInput').value.trim();
    const full_content = document.getElementById('spFullContentInput').value.trim();
    const cover_url = document.getElementById('spCoverUrlInput').value.trim();
    const tagsArr = document.getElementById('spTagsInput').value.split(',').map(s => s.trim()).filter(Boolean);
    const tags = tagsArr;  // text[] column — send as native array, NOT JSON.stringify
    const mc_version = document.getElementById('spMcVersionInput').value.trim();
    const platform = document.getElementById('spPlatformInput').value.trim();

    if (!title) {
        if (typeof showToast === 'function') showToast('Введите название проекта!');
        reset();
        return;
    }

    const isNew = !currentEditingSneakPeek || !currentEditingSneakPeek.id || currentEditingSneakPeek.id.startsWith('local_');
    const itemId = isNew ? crypto.randomUUID() : currentEditingSneakPeek.id;
    const created_at = (currentEditingSneakPeek && currentEditingSneakPeek.created_at) ? currentEditingSneakPeek.created_at : new Date().toISOString();

    const itemData = {
        id: itemId,
        title, slug, category, project_scale, status, progress, short_description, full_content, cover_url, tags, mc_version, platform,
        created_at,
        updated_at: new Date().toISOString()
    };

    console.log('[sneak_peeks] Saving:', itemData);

    // Сохраняем в Supabase
    const dbPayload = { ...itemData };

    const sb = getSupabaseClient();
    if (!sb) {
        if (typeof showToast === 'function') showToast('Ошибка: клиент Supabase не инициализирован!');
        reset();
        return;
    }

    const { data: upsertData, error: sbError } = await sb
        .from('sneak_peeks')
        .upsert([dbPayload], { onConflict: 'id' })
        .select();

    if (sbError) {
        console.error('[sneak_peeks] Supabase error:', sbError);
        const errMsg = sbError.message || sbError.details || JSON.stringify(sbError);
        reset();
        if (typeof showToast === 'function') showToast('ОШИБКА БАЗЫ ДАННЫХ: ' + errMsg);
        return;
    }

    console.log('[sneak_peeks] Saved to DB:', upsertData);
    if (typeof showToast === 'function') showToast(`Проект "${title}" опубликован!`);
    reset();
    closeSneakPeekEditor();
    loadSneakPeeks();
}




async function deleteSneakPeek() {
    if (!currentEditingSneakPeek || !currentEditingSneakPeek.id) return;
    if (!confirm(`Delete "${currentEditingSneakPeek.title}"?`)) return;

    if (!currentEditingSneakPeek.id.startsWith('cold_')) {
        const { error } = await getSupabaseClient().from('sneak_peeks').delete().eq('id', currentEditingSneakPeek.id);
        if (error) {
            if (typeof showToast === 'function') showToast('Error deleting: ' + error.message);
            return;
        }
    }

    if (typeof showToast === 'function') showToast('Deleted successfully.');
    closeSneakPeekEditor();
    loadSneakPeeks();
}

document.addEventListener('DOMContentLoaded', () => {
    loadSneakPeeks();
});
