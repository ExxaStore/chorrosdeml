// Variables globales
let datos = localStorage.getItem('chorrodeml_datos') ? 
    JSON.parse(localStorage.getItem('chorrodeml_datos')) : 
    [...datosTransacciones];

let ordenActual = {
    columna: 'fecha',
    direccion: 'desc'
};

let idTransaccionEliminar = null;
let modoEdicion = false;

// Función para depurar en consola
function debug(msg, obj) {
    console.log('DEBUG: ' + msg, obj || '');
}

// Función para guardar datos en localStorage
function guardarDatosLocales() {
    localStorage.setItem('chorrodeml_datos', JSON.stringify(datos));
}

// Función para cargar los datos en la tabla
function cargarDatos(datos) {
    debug('Cargando datos en la tabla', datos.length + ' registros');
    const tablaCuerpo = document.getElementById('tablaCuerpo');
    tablaCuerpo.innerHTML = '';

    datos.forEach((item, index) => {
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
            <td>
                <button class="btn-action btn-action-edit" data-index="${index}">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn-action btn-action-delete" data-index="${index}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tablaCuerpo.appendChild(fila);
    });

    // Agregar event listeners a los botones de acción
    document.querySelectorAll('.btn-action-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            debug('Botón editar cliqueado', 'índice: ' + index);
            abrirModalEdicion(index);
        });
    });

    document.querySelectorAll('.btn-action-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            debug('Botón eliminar cliqueado', 'índice: ' + index);
            abrirModalEliminar(index);
        });
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
    let datosFiltrados;
    
    if (!textoBusqueda) {
        datosFiltrados = [...datos];
    } else {
        datosFiltrados = datos.filter(item => {
            return Object.values(item).some(valor => 
                valor.toString().toLowerCase().includes(textoBusqueda)
            );
        });
    }
    
    // Recargar la tabla con los datos filtrados
    cargarDatos(datosFiltrados);
}

// Función para abrir el modal en modo creación
function abrirModalCreacion() {
    debug('Abriendo modal en modo creación');
    
    try {
        document.getElementById('transaccionModalLabel').textContent = 'Nuevo Ladrón';
        document.getElementById('transaccionForm').reset();
        
        // Configurar la fecha de hoy por defecto
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha').value = hoy;
        
        // Generar número de venta aleatorio para nueva transacción
        const numeroAleatorio = Math.floor(Math.random() * 90000000) + 10000000;
        document.getElementById('nroVenta').value = `ML-${numeroAleatorio}`;
        
        document.getElementById('transaccionId').value = '';
        modoEdicion = false;
        
        // Intentar inicializar el modal desde bootstrap o usar la variable global si existe
        try {
            const modal = new bootstrap.Modal(document.getElementById('transaccionModal'));
            modal.show();
            debug('Modal inicializado y mostrado con nueva instancia');
        } catch (error) {
            debug('Error al inicializar modal con nueva instancia', error);
            
            // Intentar usar la variable global definida en el script adicional
            if (window.transaccionModal) {
                window.transaccionModal.show();
                debug('Modal mostrado desde variable global');
            } else {
                console.error('No se pudo mostrar el modal. Error:', error);
            }
        }
    } catch (error) {
        console.error('Error al abrir modal de creación:', error);
    }
}

// Función para abrir el modal en modo edición
function abrirModalEdicion(index) {
    const transaccion = datos[index];
    document.getElementById('transaccionModalLabel').textContent = 'Editar Transacción';
    
    // Llenar el formulario con los datos existentes
    document.getElementById('fecha').value = transaccion.fecha;
    document.getElementById('nroVenta').value = transaccion.nroVenta;
    document.getElementById('nombreCompleto').value = transaccion.nombreCompleto;
    document.getElementById('documento').value = transaccion.documento;
    document.getElementById('direccion').value = transaccion.direccion;
    document.getElementById('producto').value = transaccion.producto;
    document.getElementById('ventaDolares').value = transaccion.ventaDolares;
    document.getElementById('razonDevolucion').value = transaccion.razonDevolucion || '';
    document.getElementById('itemDevuelto').value = transaccion.itemDevuelto || '';
    document.getElementById('prueba').value = transaccion.prueba || '';
    
    document.getElementById('transaccionId').value = index;
    modoEdicion = true;
    
    const transaccionModal = new bootstrap.Modal(document.getElementById('transaccionModal'));
    transaccionModal.show();
}

// Función para guardar una transacción (crear nueva o editar existente)
function guardarTransaccion() {
    // Validar el formulario
    const formulario = document.getElementById('transaccionForm');
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }
    
    // Obtener valores del formulario
    const nuevaTransaccion = {
        fecha: document.getElementById('fecha').value,
        nroVenta: document.getElementById('nroVenta').value,
        nombreCompleto: document.getElementById('nombreCompleto').value,
        documento: document.getElementById('documento').value,
        direccion: document.getElementById('direccion').value,
        producto: document.getElementById('producto').value,
        ventaDolares: parseFloat(document.getElementById('ventaDolares').value),
        razonDevolucion: document.getElementById('razonDevolucion').value,
        itemDevuelto: document.getElementById('itemDevuelto').value,
        prueba: document.getElementById('prueba').value
    };
    
    if (modoEdicion) {
        // Modo edición - actualizar transacción existente
        const index = document.getElementById('transaccionId').value;
        datos[index] = nuevaTransaccion;
    } else {
        // Modo creación - agregar nueva transacción
        datos.push(nuevaTransaccion);
    }
    
    // Guardar cambios en localStorage
    guardarDatosLocales();
    
    // Cerrar el modal
    const transaccionModal = bootstrap.Modal.getInstance(document.getElementById('transaccionModal'));
    transaccionModal.hide();
    
    // Reordenar y mostrar datos actualizados
    ordenarDatos(ordenActual.columna);
}

// Función para abrir el modal de confirmación de eliminación
function abrirModalEliminar(index) {
    idTransaccionEliminar = index;
    const eliminarModal = new bootstrap.Modal(document.getElementById('eliminarModal'));
    eliminarModal.show();
}

// Función para eliminar una transacción
function eliminarTransaccion() {
    if (idTransaccionEliminar !== null) {
        datos.splice(idTransaccionEliminar, 1);
        idTransaccionEliminar = null;
        
        // Guardar cambios en localStorage
        guardarDatosLocales();
        
        // Cerrar el modal
        const eliminarModal = bootstrap.Modal.getInstance(document.getElementById('eliminarModal'));
        eliminarModal.hide();
        
        // Reordenar y mostrar datos actualizados
        ordenarDatos(ordenActual.columna);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    debug('Documento cargado, inicializando la aplicación');
    
    try {
        // Guardar datos iniciales en localStorage si no existen
        if (!localStorage.getItem('chorrodeml_datos')) {
            debug('Guardando datos iniciales en localStorage');
            guardarDatosLocales();
        }
        
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
        
        // Configurar botón para agregar nueva transacción
        const btnAgregar = document.getElementById('btnAgregarTransaccion');
        if (btnAgregar) {
            debug('Configurando botón para agregar nueva transacción');
            btnAgregar.addEventListener('click', () => {
                debug('Botón Nuevo Ladrón cliqueado');
                abrirModalCreacion();
            });
        } else {
            console.error('Error: No se encontró el botón para agregar transacción');
        }
        
        // Configurar botón para guardar transacción
        const btnGuardar = document.getElementById('btnGuardarTransaccion');
        if (btnGuardar) {
            debug('Configurando botón para guardar transacción');
            btnGuardar.addEventListener('click', guardarTransaccion);
        } else {
            console.error('Error: No se encontró el botón para guardar transacción');
        }
        
        // Configurar botón para confirmar eliminación
        const btnConfirmar = document.getElementById('btnConfirmarEliminar');
        if (btnConfirmar) {
            debug('Configurando botón para confirmar eliminación');
            btnConfirmar.addEventListener('click', eliminarTransaccion);
        } else {
            console.error('Error: No se encontró el botón para confirmar eliminación');
        }
        
        debug('Inicialización completada');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
}); 