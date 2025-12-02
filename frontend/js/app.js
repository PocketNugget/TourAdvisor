document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('glass-nav');
            navbar.classList.remove('py-4');
        } else {
            navbar.classList.remove('glass-nav');
            navbar.classList.add('py-4');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Check login status for navbar update (optional, but good for UX)
    const user = JSON.parse(localStorage.getItem('tourUser'));
    if (user) {
        const loginBtn = document.querySelector('a[href="login.html"]');
        if (loginBtn) {
            loginBtn.textContent = 'Dashboard';
            loginBtn.href = user.rol === 'admin' ? 'dashboard-admin.html' : 'dashboard-user.html';
        }
    }
});
