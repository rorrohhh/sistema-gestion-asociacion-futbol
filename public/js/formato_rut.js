document.addEventListener('DOMContentLoaded', function() {
    
    const formatearInputRut = (event) => {
        let input = event.target;
        let valor = input.value;

        if (!valor) return;

       
        let limpio = valor.replace(/[^0-9kK]/g, '');

       
        if (limpio.length > 9) {
            limpio = limpio.slice(0, 9);
        }
        // -----------------------------------

       
        if (limpio.length <= 1) {
            input.value = limpio;
            return;
        }

        //  Separar cuerpo y dígito verificador
        let cuerpo = limpio.slice(0, -1);
        let dv = limpio.slice(-1).toUpperCase();

        // Formatear el cuerpo con puntos
        let cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        //  Unir todo
        input.value = `${cuerpoFormateado}-${dv}`;
    };

    // Conectar a los inputs
    const inputsRut = document.querySelectorAll('input[name="run_input"], input[name="rut"]');

    inputsRut.forEach(input => {
        input.addEventListener('input', formatearInputRut);
        
        // Para limitar también el "pegar" texto largo
        input.setAttribute('maxlength', '12'); 

        if(input.value) {
            formatearInputRut({ target: input });
        }
    });
});