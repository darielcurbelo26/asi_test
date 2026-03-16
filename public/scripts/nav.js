// nav.js - Modular navigation component
document.addEventListener('DOMContentLoaded', () => {
    const navHTML = `
        <nav class="nav_component">
            <div class="nav_container">
                <a href="index.html" class="text-style-nav difference-text">
                    <span class="hover-split-text">
                        <span class="text-inner">TATC</span>
                        <span class="text-outer">TATC</span>
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
                            <span class="text-inner">The gist</span>
                            <span class="text-outer">The gist</span>
                        </span>
                    </a>
                    <a href="projects.html" class="text-style-nav nav_link">
                        <span class="hover-split-text">
                            <span class="text-inner">Projects</span>
                            <span class="text-outer">Projects</span>
                        </span>
                    </a>
                    <a href="about.html" class="text-style-nav nav_link">
                        <span class="hover-split-text">
                            <span class="text-inner">Info</span>
                            <span class="text-outer">Info</span>
                        </span>
                    </a>
                </div>
                <div class="nav_list social_list">
                    <a href="https://x.com" target="_blank" class="social_link"><img src="assets/social_icons/xx.svg" alt="xx"></a>
                    <a href="mailto:ejemplo@correo.com" class="social_link"><img src="assets/social_icons/mail.svg" alt="mail"></a>
                    <a href="https://instagram.com" target="_blank" class="social_link"><img src="assets/social_icons/instagram.svg" alt="instagram"></a>
                </div>
            </div>
        </nav>
    `;

    // Insert at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', navHTML);
});