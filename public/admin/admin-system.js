/**
 * ADMIN SYSTEM v4
 * Handles content generation, navigation, and persistence.
 */

const Admin = {
    data: {},
    currentView: 'global',
    passwords: ['tatc2026', 'TATC2026', 'admin', 'sweet'],
    
    // UI Schema Definition
    schema: {
        global: {
            title: 'Global Settings',
            icon: '⊕',
            sections: [
                {
                    title: 'Brand Identity',
                    fields: [
                        { key: 'global.brand', label: 'Brand Name', type: 'text' },
                        { key: 'global.tagline', label: 'Tagline', type: 'text' },
                        { key: 'global.year', label: 'Current Year', type: 'text' }
                    ]
                },
                {
                    title: 'Navigation Labels',
                    fields: [
                        { key: 'global.nav.blog', label: 'Blog Link Text', type: 'text' },
                        { key: 'global.nav.projects', label: 'Projects Link Text', type: 'text' },
                        { key: 'global.nav.info', label: 'Info Link Text', type: 'text' }
                    ]
                },
                {
                    title: 'Social Media',
                    fields: [
                        { key: 'global.social.instagram', label: 'Instagram URL', type: 'text' },
                        { key: 'global.social.twitter', label: 'Twitter / X URL', type: 'text' },
                        { key: 'global.social.email', label: 'Email Link (mailto:)', type: 'text' }
                    ]
                }
            ]
        },
        home: {
            title: 'Home Page',
            icon: '⌂',
            sections: [
                {
                    title: 'SEO & Meta',
                    fields: [
                        { key: 'home.meta_title', label: 'Browser Tab Title', type: 'text' }
                    ]
                },
                {
                    title: 'Hero Section',
                    fields: [
                        { key: 'home.hero_headline', label: 'Main Headline', type: 'text' }
                    ]
                },
                {
                    title: 'Loader / Intro',
                    fields: [
                        { key: 'home.loader_text', label: 'Loading Sequence Text', type: 'textarea', hint: 'Splits by spaces for animation' },
                        { key: 'home.loader_skip_label', label: 'Skip Button Text', type: 'text' }
                    ]
                }
            ]
        },
        blog: {
            title: 'The Gist (Blog)',
            icon: '≡',
            type: 'collection', // Special handling for arrays
            collectionKey: 'blog.posts',
            itemTitleKey: 'title',
            fields: [
                { key: 'slug', label: 'Slug (URL id)', type: 'text', readOnly: false },
                { key: 'title', label: 'Post Title', type: 'text' },
                { key: 'date', label: 'Date', type: 'text', placeholder: 'DD.MM.YY' },
                { key: 'summary', label: 'Summary', type: 'textarea' },
                { key: 'content', label: 'HTML Content (Full Post)', type: 'code' }, // We'll treat this as large text for now
                { key: 'url', label: 'Post URL', type: 'text', hint: 'Auto-generated usually, e.g. post.html?slug=...'}
            ]
        },
        projects: {
            title: 'Projects',
            icon: '⊟',
            type: 'collection',
            collectionKey: 'projects.items', // Corrected from projects_list to projects.items based on content.json
            itemTitleKey: 'title',
            fields: [
                { key: 'id', label: 'ID', type: 'text' },
                { key: 'title', label: 'Project Title', type: 'text' },
                { key: 'desc', label: 'Description', type: 'text' },
                { key: 'date', label: 'Year', type: 'text' },
                { key: 'loc', label: 'Location', type: 'text' },
                { key: 'src', label: 'Thumbnail Image', type: 'text' },
                { key: 'link', label: 'Link URL', type: 'text' }
            ]
        },
        about: {
            title: 'About / Info',
            icon: '◎',
            sections: [
                {
                    title: 'Intro Block', // Missing in content.json, might need to add key or remove
                    fields: [
                        { key: 'about.intro', label: 'Main Intro Text', type: 'textarea' }
                    ]
                },
                {
                    title: 'Values', // Missing in content.json
                    fields: [
                         { key: 'about.values_html', label: 'Values Content (HTML)', type: 'code', hint: 'Contains <b>Label</b> values' }
                    ]
                }
            ]
        },
        artist: {
            title: 'Artist Profile',
            icon: '★',
            sections: [
                {
                    title: 'Profile',
                    fields: [
                        { key: 'artist.name', label: 'Artist Name', type: 'text' },
                        { key: 'artist.bio1', label: 'Bio Paragraph 1', type: 'textarea' },
                        { key: 'artist.bio2', label: 'Bio Paragraph 2', type: 'textarea' }
                    ]
                }
            ]
        }
    },

    // ─── INITIALIZATION ───────────────────────────────────────────────────────
    init() {
        this.checkAuth();
        document.getElementById('pass').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.login();
        });
    },

    checkAuth() {
        if (localStorage.getItem('tatc_admin_unlocked')) {
            this.unlock();
        }
    },

    login() {
        const input = document.getElementById('pass');
        if (this.passwords.includes(input.value.trim())) {
            localStorage.setItem('tatc_admin_unlocked', 'true');
            this.unlock();
        } else {
            const err = document.getElementById('auth-err');
            err.style.opacity = 1;
            input.value = '';
            setTimeout(() => err.style.opacity = 0, 2000);
        }
    },

    async unlock() {
        document.getElementById('auth').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        await this.loadData();
        this.renderSidebar();
        this.renderView('global');
    },

    // ─── DATA HANDLING ────────────────────────────────────────────────────────
    async loadData() {
        // 1. Try Local Draft
        const draft = localStorage.getItem('tatc_cms');
        if (draft) {
            this.data = JSON.parse(draft);
            console.log('Loaded from local draft');
        }

        // 2. Fetch fresh content.json to fill gaps
        try {
            const res = await fetch('../content.json?t=' + Date.now());
            const fresh = await res.json();
            
            if (!this.data || Object.keys(this.data).length === 0) {
                this.data = fresh;
            } else {
                // Merge strategies could go here. For now, we trust draft if it exists.
                // But we should ensure new keys in fresh exist in data
                this.deepMerge(this.data, fresh); 
            }
        } catch (e) {
            console.error('Failed to load content.json', e);
        }
    },

    deepMerge(target, source) {
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], this.deepMerge(target[key], source[key]));
            }
        }
        Object.assign(target || {}, source);
        return target;
    },

    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this.data) || '';
    },

    set(path, value) {
        const keys = path.split('.');
        let obj = this.data;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
    },

    // ─── RENDERING ────────────────────────────────────────────────────────────
    renderSidebar() {
        const nav = document.getElementById('sidebar-nav');
        nav.innerHTML = '';
        
        Object.keys(this.schema).forEach(key => {
            const item = this.schema[key];
            const el = document.createElement('div');
            el.className = `nav-item ${key === this.currentView ? 'active' : ''}`;
            el.innerHTML = `<span class="nav-icon">${item.icon}</span> ${item.title}`;
            el.onclick = () => {
                this.currentView = key;
                this.renderSidebar(); // refresh active state
                this.renderView(key);
            };
            nav.appendChild(el);
        });
    },

    renderView(key) {
        const area = document.getElementById('content-area');
        const title = document.getElementById('page-title');
        const config = this.schema[key];
        
        title.innerText = config.title;
        area.innerHTML = ''; // Clear

        const container = document.createElement('div');
        container.className = 'content-width';

        if (config.type === 'collection') {
            this.renderCollection(container, config);
        } else {
            config.sections.forEach(section => {
                this.renderSection(container, section);
            });
        }
        
        area.appendChild(container);
    },

    renderSection(parent, section) {
        const group = document.createElement('div');
        group.className = 'group';
        
        const header = document.createElement('div');
        header.className = 'group-header';
        header.innerHTML = `<div class="group-title">${section.title}</div>`;
        group.appendChild(header);

        section.fields.forEach(field => {
            const row = document.createElement('div');
            row.className = 'field';
            
            const label = document.createElement('div');
            label.className = 'label';
            label.innerText = field.label;
            
            const inputWrap = document.createElement('div');
            inputWrap.className = 'input-wrap';
            
            let input;
            const val = this.get(field.key);

            if (field.type === 'textarea' || field.type === 'code') {
                input = document.createElement('textarea');
                input.className = 'textarea';
                if (field.type === 'code') input.style.fontFamily = 'monospace';
            } else {
                input = document.createElement('input');
                input.className = 'input';
                input.type = 'text';
            }
            
            input.value = val;
            input.oninput = (e) => {
                this.set(field.key, e.target.value);
            };

            inputWrap.appendChild(input);
            if (field.hint) {
                const hint = document.createElement('small');
                hint.className = 'hint';
                hint.innerText = field.hint;
                inputWrap.appendChild(hint);
            }

            row.appendChild(label);
            row.appendChild(inputWrap);
            group.appendChild(row);
        });

        parent.appendChild(group);
    },

    renderCollection(parent, config) {
        const list = this.get(config.collectionKey) || [];
        
        // List View
        const listDiv = document.createElement('div');
        listDiv.style.marginBottom = '2rem';
        
        if (Array.isArray(list)) {
            list.forEach((item, index) => {
                const el = document.createElement('div');
                el.className = 'list-item';
                el.innerHTML = `
                    <div>
                        <div class="list-title">${item[config.itemTitleKey] || 'Untitled'}</div>
                        <div class="list-meta">#${index} • ${item.slug || item.id || ''}</div>
                    </div>
                `;
                
                const btn = document.createElement('button');
                btn.className = 'btn-sm';
                btn.innerText = 'EDIT';
                btn.onclick = () => this.editCollectionItem(index, config);
                
                const actions = document.createElement('div');
                actions.appendChild(btn);
                el.appendChild(actions);
                
                listDiv.appendChild(el);
            });
        }

        const addBtn = document.createElement('button');
        addBtn.className = 'btn';
        addBtn.innerText = '+ Add New Item';
        addBtn.onclick = () => {
             // Basic add implementation
             const newItem = {};
             config.fields.forEach(f => newItem[f.key] = '');
             const arr = this.get(config.collectionKey) || [];
             arr.push(newItem);
             this.set(config.collectionKey, arr);
             this.renderView(this.currentView); // Refresh
             this.editCollectionItem(arr.length - 1, config);
        };

        parent.appendChild(addBtn);
        parent.appendChild(document.createElement('br'));
        parent.appendChild(document.createElement('br'));
        parent.appendChild(listDiv);
    },

    editCollectionItem(index, config) {
        const area = document.getElementById('content-area');
        area.innerHTML = '';
        
        const container = document.createElement('div');
        container.className = 'content-width';

        // Breadcrumb / Back
        const back = document.createElement('button');
        back.className = 'btn-sm';
        back.innerText = '← Back to List';
        back.style.marginBottom = '1rem';
        back.onclick = () => this.renderView(this.currentView);
        container.appendChild(back);

        const group = document.createElement('div');
        group.className = 'group';
        
        const collection = this.get(config.collectionKey);
        const item = collection[index];

        config.fields.forEach(field => {
            const row = document.createElement('div');
            row.className = 'field';
            
            const label = document.createElement('div');
            label.className = 'label';
            label.innerText = field.label;
            
            const inputWrap = document.createElement('div');
            inputWrap.className = 'input-wrap';
            
            let input;
             if (field.type === 'textarea' || field.type === 'code') {
                input = document.createElement('textarea');
                input.className = 'textarea';
            } else {
                input = document.createElement('input');
                input.className = 'input';
            }

            // For collection items, we bind directly to the object in the array
            input.value = item[field.key] || '';
            input.oninput = (e) => {
                item[field.key] = e.target.value;
                this.saveLocal(); // Auto-save to object state
            };
            
            inputWrap.appendChild(input);
            row.appendChild(label);
            row.appendChild(inputWrap);
            group.appendChild(row);
        });

        // Delete Button
        const delBtn = document.createElement('button');
        delBtn.className = 'btn';
        delBtn.style.borderColor = '#f00';
        delBtn.style.color = '#f00';
        delBtn.innerText = 'Delete Item';
        delBtn.onclick = () => {
            if(confirm('Are you sure?')) {
                collection.splice(index, 1);
                this.renderView(this.currentView);
            }
        };

        container.appendChild(group);
        container.appendChild(delBtn);
        area.appendChild(container);
    },

    // ─── PERSISTENCE ──────────────────────────────────────────────────────────
    saveLocal() {
        // Just updates the state, maybe updates localStorage
        // In our simple model, data is the source of truth
    },

    save() {
        localStorage.setItem('tatc_cms', JSON.stringify(this.data));
        
        const time = new Date().toLocaleTimeString();
        document.getElementById('last-saved').innerText = 'Last saved: ' + time;
        
        const toast = document.getElementById('toast');
        toast.className = 'show';
        setTimeout(() => toast.className = '', 3000);
    },

    export() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "content.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
};

// Start
Admin.init();
