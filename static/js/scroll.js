document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('.section');

    // Función para manejar el scroll del header
    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Función para manejar la animación de las secciones
    function handleSectionAnimation() {
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (sectionTop < windowHeight * 0.75) {
                section.classList.add('visible');
            }
        });
    }

    // Evento de scroll
    window.addEventListener('scroll', function() {
        handleHeaderScroll();
        handleSectionAnimation();
    });

    // Iniciar la animación de las secciones
    handleSectionAnimation();

    // Scroll suave para los enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});