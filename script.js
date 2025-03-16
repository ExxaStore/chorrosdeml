// Variables globales
let datos = [...datosTransacciones];
let ordenActual = {
    columna: 'fecha',
    direccion: 'desc'
};

// Función para cargar los datos en la tabla
function cargarDatos(datos) {
    const tablaCuerpo = document.getElementById('tablaCuerpo');
    tablaCuerpo.innerHTML = '';

    datos.forEach(item => {
        const fila = document.createElement('tr');
        
        // Formatear la fecha para visualización
        const fecha = new Date(item.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');
        
        // Formatear el monto para visualización
        const montoFormateado = item.ventaDolares.toLocaleString('es-ES', {
            style: 'currency',
            currency: 'USD'
        });
        
        fila.innerHTML = `
            <td>${fechaFormateada}</td>
            <td>${item.nroVenta}</td>
            <td>${item.nombreCompleto}</td>
            <td>${item.documento}</td>
            <td>${item.direccion}</td>
            <td>${item.producto}</td>
            <td>${montoFormateado}</td>
            <td>${item.razonDevolucion || '-'}</td>
            <td>${item.itemDevuelto || '-'}</td>
            <td>${item.prueba || '-'}</td>
        `;
        
        tablaCuerpo.appendChild(fila);
    });
}

// Función para ordenar los datos
function ordenarDatos(columna) {
    // Actualizar la dirección de ordenamiento
    if (ordenActual.columna === columna) {
        ordenActual.direccion = ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
        ordenActual.columna = columna;
        ordenActual.direccion = 'asc';
    }
    
    // Ordenar los datos
    datos.sort((a, b) => {
        let valorA = a[columna];
        let valorB = b[columna];
        
        // Conversión específica para ordenamiento de fechas
        if (columna === 'fecha') {
            valorA = new Date(valorA);
            valorB = new Date(valorB);
        }
        
        // Conversión específica para ordenamiento numérico
        if (columna === 'ventaDolares') {
            valorA = Number(valorA);
            valorB = Number(valorB);
        }
        
        // Ordenamiento por defecto para strings
        if (typeof valorA === 'string' && typeof valorB === 'string') {
            return ordenActual.direccion === 'asc' 
                ? valorA.localeCompare(valorB, 'es', { sensitivity: 'base' })
                : valorB.localeCompare(valorA, 'es', { sensitivity: 'base' });
        }
        
        // Ordenamiento para otros tipos
        return ordenActual.direccion === 'asc' 
            ? valorA - valorB 
            : valorB - valorA;
    });
    
    // Actualizar los indicadores visuales de ordenamiento
    const encabezados = document.querySelectorAll('.sortable');
    encabezados.forEach(encabezado => {
        encabezado.classList.remove('asc', 'desc');
        
        const columnaEncabezado = encabezado.getAttribute('data-key');
        if (columnaEncabezado === columna) {
            encabezado.classList.add(ordenActual.direccion);
        }
    });
    
    // Recargar la tabla con los datos ordenados
    cargarDatos(datos);
}

// Función para filtrar los datos
function filtrarDatos() {
    const textoBusqueda = document.getElementById('busqueda').value.toLowerCase();
    
    if (!textoBusqueda) {
        datos = [...datosTransacciones];
    } else {
        datos = datosTransacciones.filter(item => {
            return Object.values(item).some(valor => 
                valor.toString().toLowerCase().includes(textoBusqueda)
            );
        });
    }
    
    // Reordenar según el ordenamiento actual
    ordenarDatos(ordenActual.columna);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos iniciales
    ordenarDatos('fecha');
    
    // Configurar eventos de ordenamiento en encabezados
    const encabezados = document.querySelectorAll('.sortable');
    encabezados.forEach(encabezado => {
        encabezado.addEventListener('click', () => {
            const columna = encabezado.getAttribute('data-key');
            ordenarDatos(columna);
        });
    });
    
    // Configurar búsqueda
    const campoBusqueda = document.getElementById('busqueda');
    campoBusqueda.addEventListener('input', filtrarDatos);
}); 