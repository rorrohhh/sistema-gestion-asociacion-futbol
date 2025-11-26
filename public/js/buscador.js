document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Función Debounce ---
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // --- 2. Función Buscar ---
    function buscarJugadores() {
    const clubSelect = document.querySelector('select[name="club"]');
    const rutInput = document.querySelector('input[name="rut"]');
    const rolInput = document.querySelector('input[name="rol"]');
    const nombreInput = document.querySelector('input[name="nombre"]'); 

    if (!clubSelect) return;

    const club = clubSelect.value;
    const rut = rutInput.value;
    const rol = rolInput.value;
    const nombre = nombreInput.value; 

    // Agregamos nombre a la URL
    const url = `/?club=${club}&rut=${rut}&rol=${rol}&nombre=${nombre}&ajax=true`;
    
    // ... fetch igual que antes ...
    fetch(url)
        .then(r => r.text())
        .then(html => {
            const tabla = document.getElementById('tablaJugadores');
            if(tabla) tabla.innerHTML = html;
        })
        .catch(e => console.error(e));
}

// Agregamos el input[name="nombre"] a la lista de escucha
    const inputs = document.querySelectorAll('input[name="rut"], input[name="rol"], input[name="nombre"], select[name="club"]');
    
    if (inputs.length > 0) {
        inputs.forEach(input => {
            input.addEventListener('input', debounce(buscarJugadores, 300));
            input.addEventListener('change', buscarJugadores); 
        });
    }
    
    // Evitar submit del form
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            buscarJugadores();
        });
    }
});