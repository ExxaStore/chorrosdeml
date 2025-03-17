// Variables globales
let datos = localStorage.getItem('chorrodeml_datos') ? 
    JSON.parse(localStorage.getItem('chorrodeml_datos')) : 
    [...datosTransacciones];

// Limpiar todos los datos del campo "Prueba" al cargar la primera vez
if (!localStorage.getItem('chorrodeml_datos')) {
    datos.forEach(item => {
        item.prueba = '';
    });
    guardarDatosLocales();
}

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

    // Verificar si el usuario está autenticado
    const userStr = localStorage.getItem('chorrodeml_user');
    const isLoggedIn = !!userStr;
    const displayStyle = isLoggedIn ? 'inline-flex' : 'none';

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
        
        // Preparar la celda para la prueba (imagen)
        let pruebaHTML = '-';
        if (item.prueba && item.prueba.startsWith('data:image')) {
            pruebaHTML = `<img src="${item.prueba}" alt="Imagen de prueba" class="img-thumbnail-preview">`;
        }
        
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
            <td>${pruebaHTML}</td>
            <td>
                <button class="btn-action btn-action-edit" data-index="${index}" style="display: ${displayStyle}">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn-action btn-action-delete" data-index="${index}" style="display: ${displayStyle}">
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
    
    // Limpiar cualquier vista previa anterior
    const preview = document.getElementById('imagenPreview');
    preview.innerHTML = '';
    
    // Si hay una imagen, mostrarla en la vista previa
    if (transaccion.prueba && transaccion.prueba.startsWith('data:image')) {
        const img = document.createElement('img');
        img.src = transaccion.prueba;
        img.classList.add('img-thumbnail', 'mt-2');
        img.style.maxHeight = '150px';
        preview.appendChild(img);
    }
    
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
    const transaccionId = document.getElementById('transaccionId').value;
    const inputImagen = document.getElementById('prueba');
    
    // Crear objeto base de la transacción
    const transaccion = {
        fecha: document.getElementById('fecha').value,
        nroVenta: document.getElementById('nroVenta').value,
        nombreCompleto: document.getElementById('nombreCompleto').value,
        documento: document.getElementById('documento').value,
        direccion: document.getElementById('direccion').value,
        producto: document.getElementById('producto').value,
        ventaDolares: parseFloat(document.getElementById('ventaDolares').value),
        razonDevolucion: document.getElementById('razonDevolucion').value,
        itemDevuelto: document.getElementById('itemDevuelto').value,
        prueba: ''
    };
    
    // Función para continuar el guardado después de procesar la imagen
    const finalizarGuardado = () => {
        if (modoEdicion) {
            // Actualizar transacción existente
            datos[transaccionId] = transaccion;
            debug('Transacción actualizada', transaccion);
        } else {
            // Agregar nueva transacción
            datos.unshift(transaccion);
            debug('Nueva transacción agregada', transaccion);
        }
        
        // Guardar en localStorage
        guardarDatosLocales();
        
        // Reordenar y recargar la tabla
        ordenarDatos(ordenActual.columna);
        
        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('transaccionModal'));
        modal.hide();
    };
    
    // Procesar la imagen si hay un archivo seleccionado
    if (inputImagen.files && inputImagen.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Guardar directamente el resultado en base64
            transaccion.prueba = e.target.result;
            finalizarGuardado();
        };
        
        // Leer como URL de datos (base64)
        reader.readAsDataURL(inputImagen.files[0]);
    } else {
        // Si estamos en modo edición, mantener la imagen existente
        if (modoEdicion) {
            transaccion.prueba = datos[transaccionId].prueba || '';
        }
        finalizarGuardado();
    }
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