// post.js — render CMS-driven post
(function () {
    document.addEventListener('cms:ready', ({ detail: data }) => {
        const slug = new URLSearchParams(window.location.search).get('slug') || 'post-1';
        const post = data && data.post && data.post.posts && data.post.posts[slug];
        if (!post) return;

        document.title = post.meta_title;

        document.getElementById('post-date').textContent = post.date;
        document.getElementById('post-subject').textContent = post.subject;
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-footer-label').textContent = post.footer_label;
        document.getElementById('post-footer-credit').textContent = post.footer_credit;

        const body = document.getElementById('post-body');
        body.innerHTML = post.body.map(block => {
            if (block.type === 'paragraph') {
                return `<p class="text-size-regular">${block.text}</p>`;
            }
            if (block.type === 'image') {
                return `
                    <div class="post_block">
                        <img src="${block.src}" class="post_image-editorial" alt="${block.alt}" loading="lazy" decoding="async">
                        <span class="text-style-label post_caption">${block.caption}</span>
                    </div>`;
            }
            if (block.type === 'pullquote') {
                return `<div class="post_pull-quote">${block.text}</div>`;
            }
            return '';
        }).join('');
    });
})();
