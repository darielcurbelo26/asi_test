// nav.js - Modular navigation component
document.addEventListener('DOMContentLoaded', () => {
    const navHTML = `
        <nav class="nav_component">
            <div class="nav_container">
                <a href="index.html" class="text-style-nav difference-text">
                    <span class="hover-split-text">
                        <span class="text-inner" data-cms="global.brand">TATC</span>
                        <span class="text-outer" data-cms="global.brand">TATC</span>
                    </span>
                </a>
                <div class="nav_button difference-text" id="nav_button-menu">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </nav>

        <nav class="nav_menu">
            <div class="nav_container nav_menu-container">
                <div class="nav_list">
                    <a href="blog.html" class="text-style-nav nav_link">
                        <span class="hover-split-text">
                            <span class="text-inner" data-cms="global.nav.blog">The Gist</span>
                            <span class="text-outer" data-cms="global.nav.blog">The Gist</span>
                        </span>
                    </a>
                    <a href="projects.html" class="text-style-nav nav_link">
                        <span class="hover-split-text">
                            <span class="text-inner" data-cms="global.nav.projects">Projects</span>
                            <span class="text-outer" data-cms="global.nav.projects">Projects</span>
                        </span>
                    </a>
                    <a href="about.html" class="text-style-nav nav_link">
                        <span class="hover-split-text">
                            <span class="text-inner" data-cms="global.nav.info">Info</span>
                            <span class="text-outer" data-cms="global.nav.info">Info</span>
                        </span>
                    </a>
                </div>
                <div class="nav_list social_list">
                    <a data-cms="global.social.twitter" data-cms-attr="href" target="_blank" class="social_link"><img src="assets/social_icons/xx.svg" alt="xx"></a>
                    <a data-cms="global.social.email" data-cms-attr="href" class="social_link"><img src="assets/social_icons/mail.svg" alt="mail"></a>
                    <a data-cms="global.social.instagram" data-cms-attr="href" target="_blank" class="social_link"><img src="assets/social_icons/instagram.svg" alt="instagram"></a>
                </div>
            </div>
        </nav>
    `;

    // Remove any existing nav instance before reinserting a fresh one.
    document.querySelectorAll('.nav_component, .nav_menu').forEach((el) => el.remove());

    // Insert at the beginning of body.
    document.body.insertAdjacentHTML('afterbegin', navHTML);
});