document.addEventListener('DOMContentLoaded', function() {
    const postsGrid = document.getElementById('posts-grid');
    const productsGrid = document.getElementById('products-grid');
    const tutorialsGrid = document.getElementById('tutorials-grid');
    const usernameElement = document.getElementById('username');

    // Simulated function to get user data
    function getUserData() {
        // This should be replaced with actual user authentication
        return {
            username: 'Usuario123'
        };
    }

    // Set username
    const userData = getUserData();
    usernameElement.textContent = userData.username;

    // Función simulada para obtener publicaciones de Instagram
    function fetchInstagramPosts() {
        // Aquí deberías hacer una solicitud real a la API de Instagram
        return [
            { id: 1, type: 'post', content: 'Esta es una publicación de texto sobre IoT.' },
            { id: 2, type: 'product', content: 'Sensor IoT Multifunción: <a href="#">Ver detalles</a>' },
            { id: 3, type: 'tutorial', content: 'Cómo configurar tu primer dispositivo IoT: <a href="#">Ver tutorial</a>' },
            { id: 4, type: 'post', content: 'Nuevas tendencias en automatización del hogar.' },
            { id: 5, type: 'product', content: 'Hub de Control Central: <a href="#">Comprar ahora</a>' },
            { id: 6, type: 'tutorial', content: 'Tutorial: Integración de dispositivos IoT: <a href="#">Ver video</a>' },
        ];
    }

    // Agregar publicaciones a las secciones correspondientes
    function addPostsToSections(posts) {
        posts.forEach(post => {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.innerHTML = post.content;

            if (post.type === 'post') {
                postsGrid.appendChild(gridItem);
            } else if (post.type === 'product') {
                productsGrid.appendChild(gridItem);
            } else if (post.type === 'tutorial') {
                tutorialsGrid.appendChild(gridItem);
            }
        });
    }

    const posts = fetchInstagramPosts();
    addPostsToSections(posts);
});

function goBack() {
    window.history.back();
}

// Uncomment the following line to remove the development banner
// document.getElementById('development-banner').style.display = 'none';