document.addEventListener('DOMContentLoaded', function() {
    const postsSection = document.getElementById('posts-section');
    const productsSection = document.getElementById('products-section');
    const tutorialsSection = document.getElementById('tutorials-section');

    // Función simulada para obtener publicaciones de Instagram
    function fetchInstagramPosts() {
        // Aquí deberías hacer una solicitud real a la API de Instagram
        return [
            { id: 1, type: 'post', content: 'Esta es una publicación de texto.' },
            { id: 2, type: 'product', content: 'Producto en venta: <a href="https://example.com/product/1">Comprar ahora</a>' },
            { id: 3, type: 'tutorial', content: '<video controls><source src="https://www.example.com/video.mp4" type="video/mp4">Tu navegador no soporta el elemento de video.</video>' },
            // Más publicaciones simuladas
        ];
    }

    // Agregar publicaciones a las secciones correspondientes
    function addPostsToSections(posts) {
        posts.forEach(post => {
            const listItem = document.createElement('div');
            listItem.className = 'device-item';
            listItem.innerHTML = post.content;

            if (post.type === 'post') {
                postsSection.appendChild(listItem);
            } else if (post.type === 'product') {
                productsSection.appendChild(listItem);
            } else if (post.type === 'tutorial') {
                tutorialsSection.appendChild(listItem);
            }
        });
    }

    const posts = fetchInstagramPosts();
    addPostsToSections(posts);
});


function goBack() {
    window.history.back();
}
