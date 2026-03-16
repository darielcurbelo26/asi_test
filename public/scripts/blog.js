// blog.js — render CMS-driven list
(function () {
    document.addEventListener('cms:ready', ({ detail: data }) => {
        const list = document.getElementById('blog-list');
        if (!list || !data || !data.blog || !data.blog.posts) return;

        list.innerHTML = data.blog.posts.map(post => `
            <a href="${post.url}" class="blog_entry">
                <div class="blog_entry-meta">${post.date}</div>
                <div class="blog_entry-content">
                    <h2 class="blog_entry-title">${post.title}</h2>
                    <p class="text-size-regular">${post.summary}</p>
                </div>
            </a>
        `).join('');

        // Wire page transitions for dynamically created links
        list.querySelectorAll('a.blog_entry').forEach(link => {
            link.addEventListener('click', e => {
                if (window.canviaPagina) {
                    e.preventDefault();
                    window.canviaPagina(e);
                }
            });
        });
    });
})();
