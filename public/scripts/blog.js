// blog.js — render CMS-driven list
(function () {
    document.addEventListener('cms:ready', ({ detail: data }) => {
        const list = document.getElementById('blog-list');
        if (!list || !data || !data.blog || !data.blog.posts) return;

        list.textContent = '';
        const frag = document.createDocumentFragment();

        data.blog.posts.forEach(post => {
            const link = document.createElement('a');
            link.className = 'blog_entry';

            const url = String(post.url || '');
            if (/^\s*javascript:/i.test(url)) return;
            link.href = url;

            const meta = document.createElement('div');
            meta.className = 'blog_entry-meta';
            meta.textContent = post.date || '';

            const content = document.createElement('div');
            content.className = 'blog_entry-content';

            const title = document.createElement('h2');
            title.className = 'blog_entry-title';
            title.textContent = post.title || '';

            const summary = document.createElement('p');
            summary.className = 'text-size-regular';
            summary.textContent = post.summary || '';

            content.appendChild(title);
            content.appendChild(summary);

            link.appendChild(meta);
            link.appendChild(content);

            // Wire page transitions for dynamically created links
            link.addEventListener('click', e => {
                if (window.canviaPagina) {
                    e.preventDefault();
                    window.canviaPagina(e);
                }
            });

            frag.appendChild(link);
        });

        list.appendChild(frag);
    });
})();
