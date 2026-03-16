// post.js — render CMS-driven post
(function () {
    document.addEventListener('cms:ready', ({ detail: data }) => {
        const slug = new URLSearchParams(window.location.search).get('slug') || 'post-1';
        const post = data && data.post && data.post.posts && data.post.posts[slug];
        if (!post) return;

        document.title = 'TATC';

        document.getElementById('post-date').textContent = post.date;
        document.getElementById('post-subject').textContent = post.subject;
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-footer-label').textContent = post.footer_label;
        document.getElementById('post-footer-credit').textContent = post.footer_credit;

        const body = document.getElementById('post-body');
        body.textContent = '';
        const frag = document.createDocumentFragment();

        (Array.isArray(post.body) ? post.body : []).forEach(block => {
            if (!block || !block.type) return;

            if (block.type === 'paragraph') {
                const p = document.createElement('p');
                p.className = 'text-size-regular';
                p.textContent = block.text || '';
                frag.appendChild(p);
                return;
            }

            if (block.type === 'image') {
                const wrap = document.createElement('div');
                wrap.className = 'post_block';

                const img = document.createElement('img');
                img.className = 'post_image-editorial';
                img.loading = 'lazy';
                img.decoding = 'async';
                img.alt = block.alt || '';
                const src = String(block.src || '');
                if (!/^\s*javascript:/i.test(src)) img.src = src;

                const cap = document.createElement('span');
                cap.className = 'text-style-label post_caption';
                cap.textContent = block.caption || '';

                wrap.appendChild(img);
                wrap.appendChild(cap);
                frag.appendChild(wrap);
                return;
            }

            if (block.type === 'pullquote') {
                const q = document.createElement('div');
                q.className = 'post_pull-quote';
                q.textContent = block.text || '';
                frag.appendChild(q);
                return;
            }
        });

        body.appendChild(frag);
    });
})();
