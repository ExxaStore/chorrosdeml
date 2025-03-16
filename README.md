# Chorros de Mercadolibre

Una aplicación web para gestionar y visualizar datos de ventas y devoluciones de MercadoLibre, con funcionalidad CRUD completa.

## Características

- Diseño inspirado en MercadoLibre Argentina
- Visualización de datos en formato de tabla
- Ordenamiento por cualquier columna (ascendente/descendente)
- Búsqueda en tiempo real sobre todos los campos
- Funcionalidad CRUD completa:
  - **C**reate: Añadir nuevas transacciones
  - **R**ead: Visualizar todas las transacciones
  - **U**pdate: Editar transacciones existentes
  - **D**elete: Eliminar transacciones
- Persistencia de datos usando localStorage
- Diseño responsivo para adaptarse a diferentes dispositivos
- Datos formateados para mejor visualización (fechas, montos)

## Estructura de datos

La aplicación gestiona los siguientes campos para cada transacción:

- **Fecha:** Fecha de la transacción
- **Nro Venta ML:** Número de referencia de la venta en MercadoLibre
- **Nombre y Apellido:** Datos del cliente
- **Documento:** Número de identificación del cliente
- **Dirección:** Ubicación física del cliente
- **Producto:** Artículo vendido
- **Venta U$D:** Monto de la venta en dólares
- **Razón Devolución:** Motivo por el cual se realizó la devolución (si aplica)
- **Qué Devolvió:** Detalle de los artículos devueltos
- **Prueba:** Documentación o evidencia relacionada con la transacción

## Cómo usar

1. Abra el archivo `index.html` en cualquier navegador web moderno
2. Para ordenar los datos, haga clic en el encabezado de la columna deseada
3. Para buscar, escriba en el campo de búsqueda en la parte superior
4. Para agregar una transacción, haga clic en "Nueva transacción"
5. Para editar o eliminar, utilice los botones de acción en cada fila

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5.3
- Bootstrap Icons
- LocalStorage para persistencia de datos

## Implementación en servidor

Para implementar esta aplicación en un servidor web:

1. Suba todos los archivos a su servidor web o hosting
2. No se requiere configuración especial del servidor ya que es una aplicación de cliente puro
3. Alternativas de hosting gratuito: GitHub Pages, Netlify, Vercel, Firebase Hosting

## Desarrollo

Para modificar o ampliar esta aplicación:

1. Edite los datos de ejemplo en `data.js`
2. Personalice los estilos en `styles.css`
3. Modifique la lógica de funcionamiento en `script.js`

## Autor

ChorrosDeML - 2024 