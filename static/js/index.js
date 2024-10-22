document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section');
    const statItems = document.querySelectorAll('.stat-item');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('nav ul');

    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });

    // Close mobile menu when a link is clicked
    navMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            navMenu.classList.remove('show');
        }
    });

    // Scroll event listener
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;

        // Header background change on scroll
        if (scrollPosition > 50) {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        } else {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        }

        // Parallax effect for sections
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPosition > sectionTop - window.innerHeight / 2 && 
                scrollPosition < sectionTop + sectionHeight - window.innerHeight / 2) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            } else {
                section.style.opacity = '0';
                section.style.transform = 'translateY(50px)';
            }
        });
    });

    // Animate stats when in view
    const animateStats = () => {
        statItems.forEach(item => {
            const numberElement = item.querySelector('.stat-number');
            const targetNumber = parseInt(numberElement.textContent.replace(/[^0-9]/g, ''));
            let currentNumber = 0;
            const duration = 2000; // 2 seconds
            const interval = 20; // Update every 20ms
            const steps = duration / interval;
            const increment = targetNumber / steps;

            const counter = setInterval(() => {
                currentNumber += increment;
                if (currentNumber >= targetNumber) {
                    clearInterval(counter);
                    currentNumber = targetNumber;
                }
                numberElement.textContent = Math.floor(currentNumber).toLocaleString() + '+';
            }, interval);
        });
    };

    // Intersection Observer for stats animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(document.querySelector('.stats'));

    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});