// Datos para poblar la tabla (5 registros)
const datosTransacciones = [
    {
        fecha: "2024-02-15",
        nroVenta: "ML-23589741",
        nombreCompleto: "María González",
        usuario: "mariagonzalez",
        documento: "28.456.123",
        direccion: "Av. Corrientes 1234, CABA",
        producto: "Smartphone Samsung Galaxy S21",
        ventaDolares: 450,
        razonDevolucion: "Producto defectuoso",
        itemDevuelto: "Teléfono completo",
        prueba: "https://images.samsung.com/is/image/samsung/p6pim/ar/galaxy-s21/gallery/ar-galaxy-s21-5g-g991-sm-g991bzalaro-thumb-368338193"
    },
    {
        fecha: "2024-03-05",
        nroVenta: "ML-78452156",
        nombreCompleto: "Juan Rodríguez",
        usuario: "jrodriguez85",
        documento: "32.789.654",
        direccion: "Calle 9 de Julio 789, Córdoba",
        producto: "Laptop Lenovo ThinkPad",
        ventaDolares: 850,
        razonDevolucion: "No cumple expectativas",
        itemDevuelto: "Laptop y accesorios",
        prueba: "https://www.lenovo.com/medias/lenovo-laptops-thinkpad-x1-carbon-gen-9-14-series-front-logo.png?context=bWFzdGVyfHJvb3R8MzE3Nzl8aW1hZ2UvcG5nfGg0NC9oZDQvMTMxNjQ1OTY4ODk2MzAucG5nfDQxM2M4YWZhNTQwNWQxZWE2NjdjYjI4YmJiZmQwODc2MDA5NjkzNWRkY2I1ZTcyYWQ2ZjIxMzUxM2RkYWRmMTE"
    },
    {
        fecha: "2024-01-23",
        nroVenta: "ML-96325874",
        nombreCompleto: "Carlos Martínez",
        usuario: "cmartinez_22",
        documento: "25.369.147",
        direccion: "Calle San Martín 369, Mendoza",
        producto: "Auriculares Sony WH-1000XM4",
        ventaDolares: 220,
        razonDevolucion: "Entrega incorrecta",
        itemDevuelto: "Producto sellado",
        prueba: "https://www.sony.com.ar/image/cb82ab5df57fa5eb21c6894e97e35994?fmt=png-alpha&wid=660"
    },
    {
        fecha: "2024-04-10",
        nroVenta: "ML-41236587",
        nombreCompleto: "Ana Pérez",
        usuario: "anaperez_oficial",
        documento: "29.587.412",
        direccion: "Av. Belgrano 2541, Rosario",
        producto: "Monitor LG 27''",
        ventaDolares: 180,
        razonDevolucion: "Mejor oferta",
        itemDevuelto: "Monitor con base",
        prueba: "https://www.lg.com/ar/images/monitores/md07529913/gallery/D-02.jpg"
    },
    {
        fecha: "2024-02-28",
        nroVenta: "ML-14789632",
        nombreCompleto: "Roberto Sánchez",
        usuario: "rober_sanchez",
        documento: "35.741.258",
        direccion: "Calle Rivadavia 741, Mar del Plata",
        producto: "Teclado Mecánico Redragon",
        ventaDolares: 75,
        razonDevolucion: "No compatible",
        itemDevuelto: "Teclado en caja",
        prueba: "https://redragon.es/content/uploads/2021/10/REDRAGON-TECLADO-K552-KUMARA-RAINBOW-3.png"
    }
];

// Variables globales
let datos = localStorage.getItem('chorrodeml_datos') ? 
    JSON.parse(localStorage.getItem('chorrodeml_datos')) : 
    [...datosTransacciones];

// Limpiar localStorage al cargar para asegurar que se muestran los datos actualizados
localStorage.removeItem('chorrodeml_datos');
guardarDatosLocales();

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
function cargarDatos(datosMostrar = datos) {
    const tabla = document.getElementById('tablaCuerpo');
    tabla.innerHTML = '';
    
    console.log('Cargando datos en la tabla:', datosMostrar.length + ' registros');
    
    datosMostrar.forEach((item, index) => {
        const fila = document.createElement('tr');
        
        // Columnas de datos
        const columnas = [
            { key: 'fecha', formato: val => val },
            { key: 'nroVenta', formato: val => val },
            { key: 'nombreCompleto', formato: val => val },
            { key: 'usuario', formato: val => val || '-' },
            { key: 'documento', formato: val => val },
            { key: 'direccion', formato: val => val },
            { key: 'producto', formato: val => val },
            { key: 'ventaDolares', formato: val => `U$D ${val.toFixed(2)}` },
            { key: 'razonDevolucion', formato: val => val || '-' },
            { key: 'itemDevuelto', formato: val => val || '-' },
            { 
                key: 'prueba', 
                formato: val => {
                    if (val && (val.startsWith('data:image') || val.startsWith('http'))) {
                        return `<img src="${val}" class="img-thumbnail-preview" style="max-height: 50px; cursor: pointer;" />`;
                    }
                    return '-';
                } 
            }
        ];
        
        // Agregar las celdas de datos
        columnas.forEach(col => {
            const celda = document.createElement('td');
            celda.innerHTML = col.formato(item[col.key]);
            fila.appendChild(celda);
        });
        
        // Columna de acciones
        const celdaAcciones = document.createElement('td');
        celdaAcciones.className = 'd-flex justify-content-around';
        
        // Botón de editar
        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn btn-sm btn-outline-primary btn-action';
        btnEditar.innerHTML = '<i class="bi bi-pencil-square"></i>';
        btnEditar.style.display = 'none'; // Inicialmente oculto
        btnEditar.addEventListener('click', () => abrirModalEdicion(index));
        
        // Botón de eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn btn-sm btn-outline-danger btn-action';
        btnEliminar.innerHTML = '<i class="bi bi-trash"></i>';
        btnEliminar.style.display = 'none'; // Inicialmente oculto
        btnEliminar.addEventListener('click', () => abrirModalEliminar(index));
        
        celdaAcciones.appendChild(btnEditar);
        celdaAcciones.appendChild(btnEliminar);
        fila.appendChild(celdaAcciones);
        
        tabla.appendChild(fila);
    });
    
    // Actualizar la visibilidad de los botones según autenticación
    if (typeof updateAuthUI === 'function') {
        updateAuthUI();
    } else {
        console.warn('La función updateAuthUI no está disponible.');
    }
}

// Función para ordenar los datos
function ordenarDatos(columna) {
    if (ordenActual.columna === columna) {
        // Invierte la dirección si es la misma columna
        ordenActual.direccion = ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
        // Nueva columna, resetea a descendente
        ordenActual.columna = columna;
        ordenActual.direccion = 'desc';
    }
    
    // Ordenar los datos
    datos.sort((a, b) => {
        let valorA = a[columna];
        let valorB = b[columna];
        
        // Conversión para ordenamiento correcto
        if (typeof valorA === 'string') valorA = valorA.toLowerCase();
        if (typeof valorB === 'string') valorB = valorB.toLowerCase();
        
        // Aplicar dirección
        const factor = ordenActual.direccion === 'asc' ? 1 : -1;
        
        if (valorA < valorB) return -1 * factor;
        if (valorA > valorB) return 1 * factor;
        return 0;
    });
    
    // Actualizar íconos de ordenamiento
    const encabezados = document.querySelectorAll('.sortable');
    encabezados.forEach(encabezado => {
        const icono = encabezado.querySelector('i');
        const esColumnaActual = encabezado.getAttribute('data-key') === columna;
        
        if (esColumnaActual) {
            if (ordenActual.direccion === 'asc') {
                icono.className = 'bi bi-arrow-up';
            } else {
                icono.className = 'bi bi-arrow-down';
            }
        } else {
            icono.className = 'bi bi-arrow-down-up';
        }
    });
    
    // Cargar datos ordenados
    cargarDatos();
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
        document.getElementById('transaccionModalLabel').textContent = 'Nuevo Chorro';
        document.getElementById('transaccionForm').reset();
        
        // Configurar la fecha de hoy por defecto
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha').value = hoy;
        
        // Generar número de venta aleatorio para nueva transacción
        const numeroAleatorio = Math.floor(Math.random() * 90000000) + 10000000;
        document.getElementById('nroVenta').value = `ML-${numeroAleatorio}`;
        
        document.getElementById('transaccionId').value = '';
        modoEdicion = false;
        
        // Intentar mostrar el modal
        try {
            if (window.transaccionModal) {
                window.transaccionModal.show();
            } else {
                const modal = new bootstrap.Modal(document.getElementById('transaccionModal'));
                modal.show();
            }
        } catch (error) {
            console.error('Error al mostrar el modal:', error);
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
    
    // Intentar mostrar el modal
    try {
        if (window.transaccionModal) {
            window.transaccionModal.show();
        } else {
            const modal = new bootstrap.Modal(document.getElementById('transaccionModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error al mostrar el modal de edición:', error);
    }
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
    
    // Crear objeto de la transacción
    const transaccion = {
        fecha: document.getElementById('fecha').value,
        nroVenta: document.getElementById('nroVenta').value,
        nombreCompleto: document.getElementById('nombreCompleto').value,
        usuario: document.getElementById('nombreCompleto').value.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 100), // Generar usuario a partir del nombre
        documento: document.getElementById('documento').value,
        direccion: document.getElementById('direccion').value,
        producto: document.getElementById('producto').value,
        ventaDolares: parseFloat(document.getElementById('ventaDolares').value),
        razonDevolucion: document.getElementById('razonDevolucion').value,
        itemDevuelto: document.getElementById('itemDevuelto').value,
        prueba: ''
    };
    
    // Procesar imagen si se seleccionó una
    if (inputImagen.files && inputImagen.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            transaccion.prueba = e.target.result;
            finalizarGuardado();
        };
        reader.readAsDataURL(inputImagen.files[0]);
    } else {
        // Si es edición, conservar la imagen anterior
        if (modoEdicion && transaccionId !== '') {
            transaccion.prueba = datos[transaccionId].prueba;
        }
        finalizarGuardado();
    }
    
    // Función para finalizar el guardado después de procesar la imagen
    function finalizarGuardado() {
        if (modoEdicion && transaccionId !== '') {
            // Actualizar transacción existente
            datos[transaccionId] = transaccion;
        } else {
            // Agregar nueva transacción
            datos.unshift(transaccion);
        }
        
        // Guardar en localStorage
        guardarDatosLocales();
        
        // Reordenar y recargar la tabla
        ordenarDatos(ordenActual.columna);
        
        // Cerrar el modal
        try {
            if (window.transaccionModal) {
                window.transaccionModal.hide();
            } else {
                const modal = bootstrap.Modal.getInstance(document.getElementById('transaccionModal'));
                if (modal) modal.hide();
            }
        } catch (error) {
            console.error('Error al cerrar el modal:', error);
        }
    }
}

// Función para abrir el modal de confirmación de eliminación
function abrirModalEliminar(index) {
    idTransaccionEliminar = index;
    try {
        if (window.eliminarModal) {
            window.eliminarModal.show();
        } else {
            const modal = new bootstrap.Modal(document.getElementById('eliminarModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error al mostrar el modal de eliminación:', error);
    }
}

// Función para eliminar una transacción
function eliminarTransaccion() {
    if (idTransaccionEliminar !== null) {
        datos.splice(idTransaccionEliminar, 1);
        idTransaccionEliminar = null;
        
        // Guardar cambios en localStorage
        guardarDatosLocales();
        
        // Cerrar el modal
        try {
            if (window.eliminarModal) {
                window.eliminarModal.hide();
            } else {
                const modal = bootstrap.Modal.getInstance(document.getElementById('eliminarModal'));
                if (modal) modal.hide();
            }
        } catch (error) {
            console.error('Error al cerrar el modal de eliminación:', error);
        }
        
        // Reordenar y mostrar datos actualizados
        ordenarDatos(ordenActual.columna);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado en data.js - Cargando datos iniciales...');
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
    if (campoBusqueda) {
        campoBusqueda.addEventListener('input', filtrarDatos);
    }
    
    // Configurar botón para agregar nueva transacción
    const btnAgregar = document.getElementById('btnAgregarTransaccion');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', abrirModalCreacion);
    }
    
    // Configurar botón para guardar transacción
    const btnGuardar = document.getElementById('btnGuardarTransaccion');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarTransaccion);
    }
    
    // Configurar botón para confirmar eliminación
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', eliminarTransaccion);
    }
});

// Cargar datos inmediatamente (para solucionar problema de datos no visibles)
console.log('Inicializando carga inmediata...');
// Esperar a que el DOM esté listo antes de intentar cargar los datos
if (document.readyState === 'loading') {
    console.log('El documento aún está cargando, esperando al evento DOMContentLoaded...');
    // Si el documento aún está cargando, esperar al evento DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM listo (desde event listener) - Cargando datos...');
        setTimeout(() => {
            ordenarDatos('fecha');
        }, 100);
    });
} else {
    // Si el documento ya está cargado, cargar los datos inmediatamente
    console.log('DOM ya está listo - Cargando datos inmediatamente...');
    setTimeout(() => {
        ordenarDatos('fecha');
    }, 100);
}
