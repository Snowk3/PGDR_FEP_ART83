/******************************************************************************
 * SISTEMA DE DEVOLUCIÓN IVA EXPORTADOR
 * Módulo: Decisión F3600 (VERSIÓN MODULAR)
 * Descripción: Manejo de la lógica de decisiones para devolución de IVA exportador
 * Última actualización: 19/05/2025
 ******************************************************************************/

/******************************************************************************
 * 1. FUNCIONES BASE Y UTILITARIAS
 * - Constantes globales, formatos de moneda, conversiones, generación de IDs, etc.
 ******************************************************************************/

// Valores y constantes globales
const UTM_VALOR = 65182;
const DEVOLUCION_SOLICITADA = 15000000;
const FECHA_SOLICITUD = new Date('2025-05-21');
const folioformulario = 123456789

// Formatos de moneda y números
const FORMATO_MONEDA = new Intl.NumberFormat('es-CL', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

const FORMATO_UTM = new Intl.NumberFormat('es-CL', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

/**
 * Convierte un monto desde pesos chilenos a UTM
 * @param {number} valorPesos - Monto en pesos chilenos
 * @returns {number} Valor convertido a UTM
 */
function convertirAUTM(valorPesos) {
    return valorPesos / UTM_VALOR;
}

/**
 * Genera un ID único para resoluciones FEP
 * @returns {string} ID con formato FEP-YYYYMMDD-XXXX
 */
function generarIdResolucion() {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `FEP-${year}${month}${day}-${random}`;
}

/**
 * Genera un número de resolución FEP
 * @returns {string} Número de resolución generado
 */
function generarNumeroResolucion() {
    const año = new Date().getFullYear();
    const numero = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${numero}-${año}`;
}

/**
 * Genera un ID de expediente electrónico
 * @returns {string} ID de expediente generado
 */
function generarIdExpediente() {
    const año = new Date().getFullYear();
    const numero = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `EE-${año}-${numero}`;
}

/**
 * Genera un número de folio único para la solicitud FEP
 * @returns {string} Folio generado con formato YYYYMMDD-XXX
 */
function generarFolioSolicitud() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `${año}${mes}${dia}-${random}`;
}

/**
 * Formatea una fecha al formato dd/mm/yyyy
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatoFecha(fecha) {
    return fecha.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Obtiene el valor numérico de un input eliminando formato de moneda
 * @param {string} inputId - ID del elemento input
 * @returns {number} Valor numérico del input
 */
function obtenerValorNumerico(inputId) {
    const elemento = document.getElementById(inputId);
    if (!elemento) return 0;
    const valor = elemento.value.replace(/\D/g, '');
    return valor ? parseInt(valor) : 0;
}

/******************************************************************************
 * 2. FUNCIONES COMPARTIDAS / CORE
 * - Funcionalidad común utilizada en múltiples módulos
 ******************************************************************************/

/**
 * Formatea un número con separadores de miles y actualiza UTM
 * @param {HTMLInputElement} input - El elemento input a formatear
 */
function formatNumber(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor) {
        input.value = FORMATO_MONEDA.format(parseInt(valor));
    }
    actualizarCamposUTM();
}

/**
 * Actualiza todos los campos UTM basados en sus correspondientes montos en pesos
 */
function actualizarCamposUTM() {
    // Devolución solicitada
    const devolucionSolicitada = obtenerValorNumerico('devolucionSolicitada');
    if (devolucionSolicitada > 0) {
        const utmSolicitada = convertirAUTM(devolucionSolicitada);
        document.getElementById('devolucionSolicitadaUTM').value = FORMATO_UTM.format(utmSolicitada);
    }

    // Monto autorizado
    const montoAutorizado = obtenerValorNumerico('montoAutorizado');
    if (montoAutorizado >= 0) {
        const utmAutorizada = convertirAUTM(montoAutorizado);
        document.getElementById('montoAutorizadoUTM').value = FORMATO_UTM.format(utmAutorizada);
        
        // Monto rechazado (calculado como devolución solicitada - monto autorizado)
        if (devolucionSolicitada >= montoAutorizado) {
            const montoRechazado = devolucionSolicitada - montoAutorizado;
            const utmRechazada = convertirAUTM(montoRechazado);
            document.getElementById('montoRechazadoUTM').value = FORMATO_UTM.format(utmRechazada);
            // Actualizar también el campo de monto rechazado en pesos si existe
            const montoRechazadoElement = document.getElementById('montoRechazado');
            if (montoRechazadoElement) {
                montoRechazadoElement.value = FORMATO_MONEDA.format(montoRechazado);
            }
        }
    }
}

/**
 * Actualiza el valor UTM de un campo específico
 * @param {string} campoMonedaId - ID del campo con el monto en moneda
 * @param {string} campoUtmId - ID del campo donde se mostrará el valor en UTM
 */
function actualizarUTM(campoMonedaId, campoUtmId) {
    const valorMoneda = obtenerValorNumerico(campoMonedaId);
    if (valorMoneda >= 0) {
        const valorUTM = convertirAUTM(valorMoneda);
        document.getElementById(campoUtmId).value = FORMATO_UTM.format(valorUTM);
    }
}

/**
 * Muestra un mensaje de alerta personalizado
 * @param {string} mensaje - El mensaje a mostrar
 * @param {string} [tipo='info'] - El tipo de alerta (error, warning, info, success)
 */
function mostrarAlerta(mensaje, tipo = 'info') {
    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alerta-popup alerta-${tipo}`;
    alertaDiv.innerHTML = `
        <div class="alerta-contenido">
            <p>${mensaje}</p>
            <button onclick="this.parentElement.parentElement.remove()">Aceptar</button>
        </div>
    `;
    document.body.appendChild(alertaDiv);
}

/**
 * Muestra el popup con un mensaje
 * @param {string} mensaje - Mensaje a mostrar en el popup
 */
function mostrarPopupContacto(mensaje) {
    document.getElementById('popupMensaje').textContent = mensaje;
    document.getElementById('popupContacto').style.display = 'flex';
}

/**
 * Cierra el popup de contacto
 */
function cerrarPopupContacto() {
    document.getElementById('popupContacto').style.display = 'none';
}

/**
 * Updates the expedition ID across all places in the interface
 * @param {string} expedienteID - The ID to set (if not provided, a new one will be generated)
 * @returns {string} The expedition ID that was set
 */
function actualizarIdExpediente(expedienteID = null) {
    // If no ID provided, generate a new one
    if (!expedienteID) {
        expedienteID = generarIdExpediente();
    }
    
    // Update the ID in the main section
    const mainExpedienteElement = document.getElementById('idExpediente');
    if (mainExpedienteElement) {
        mainExpedienteElement.textContent = expedienteID;
    }
    
    // Update the ID in the FEP section
    const fepExpedienteElement = document.getElementById('idExpedienteFep');
    if (fepExpedienteElement) {
        fepExpedienteElement.textContent = expedienteID;
    }
    
    return expedienteID;
}

/**
 * Configura los tooltips y ayudas contextuales de la interfaz
 */
function configurarTooltips() {
    const elementos = document.querySelectorAll('[data-tooltip]');
    elementos.forEach(elemento => {
        elemento.setAttribute('title', elemento.dataset.tooltip);
    });
}

/******************************************************************************
 * 3. GESTIÓN DE NAVEGACIÓN Y PESTAÑAS
 * - Funciones para la navegación entre pestañas y UI común
 ******************************************************************************/

/**
 * Maneja la navegación entre pestaanas
 * @param {Event} event - El evento del click
 * @param {string} tabId - El ID del contenido de la pestaana a mostrar
 */
function handleTabNavigation(event, tabId) {
    hideAllTabContents();
    deactivateAllTabs();
    showSelectedTab(tabId);
    setActiveTab(event.currentTarget);
    
    // Inicializar contenido cuando se navega a la pestaña FEP
    if (tabId === 'tabFep') {
        const devolucionSolicitada = document.getElementById('devolucionSolicitada').value;
        document.getElementById('montoSolicitadoFep').textContent = devolucionSolicitada;
        document.getElementById('fechaFep').textContent = new Date().toLocaleDateString('es-CL');
        document.getElementById('periodoTributario').textContent = '202504';
        document.getElementById('folioSolicitud').textContent = generarFolioSolicitud();
        
        // Sincronizar el ID del expediente entre secciones
        const mainIdExpediente = document.getElementById('idExpediente').textContent;
        if (mainIdExpediente) {
            // Si hay un ID existente en la sección principal, usarlo
            actualizarIdExpediente(mainIdExpediente);
        } else if (document.getElementById('idExpedienteFep').textContent) {
            // Si hay un ID en la sección FEP pero no en la principal, usarlo
            actualizarIdExpediente(document.getElementById('idExpedienteFep').textContent);
        }
        
        // Asegurar que todas las secciones FEP sean visibles
        document.querySelectorAll('.subsection-content').forEach(section => {
            section.style.display = 'block';
            section.classList.remove('collapsed');
        });
    }
}

/**
 * Oculta todos los contenidos de las pestañas
 */
function hideAllTabContents() {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
}

/**
 * Desactiva todas las pestañas
 */
function deactivateAllTabs() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
}

/**
 * Muestra el contenido de la pestaña seleccionada
 * @param {string} tabId - El ID del contenido a mostrar
 */
function showSelectedTab(tabId) {
    document.getElementById(tabId).classList.add('active');
}

/**
 * Marca la pestaña seleccionada como activa
 * @param {HTMLElement} selectedTab - El elemento de la pestaña seleccionada
 */
function setActiveTab(selectedTab) {
    selectedTab.classList.add('active');
}

/******************************************************************************
 * 4. SECCIÓN OBSERVACIONES NO JUSTIFICADAS
 * - Gestión de la pestaña de observaciones no justificadas
 ******************************************************************************/

/**
 * Abre la hoja de trabajo para una observación específica
 * @param {string} obsId - ID de la observación
 */
function abrirHojaTrabajo(obsId) {
    // Mostrar el popup
    const popup = document.getElementById('worksheetPopup');
    popup.style.display = 'block';

    // Actualizar el número de observación en el título
    document.getElementById('obsNumber').textContent = obsId;

    // Cargar datos de ejemplo (reemplazar con datos reales de tu sistema)
    cargarDatosHojaTrabajo(obsId);

    // Configurar los eventos de los botones
    configurarBotonesHojaTrabajo();
}

/**
 * Carga los datos en las tablas y checklist de la hoja de trabajo
 * @param {string} obsId - ID de la observación
 */
function cargarDatosHojaTrabajo(obsId) {
    // Ejemplo de datos (reemplazar con datos reales)
    const codigos3600 = [
        { codigo: '001', nombre: 'Código Ejemplo 1', valor: '1000000' },
        { codigo: '002', nombre: 'Código Ejemplo 2', valor: '2000000' }
    ];

    const vectoresPropios = [
        { codigo: 'VP1', nombre: 'Vector Propio 1', valor: '500000' },
        { codigo: 'VP2', nombre: 'Vector Propio 2', valor: '750000' }
    ];

    const vectoresComplementables = [
        { codigo: 'VC1', nombre: 'Vector DDJJ 1', valor: '300000' },
        { codigo: 'VC2', nombre: 'Vector DDJJ 2', valor: '450000' }
    ];

    const vectoresTerceros = [
        { codigo: 'VT1', nombre: 'Vector Tercero 1', valor: '200000' },
        { codigo: 'VT2', nombre: 'Vector Tercero 2', valor: '350000' }
    ];

    const revisiones = [
        'Verificación de documentación respaldatoria',
        'Validación de montos declarados',
        'Comprobación de fechas',
        'Revisión de requisitos formales'
    ];

    // Llenar las tablas
    llenarTabla('codigos3600Table', codigos3600);
    llenarTabla('vectoresPropiosTable', vectoresPropios);
    llenarTabla('vectoresComplementablesTable', vectoresComplementables);
    llenarTabla('vectoresTercerosTable', vectoresTerceros);

    // Crear checklist
    crearChecklist(revisiones);
}

/**
 * Llena una tabla con los datos proporcionados
 * @param {string} tableId - ID de la tabla
 * @param {Array} datos - Array de objetos con los datos
 */
function llenarTabla(tableId, datos) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = '';

    datos.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.codigo}</td>
            <td>${item.nombre}</td>
            <td>${item.valor}</td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Crea el checklist de revisiones
 * @param {Array} revisiones - Array de strings con las revisiones
 */
function crearChecklist(revisiones) {
    const container = document.getElementById('revisionesChecklist');
    container.innerHTML = '';

    revisiones.forEach((revision, index) => {
        const div = document.createElement('div');
        div.className = 'checklist-item';
        div.innerHTML = `
            <input type="checkbox" id="check${index}" class="revision-check">
            <label for="check${index}">${revision}</label>
        `;
        container.appendChild(div);
    });
}

/**
 * Configura los eventos de los botones de la hoja de trabajo
 */
function configurarBotonesHojaTrabajo() {
    // Botón de Justificación de Jefe
    document.getElementById('btnJustificacionJefe').onclick = function() {
        // Implementar lógica para justificación de jefe
        alert('Solicitando justificación del jefe de grupo...');
    };

    // Botón de Grabar
    document.getElementById('btnGrabar').onclick = function() {
        guardarHojaTrabajo();
    };

    // Botón de Salir
    document.getElementById('btnSalir').onclick = function() {
        cerrarHojaTrabajo();
    };
}

/**
 * Guarda los datos de la hoja de trabajo
 */
function guardarHojaTrabajo() {
    // Obtener valores del formulario
    const comentarios = document.getElementById('worksheetComentarios').value;
    const revisiones = Array.from(document.querySelectorAll('.revision-check'))
        .map(check => ({
            texto: check.nextElementSibling.textContent,
            checked: check.checked
        }));

    // Validar que se hayan completado todas las revisiones
    if (!validarRevisiones(revisiones)) {
        mostrarAlerta('Debe completar todas las revisiones antes de guardar', 'error');
        return;
    }

    // Aquí implementar la lógica para guardar los datos
    console.log('Guardando hoja de trabajo...', { comentarios, revisiones });
    mostrarAlerta('Hoja de trabajo guardada exitosamente', 'success');
    cerrarHojaTrabajo();
}

/**
 * Valida que todas las revisiones estén marcadas
 * @param {Array} revisiones - Array de objetos con las revisiones
 * @returns {boolean} - true si todas las revisiones están marcadas
 */
function validarRevisiones(revisiones) {
    return revisiones.every(revision => revision.checked);
}

/**
 * Cierra la hoja de trabajo
 */
function cerrarHojaTrabajo() {
    const popup = document.getElementById('worksheetPopup');
    popup.style.display = 'none';
    
    // Limpiar formulario
    document.getElementById('worksheetComentarios').value = '';
    document.querySelectorAll('.revision-check').forEach(check => check.checked = false);
}

/******************************************************************************
 * 5. SECCIÓN OBSERVACIONES JUSTIFICADAS
 * - Gestión de la pestaña de observaciones justificadas
 ******************************************************************************/

// Aquí se agregarán las funciones específicas para la gestión de observaciones justificadas
// a medida que se implementen en el sistema

/******************************************************************************
 * 6. SECCIÓN DECISIÓN
 * - Proceso de toma de decisión y validaciones
 ******************************************************************************/
/**
 * Calcula la fecha máxima de decisión sumando 2 días a la fecha de solicitud
 * @returns {Date} Fecha máxima para decisión 48 horas (reemplaza 5 dias ojo)
 */
function calcularFechaMaxDesc48() {
    const fechaMax = new Date(FECHA_SOLICITUD);
    fechaMax.setDate(fechaMax.getDate() + 5); // Sumar 5 días a la fecha de solicitud
    return fechaMax;
}
/**
 * Valida que se haya seleccionado una decisión
 * @returns {boolean} true si hay una decisión seleccionada
 */
function validarDecision() {
    const radioButtons = document.getElementsByName('decisionCruce');
    return Array.from(radioButtons).some(radio => radio.checked);
}

/**
 * Valida que se hayan ingresado los montos requeridos
 * @returns {boolean} true si los montos están ingresados correctamente
 */
function validarMontos() {
    const devolucionSolicitada = obtenerValorNumerico('devolucionSolicitada');
    const montoAutorizado = obtenerValorNumerico('montoAutorizado');
    return devolucionSolicitada > 0 && montoAutorizado >= 0 && montoAutorizado <= devolucionSolicitada;
}

/**
 * Actualiza el estado de habilitación de los botones según las validaciones
 */
function validarYActualizarBotones() {
    const todoValido = validarDecision() && validarMontos();
    const botones = document.querySelectorAll('.accion-btn');
    botones.forEach(boton => {
        boton.disabled = !todoValido;
    });
}
// =====================
// Lógica de Decisión 48 Horas
// =====================

document.addEventListener('DOMContentLoaded', function () {
    // Elementos de decisión
    const radioLugar = document.getElementById('devolucionLugar');
    const radioParcial = document.getElementById('devolucionParcial');
    const radioNoLugar = document.getElementById('devolucionNoLugar');
    const montoSolicitada = document.getElementById('devolucionSolicitada');
    const montoAutorizado = document.getElementById('montoAutorizado');
    const montoRechazado = document.getElementById('montoRechazado');
    const comentarios = document.getElementById('comentarios');
    const btnIngresarDecision = document.getElementById('btnIngresarDecision');
    const btnGenerarResolucion = document.getElementById('btnGenerarResolucion');
    const btnNotificar = document.getElementById('btnNotificar');
    const btnDisponeFep = document.getElementById('btnDisponeFep');

    // Estado de botones
    btnIngresarDecision.disabled = false;
    btnGenerarResolucion.disabled = true;
    btnNotificar.disabled = true;
    btnDisponeFep.disabled = true;
    btnDisponeFep.disabled = true; // Siempre deshabilitado al inicio

    // Helper para limpiar y bloquear/desbloquear campos
    function setMontoAutorizado(valor, readOnly = false) {
        montoAutorizado.value = valor;
        montoAutorizado.readOnly = readOnly;
        montoAutorizado.dispatchEvent(new Event('change'));
    }

    function requireComentarios(requerido) {
        if (requerido) {
            comentarios.classList.add('required');
        } else {
            comentarios.classList.remove('required');
        }
    }

    // Lógica de selección de decisión
    function handleDecisionChange() {
        if (radioLugar.checked) {
            // 1. Devolución ha lugar: monto autorizado = monto solicitada, bloqueado
            setMontoAutorizado(montoSolicitada.value, true);
            requireComentarios(false);
            btnDisponeFep.disabled = true;
        } else if (radioParcial.checked) {
            // 2. Parcial: monto autorizado editable (>0), comentarios requeridos
            setMontoAutorizado('', false);
            requireComentarios(true);
            btnDisponeFep.disabled = true;
        } else if (radioNoLugar.checked) {
            // 3. No ha lugar: monto autorizado = 0, bloqueado, comentarios requeridos
            setMontoAutorizado('0', true);
            requireComentarios(true);
            btnDisponeFep.disabled = false;
        }
             // --- Lógica adicional: montoRechazado ---
        // Si montoAutorizado == devolucionSolicitada, montoRechazado = 0
        const autorizado = parseFloat(montoAutorizado.value.replace(/[^\d.-]/g, '')) || 0;
        const solicitada = parseFloat(montoSolicitada.value.replace(/[^\d.-]/g, '')) || 0;
        if (autorizado === solicitada) {
            montoRechazado.value = '0';
        }
    }

    radioLugar.addEventListener('change', handleDecisionChange);
    radioParcial.addEventListener('change', handleDecisionChange);
    radioNoLugar.addEventListener('change', handleDecisionChange);

       // También actualizar montoRechazado cuando cambian los montos
    function handleMontosChange() {
        const autorizado = parseFloat(montoAutorizado.value.replace(/[^\d.-]/g, '')) || 0;
        const solicitada = parseFloat(montoSolicitada.value.replace(/[^\d.-]/g, '')) || 0;
        if (autorizado === solicitada) {
            montoRechazado.value = '0';
        }}

    // Validación antes de procesar decisión
    function validarDecision() {
        if (radioLugar.checked) {
            // No requiere validación extra
            return true;
        } else if (radioParcial.checked) {
            // Monto autorizado > 0 y comentarios no vacíos
            const monto = parseFloat(montoAutorizado.value.replace(/[^\d.-]/g, ''));
            const comentario = comentarios.innerText.trim();
            if (!(monto > 0)) {
                alert('Debe ingresar un monto autorizado mayor a 0.');
                montoAutorizado.focus();
                return false;
            }
            if (!comentario) {
                alert('Debe ingresar comentarios para justificar la decisión parcial.');
                comentarios.focus();
                return false;
            }
            return true;
        } else if (radioNoLugar.checked) {
            // Comentarios no vacíos
            const comentario = comentarios.innerText.trim();
            if (!comentario) {
                alert('Debe ingresar comentarios para justificar el rechazo.');
                comentarios.focus();
                return false;
            }
            return true;
        }
        alert('Debe seleccionar una opción de decisión.');
        return false;
    }

    // Flujo de botones
    btnIngresarDecision.addEventListener('click', function (e) {
        if (!validarDecision()) {
            e.preventDefault();
            return;
        }
        btnGenerarResolucion.disabled = false;
        btnIngresarDecision.disabled = true;
    });

    btnGenerarResolucion.addEventListener('click', function () {
        btnNotificar.disabled = false;
        btnGenerarResolucion.disabled = true;
    });

    // El botón Notificar no habilita ningún otro botón en este flujo

    // El botón DisponeFep solo se habilita con "No ha lugar" (ya manejado en handleDecisionChange)

    // Inicializar estado según selección actual
    handleDecisionChange();
});
/**
 * Verifica si se puede habilitar el FEP según el monto autorizado
 * @returns {boolean} Retorna true si se permite habilitar FEP
 */
function puedeHabilitarFEP() {
    const montoAutorizado = obtenerValorNumerico('montoAutorizado');
    return montoAutorizado === 0 || document.getElementById('montoAutorizado').value.trim() === '';
}

/**
 * Valida la decisión y procesa la acción correspondiente
 * @param {string} accion - La acción a realizar ('ingresar', 'resolucion', 'notificar', 'disponerFep')
 */
function validarYProcesarDecision(accion) {
    // If the action is disponerFep, no validation is needed
    if (accion === 'disponerFep') {
        mostrarPopupFep();
        return;
    }

    if (!validarDecision()) {
        mostrarAlerta('Debe seleccionar una decisión', 'error');
        return;
    }

    if (!validarMontos()) {
        mostrarAlerta('Los montos ingresados no son válidos', 'error');
        return;
    }

    const decision = document.querySelector('input[name="decisionCruce"]:checked').value;
    const montoAutorizado = document.getElementById('montoAutorizado').value;

    switch (accion) {
        case 'ingresar':
            // Procesar el ingreso de la decisión
            mostrarAlerta(`Decisión ingresada: ${decision} - Monto: ${montoAutorizado}`, 'success');
            document.getElementById('btnGenerarResolucion').disabled = false;
            break;

        case 'resolucion':
            if (generarResolucion()) {
                document.getElementById('btnNotificar').disabled = false;
                mostrarAlerta('Resolución generada exitosamente', 'success');
            }
            break;

        case 'notificar':
            // Notificar al contribuyente
            document.getElementById('btnDisponeFep').disabled = false;
            mostrarAlerta('Notificación enviada al contribuyente', 'success');
            break;
    }
}

/**
 * Genera la resolución correspondiente
 * @returns {boolean} true si la resolución se genera correctamente
 */
function generarResolucion() {
    // TODO: Implementar generación de resolución
    mostrarAlerta('Resolución generada correctamente', 'success');
    return true;
}

/******************************************************************************
 * 7. SECCIÓN FEP (FISCALIZACIÓN ESPECIAL PREVIA)
 * - Manejo completo del flujo FEP
 ******************************************************************************/

/**
 * Muestra el popup de FEP
 */
function mostrarPopupFep() {
    document.getElementById('fepPopup').style.display = 'block';
    document.getElementById('fepComentarios').focus();
}

/**
 * Cierra el popup de FEP
 */
function cerrarPopupFep() {
    document.getElementById('fepPopup').style.display = 'none';
    document.getElementById('fepComentarios').innerHTML = '';
    document.getElementById('fepCharCount').textContent = '0';
}

/**
 * Aplica formato al texto en el editor FEP
 * @param {string} command - El comando de formato a aplicar
 */
function formatFepText(command) {
    document.execCommand(command, false, null);
}

/**
 * Envía la solicitud FEP y navega a la pestaña FEP
 */
function enviarSolicitudFep() {
    const comentarios = document.getElementById('fepComentarios').innerText;
    if (comentarios.trim().length === 0) {
        mostrarAlerta('Debe ingresar comentarios para la solicitud FEP', 'error');
        return;
    }

    // Obtener fecha actual
    const fecha = new Date().toLocaleDateString('es-CL');
    
    // Actualizar campos en la sección FEP
    document.getElementById('fechaFep').textContent = fecha;
    document.getElementById('periodoTributario').textContent = '202504';
    document.getElementById('folioSolicitud').textContent = generarFolioSolicitud();
    document.getElementById('montoSolicitadoFep').textContent = document.getElementById('devolucionSolicitada').value;
    
    // Asegurar que el ID de expediente esté sincronizado
    const mainIdExpediente = document.getElementById('idExpediente').textContent;
    if (mainIdExpediente) {
        // Si ya existe un ID, usarlo para actualizar todos los elementos
        actualizarIdExpediente(mainIdExpediente);
    } else {
        // Si no existe, generar uno nuevo
        actualizarIdExpediente();
    }
    
    // Cerrar el popup y navegar a la pestaña FEP
    document.getElementById('fepPopup').style.display = 'none';
    handleTabNavigation({ currentTarget: document.getElementById('tabFep') }, 'tabFep');
    
    // Mostrar mensaje de éxito
    mostrarAlerta('Solicitud FEP enviada correctamente', 'success');
}

/**
 * Controla la habilitación del botón de generar acta
 */
function toggleActaRecepcion() {
    const checkbox = document.getElementById('checkInfoRecibida');
    const btnGenerar = document.getElementById('btnGenerarActa');
    btnGenerar.disabled = !checkbox.checked;
}

/**
 * Genera el acta de recepción F3309
 */
function generarActaRecepcion() {
    const checkbox = document.getElementById('checkInfoRecibida');
    if (!checkbox.checked) {
        mostrarAlerta('Debe confirmar que el contribuyente ha enviado la información requerida', 'error');
        return;
    }
    
    // Registrar la fecha actual en el campo fechaGeneracionActa
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD para input date
    const fechaGeneracionActa = document.getElementById('fechaGeneracionActa');
    if (fechaGeneracionActa) {
        fechaGeneracionActa.value = fechaFormateada;
        // Calcular la fecha límite basada en esta fecha
        calcularFechaLimite();
    }
    
    mostrarAlerta('Acta de Recepción F3309 generada exitosamente', 'success');
    
    // Mostrar y configurar la sección de decisión 15 días
    document.getElementById('seccionDecision15Dias').style.display = 'block';
    
    // Copiar los montos iniciales
    const montoSolicitado = document.getElementById('devolucionSolicitada').value;
    document.getElementById('montoSolicitado15').value = montoSolicitado;
    actualizarUTM('montoSolicitado15', 'montoSolicitadoUTM15');
    
    // Habilitar los radio buttons y el campo de monto autorizado
    habilitarControlesDecision15();
}

/**
 * Genera la resolución FEP
 */
function generarResolucionFep() {
    // Generar y almacenar número de resolución
    const numeroResolucion = generarNumeroResolucion();
    document.getElementById('numeroResolucionFep').textContent = numeroResolucion;

    // Almacenar fecha de generación
    const fechaGeneracion = formatoFecha(new Date());
    document.getElementById('fechaGeneracionFep').textContent = fechaGeneracion;

    // Habilitar botón de notificación
    document.getElementById('btnNotificarFep').disabled = false;
    
    mostrarAlerta('Resolución FEP generada correctamente', 'success');
}

/**
 * Notifica al contribuyente sobre la resolución FEP
 */
function notificarContribuyenteFep() {
    // Mostrar alerta de éxito
    mostrarAlerta('Notificación FEP enviada al contribuyente', 'success');
    
    // Actualizar datos y mostrar sección de aviso vencimiento
    const fechaActual = new Date();
    const diaActual = fechaActual.getDate().toString().padStart(2, '0');
    const mesActual = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const añoActual = fechaActual.getFullYear();
    const fechaFormateada = `${diaActual}/${mesActual}/${añoActual}`;
    
    document.getElementById('fechaNotificacionFep').textContent = fechaFormateada;
      // Calcular y mostrar la fecha límite
    calcularFechaLimite();
    
    // Mostrar la sección de aviso vencimiento primera revisión
    document.getElementById('avisoPrimeraRevision').style.display = 'block';
}

/**
 * Calcula y muestra la fecha límite (fecha generación acta + 15 días)
 */
function calcularFechaLimite() {
    // Obtener la fecha de generación del acta, si existe
    const fechaGeneracionActaElement = document.getElementById('fechaGeneracionActa');
    let fechaBase;
    
    if (fechaGeneracionActaElement && fechaGeneracionActaElement.value) {
        // Usar la fecha del calendario si está disponible
        fechaBase = new Date(fechaGeneracionActa.value);
    } else {
        // Si no hay fecha en el calendario, usar la fecha de notificación FEP
        const fechaNotificacionElement = document.getElementById('fechaNotificacionFep');
        if (!fechaNotificacionElement || !fechaNotificacionElement.textContent) {
            return;
        }
        
        // Parsear la fecha (formato dd/mm/yyyy)
        const partesFecha = fechaNotificacionElement.textContent.split('/');
        if (partesFecha.length !== 3) {
            return;
        }
        
        const dia = parseInt(partesFecha[0], 10);
        const mes = parseInt(partesFecha[1], 10) - 1; // En JavaScript los meses van de 0-11
        const año = parseInt(partesFecha[2], 10);
        
        // Crear objeto Date con la fecha de notificación
        fechaBase = new Date(año, mes, dia);
    }
    
    // Sumar 15 días
    const fechaLimite = new Date(fechaBase);
    fechaLimite.setDate(fechaLimite.getDate() + 25);
    
    // Formatear la fecha límite (dd/mm/yyyy)
    const diaLimite = fechaLimite.getDate().toString().padStart(2, '0');
    const mesLimite = (fechaLimite.getMonth() + 1).toString().padStart(2, '0');
    const añoLimite = fechaLimite.getFullYear();
    const fechaLimiteFormateada = `${diaLimite}/${mesLimite}/${añoLimite}`;
    
    // Mostrar la fecha límite en el elemento correspondiente
    const fechaLimiteElement = document.getElementById('fechaLimite15Dias');
    if (fechaLimiteElement) {
        fechaLimiteElement.textContent = fechaLimiteFormateada;
        
        // Aplicar clase de estilo
        fechaLimiteElement.classList.add('fecha-maxima');
    }
}

/**
 * Genera la resolución para la primera revisión FEP (15 días)
 */
function generarResolucion15Dias() {
    const decision = document.querySelector('input[name="decision15Dias"]:checked');
    if (!decision) {
        mostrarAlerta('Debe seleccionar una decisión', 'error');
        return;
    }

    const montoAutorizado = document.getElementById('montoAutorizado15').value;
    if (montoAutorizado === '' && decision.value !== 'retencionTotal') {
        mostrarAlerta('Debe ingresar un monto autorizado', 'error');
        return;
    }

    // Generar y almacenar número de resolución
    const numeroResolucion = generarIdResolucion();
    document.getElementById('numeroResolucionFepSegunda').textContent = numeroResolucion;
    
    // Almacenar fecha de generación
    const fechaGeneracion = new Date();
    document.getElementById('fechaGeneracionFepSegunda').textContent = formatoFecha(fechaGeneracion);
    
    // Habilitar siguiente paso
    document.getElementById('btnNotificar15').disabled = false;
    mostrarAlerta('Resolución generada correctamente', 'success');
}

/**
 * Notifica al contribuyente sobre la decisión de 15 días
 */
function notificarContribuyente15Dias() {
    // Verificar si el radio button plazoAdicional15 está seleccionado
    const radioPlazoAdicional = document.getElementById('plazoAdicional15');
    
    if (radioPlazoAdicional && radioPlazoAdicional.checked) {
        // Si está seleccionado, establecer la fecha actual en fechaNotificacionSegundaRevision
        const fechaActual = new Date();
        const fechaFormateada = formatoFecha(fechaActual);
        
        // Actualizar el elemento con la fecha actual
        const fechaNotificacionElement = document.getElementById('fechaNotificacionSegundaRevision');
        if (fechaNotificacionElement) {
            fechaNotificacionElement.textContent = fechaFormateada;
            

        }
    }
    
    // Continuar con el comportamiento normal de la función
    mostrarAlerta('Notificación enviada al contribuyente', 'success');
    document.getElementById('btnEnviarDecision15').disabled = false;
}

/**
 * Envía la decisión final de 15 días
 */
function enviarDecision15Dias() {
    const decision = document.querySelector('input[name="decision15Dias"]:checked').value;
    const montoAutorizado = document.getElementById('montoAutorizado15').value;
    
    mostrarAlerta(`Decisión enviada exitosamente: ${decision} - Monto: ${montoAutorizado}`, 'success');
}

/**
 * Formatea un número con separadores de miles para la sección 15 días
 * @param {HTMLInputElement} input - El elemento input a formatear
 */
function formatNumber15(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor) {
        input.value = FORMATO_MONEDA.format(parseInt(valor));
    }
    calcularMontos15();
}

/**
 * Calcula los montos y conversiones UTM para la sección 15 días
 */
function calcularMontos15() {
    const montoSolicitado = obtenerValorNumerico('montoSolicitado15');
    const montoAutorizado = obtenerValorNumerico('montoAutorizado15');
    const montoRechazado = montoSolicitado - montoAutorizado;
    
    if (montoSolicitado > 0) {
        document.getElementById('montoRechazado15').value = FORMATO_MONEDA.format(montoRechazado);
    }
    
    actualizarUTM('montoSolicitado15', 'montoSolicitadoUTM15');
    actualizarUTM('montoAutorizado15', 'montoAutorizadoUTM15');
    actualizarUTM('montoRechazado15', 'montoRechazadoUTM15');
    
    validarYActualizarBotonesDecision15();
}

/**
 * Valida y actualiza el estado de los botones de la sección 15 días
 */
function validarYActualizarBotonesDecision15() {
    const decisionSeleccionada = Array.from(document.getElementsByName('decision15Dias')).some(radio => radio.checked);
    const montoAutorizado = obtenerValorNumerico('montoAutorizado15');
    const montoSolicitado = obtenerValorNumerico('montoSolicitado15');
    
    const valido = decisionSeleccionada && 
                  (montoAutorizado >= 0 && montoAutorizado <= montoSolicitado);
    
    document.getElementById('btnGenerarResolucion15').disabled = !valido;
}


/**
 * Habilita los controles de la sección de decisión 15 días
 */
function habilitarControlesDecision15() {
    const radios = document.getElementsByName('decision15Dias');
    radios.forEach(radio => radio.disabled = false);
    document.getElementById('montoAutorizado15').disabled = false;
}

/**
 * Maneja la lógica de selección de decisión para los radio buttons de decisión 15 días
 */
function handleDecision15Change() {
    // Obtener los radio buttons
    const radioDevolucionTotal = document.getElementById('devolucionTotal15');
    const radioRetencionTotal = document.getElementById('retencionTotal15');
    const radioPlazoAdicional = document.getElementById('plazoAdicional15');
    const montoAutorizado = document.getElementById('montoAutorizado15');
    
    // Establecer el valor del monto autorizado según la selección
    if (radioDevolucionTotal && radioDevolucionTotal.checked) {
        // Para devolución total, el monto autorizado es igual al solicitado
        montoAutorizado.value = FORMATO_MONEDA.format(DEVOLUCION_SOLICITADA);
        montoAutorizado.readOnly = true; // Bloquear edición
    } else if ((radioRetencionTotal && radioRetencionTotal.checked) || 
               (radioPlazoAdicional && radioPlazoAdicional.checked)) {
        // Para retención total o plazo adicional, el monto autorizado es 0
        montoAutorizado.value = FORMATO_MONEDA.format(0);
        montoAutorizado.readOnly = true; // Bloquear edición
    } else {
        // Para las demás opciones, permitir edición
        montoAutorizado.readOnly = false;
    }
    
    // Recalcular montos y UTMs
    calcularMontos15();
}

/******************************************************************************
 * 8. MÓDULO DE CONTACTO CON CONTRIBUYENTE
 * - Gestión de contactos y comunicaciones
 ******************************************************************************/

/**
 * Muestra u oculta los botones según la opción seleccionada
 */
function toggleBotonesContacto() {
    const valor = document.getElementById('contactoContribuyente').value;
    const btnGuardar = document.getElementById('btnGuardar');
    const btnAnotacion42 = document.getElementById('btnAnotacion42');
    const btnDisponeFep = document.getElementById('btnDisponeFep');
    const checkInfoRecibida = document.querySelector('label.checkbox-label');
    const btnGenerarActa = document.getElementById('btnGenerarActa');

    // Ocultar todos los botones primero
    btnGuardar.style.display = 'none';
    btnAnotacion42.style.display = 'none';
    btnDisponeFep.style.display = 'none';
    checkInfoRecibida.style.display = 'none';
    btnGenerarActa.style.display = 'none';

    // Mostrar los botones correspondientes
    if (valor === 'contactado') {
        btnGuardar.style.display = 'inline-block';
        checkInfoRecibida.style.display = 'block';
        btnGenerarActa.style.display = 'inline-block';
    } else if (valor === 'noContactado') {
        btnAnotacion42.style.display = 'inline-block';
        btnDisponeFep.style.display = 'inline-block';
    }
}

/**
 * Registra el evento de contacto
 */
function registrarEvento() {
    mostrarPopupContacto("Evento registrado en Consulta Estado");
}

/**
 * Genera la anotación 42
 */
function generarAnotacion42() {
    // Aquí puedes agregar la lógica específica para la anotación 42
    mostrarPopupContacto("Anotación 42 generada exitosamente");
}

/**
 * Ejecuta la acción de Disponer FEP
 */
function ejecutarDisponeFep() {
    // Asegurar que exista un ID de expediente
    if (!document.getElementById('idExpediente').textContent) {
        actualizarIdExpediente();
    }
    
    // Aquí puedes agregar la lógica específica para disponer FEP
    mostrarPopupContacto("FEP dispuesto exitosamente");
}

/**
 * Abre el expediente electrónico
 */
function AbrirExpediente() {
    // Use the utility function to update all ID instances
    actualizarIdExpediente();
}

/**
 * Muestra el popup de antecedentes
 * @param {string} popupId - ID del popup a mostrar
 */
function mostrarPopupAntecedentes(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.style.display = 'block';
    }
}

/**
 * Cierra el popup de antecedentes
 */
function cerrarPopupAntecedentes() {
    const popup = document.getElementById('solicitaAntecedentesPopup');
    if (popup) {
        popup.style.display = 'none';
    }
    
    // Resetear el contenido del editor de comentarios
    const comentarios = document.getElementById('antecedentesComentarios');
    if (comentarios) {
        comentarios.innerHTML = '';
    }
    
    // Resetear el contador de caracteres
    const charCount = document.getElementById('antecedentesCharCount');
    if (charCount) {
        charCount.textContent = '0';
    }
}

/**
 * Solicita antecedentes al contribuyente
 */
function enviarSolicitudAntecedentes() {
    // Obtener los antecedentes seleccionados
    const checkedAntecedentes = Array.from(document.querySelectorAll('.antecedentes-list input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    if (checkedAntecedentes.length === 0) {
        alert('Por favor seleccione al menos un antecedente.');
        return;
    }
    
    // Obtener los comentarios adicionales
    const comentarios = document.getElementById('antecedentesComentarios')?.innerText || '';

    // Aquí iría la lógica para enviar los antecedentes y comentarios al backend
    console.log('Antecedentes solicitados:', checkedAntecedentes);
    console.log('Comentarios adicionales:', comentarios);

    // Cerrar el popup de antecedentes si existe
    cerrarPopupAntecedentes && cerrarPopupAntecedentes();

    // Mostrar popup de evento registrado (reutilizando función existente)
    mostrarPopupContacto("Evento registrado en consulta estado");

    // Agregar ticket verde al botón de Solicitar Antecedentes
    marcarBotonSolicitaAntecedentes();
}

/**
 * Marca el botón de solicitar antecedentes con un tick verde
 */
function marcarBotonSolicitaAntecedentes() {
    const btn = document.getElementById('Solicita-Antecedentes');
    if (btn && !btn.querySelector('.ticket-verde')) {
        const icon = document.createElement('span');
        icon.className = 'ticket-verde';
        icon.innerHTML = '✔️'; // Puedes usar un SVG si prefieres
        icon.style.marginLeft = '8px';
        btn.appendChild(icon);
    }
}

/******************************************************************************
 * 9. INICIALIZACIÓN Y EVENTOS
 * - Configuración inicial y listeners de eventos
 ******************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el monto de devolución solicitada
    const devolucionInput = document.getElementById('devolucionSolicitada');
    if (devolucionInput) {
        devolucionInput.value = FORMATO_MONEDA.format(DEVOLUCION_SOLICITADA);
        actualizarCamposUTM(); // Actualizar los campos UTM al inicializar
    }

    // Muestra el valor de UTM actual
    document.getElementById('valorUTM').textContent = FORMATO_MONEDA.format(UTM_VALOR);
    
    // Configura listeners para campos de montos
    const camposMontos = ['devolucionSolicitada', 'montoAutorizado'];
    camposMontos.forEach(campo => {
        document.getElementById(campo)?.addEventListener('input', (event) => {
            formatNumber(event.target);
        });
    });

    // Inicializar fecha de solicitud y folio
    const fechaSolicitudElement = document.getElementById('fechaSolicitud');
    if (fechaSolicitudElement) {
        fechaSolicitudElement.textContent = formatoFecha(FECHA_SOLICITUD);
    } 

    const folioElement = document.getElementById('folioFormulario');
    if (folioElement) {
        folioElement.textContent = folioformulario;
    }
// Inicializar fechas

    const fechaMaxElement = document.getElementById('fechaMaxDesc48');
    
    if (fechaSolicitudElement) {
        fechaSolicitudElement.textContent = formatoFecha(FECHA_SOLICITUD);
    }
    if (fechaMaxElement) {
        fechaMaxElement.textContent = formatoFecha(calcularFechaMaxDesc48());
    }

    // Configura listeners para decisiones
    document.getElementsByName('decisionCruce').forEach(radio => {
        radio.addEventListener('change', validarYActualizarBotones);
    });

    // Configura tooltips y ayudas contextuales
    configurarTooltips();

    // Configurar el editor de texto
    const editor = document.getElementById('comentarios');
    if (editor) {
        editor.addEventListener('input', updateCharCount);
        
        // Mantener el formato al pegar texto
        editor.addEventListener('paste', function(e) {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    }

    // Agregar event listener para el contador de caracteres del FEP
    const fepEditor = document.getElementById('fepComentarios');
    if (fepEditor) {
        fepEditor.addEventListener('input', function(event) {
            const maxLength = parseInt(this.dataset.maxLength);
            const text = this.innerText;
            const charCount = text.length;
            
            document.getElementById('fepCharCount').textContent = charCount;
            
            if (charCount > maxLength) {
                if (event.inputType === 'insertText') {
                    event.preventDefault();
                }
                this.innerText = text.substring(0, maxLength);
            }
        });

        fepEditor.addEventListener('paste', function(e) {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    }    // Asegurar que todas las secciones FEP sean visibles inicialmente
    document.querySelectorAll('.subsection-content').forEach(section => {
        section.style.display = 'block';
        section.classList.remove('collapsed');
    });
      // Inicializar el monto solicitado 15 días con el valor de DEVOLUCION_SOLICITADA
    const montoSolicitado15 = document.getElementById('montoSolicitado15');
    if (montoSolicitado15) {
        montoSolicitado15.value = FORMATO_MONEDA.format(DEVOLUCION_SOLICITADA);
        actualizarUTM('montoSolicitado15', 'montoSolicitadoUTM15');
    }
    
    // Inicializar el monto solicitado Segunda Revisión con el valor de DEVOLUCION_SOLICITADA
    const montoSolicitadoSegunda = document.getElementById('montoSolicitadoSegunda');
    if (montoSolicitadoSegunda) {
        montoSolicitadoSegunda.value = FORMATO_MONEDA.format(DEVOLUCION_SOLICITADA);
        actualizarUTM('montoSolicitadoSegunda', 'montoSolicitadoUTMSegunda');
    }
    
    // Configurar listeners para los radio buttons de decisión 15 días
    document.getElementsByName('decision15Dias').forEach(radio => {
        radio.addEventListener('change', handleDecision15Change);
    });
    
    // Configurar listeners para los radio buttons de decisión segunda
    document.getElementsByName('decisionSegunda').forEach(radio => {
        radio.addEventListener('change', handleDecisionSegundaChange);
    });
    
    // Inicializar sincronización de IDs de expediente si existe algún valor
    const mainIdExpediente = document.getElementById('idExpediente')?.textContent;
    const fepIdExpediente = document.getElementById('idExpedienteFep')?.textContent;
    
    if (mainIdExpediente || fepIdExpediente) {
        // Usar el ID existente que encontremos primero
        actualizarIdExpediente(mainIdExpediente || fepIdExpediente);
    }
      // Manejar cambios en los checkboxes para información recibida
    document.getElementById('checkInfoRecibida')?.addEventListener('change', toggleActaRecepcion);
    document.getElementById('checkInfoRecibidaFep')?.addEventListener('change', toggleActaRecepcionFep);
    document.getElementById('checkInfoRecibidaSegunda')?.addEventListener('change', toggleDecisionSegunda);
    
    // Inicializar el tema
    initTheme();
    
    // Agregar listener al botón de cambio de tema
    document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);
});

/**
 * Habilita/deshabilita los controles de la segunda revisión
 */
function toggleDecisionSegunda() {
    const checkbox = document.getElementById('checkInfoRecibidaSegunda');
    
    if (checkbox.checked) {
        habilitarControlesSegundaDecision();
    } else {
        deshabilitarControlesSegundaDecision();
    }
}

/**
 * Habilita los controles de la segunda decisión
 */
function habilitarControlesSegundaDecision() {
    const radios = document.getElementsByName('decisionSegunda');
    radios.forEach(radio => radio.disabled = false);
    document.getElementById('montoAutorizadoSegunda').disabled = false;
}

/**
 * Deshabilita los controles de la segunda decisión
 */
function deshabilitarControlesSegundaDecision() {
    const radios = document.getElementsByName('decisionSegunda');
    radios.forEach(radio => radio.disabled = true);
    document.getElementById('montoAutorizadoSegunda').disabled = true;
}

/**
 * Alterna entre modo oscuro y claro
 */
function toggleDarkMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    
    // Cambia el tema y guarda la preferencia
    if (currentTheme === 'dark') {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

/**
 * Inicializa el tema basado en la preferencia guardada o el tema del sistema
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        // Usa el tema guardado por el usuario
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        // Si el usuario no ha guardado preferencia pero su sistema usa modo oscuro
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Función faltante para el contador de caracteres - requerida por el código
function updateCharCount() {
    const text = document.getElementById('comentarios').value;
    document.getElementById('charCount').textContent = text.length;
}

/**
 * Controla la habilitación del botón de generar acta para la sección FEP
 */
function toggleActaRecepcionFep() {
    const checkbox = document.getElementById('checkInfoRecibidaFep');
    const btnGenerar = document.getElementById('btnGenerarActaFep');
    btnGenerar.disabled = !checkbox.checked;
}

/**
 * Genera el acta de recepción F3309 para la sección FEP
 */
function generarActaRecepcionFep() {
    const checkbox = document.getElementById('checkInfoRecibidaFep');
    if (!checkbox.checked) {
        mostrarAlerta('Debe confirmar que el contribuyente ha enviado la información requerida', 'error');
        return;
    }
      // Registrar la fecha actual en el campo fechaGeneracionActaFep
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD para input date
    const fechaGeneracionActa = document.getElementById('fechaGeneracionActaFep');
    if (fechaGeneracionActa) {
        fechaGeneracionActa.value = fechaFormateada;
        // Calcular la fecha límite basada en esta fecha
        calcularFechaLimiteFep();
    }
    
    mostrarAlerta('Acta de Recepción F3309 generada exitosamente', 'success');
    
    // Mostrar y configurar la sección de decisión 15 días
    document.getElementById('seccionDecision15Dias').style.display = 'block';
    
    // Establecer el monto solicitado usando la constante DEVOLUCION_SOLICITADA
    document.getElementById('montoSolicitado15').value = FORMATO_MONEDA.format(DEVOLUCION_SOLICITADA);
    actualizarUTM('montoSolicitado15', 'montoSolicitadoUTM15');
    
    // Habilitar los radio buttons y el campo de monto autorizado
    habilitarControlesDecision15();
}

/**
 * Calcula y muestra la fecha límite para la sección FEP (fecha generación acta + 15 días)
 */
function calcularFechaLimiteFep() {
    // Obtener la fecha de generación del acta, si existe
    const fechaGeneracionActaElement = document.getElementById('fechaGeneracionActaFep');
    let fechaBase;
    
    if (fechaGeneracionActaElement && fechaGeneracionActaElement.value) {
        // Usar la fecha del calendario si está disponible
        fechaBase = new Date(fechaGeneracionActaFep.value);
    } else {
        // Si no hay fecha en el calendario, usar la fecha de notificación FEP
        const fechaNotificacionElement = document.getElementById('fechaNotificacionFep');
        if (!fechaNotificacionElement || !fechaNotificacionElement.textContent) {
            return;
        }
        
        // Parsear la fecha (formato dd/mm/yyyy)
        const partesFecha = fechaNotificacionElement.textContent.split('/');
        if (partesFecha.length !== 3) {
            return;
        }
        
        const dia = parseInt(partesFecha[0], 10);
        const mes = parseInt(partesFecha[1], 10) - 1; // En JavaScript los meses van de 0-11
        const año = parseInt(partesFecha[2], 10);
        
        // Crear objeto Date con la fecha de notificación
        fechaBase = new Date(año, mes, dia);
    }
    
    // Sumar 15 días
    const fechaLimite = new Date(fechaBase);
    fechaLimite.setDate(fechaLimite.getDate() + 15);
    
    // Formatear la fecha límite (dd/mm/yyyy)
    const diaLimite = fechaLimite.getDate().toString().padStart(2, '0');
    const mesLimite = (fechaLimite.getMonth() + 1).toString().padStart(2, '0');
    const añoLimite = fechaLimite.getFullYear();
    const fechaLimiteFormateada = `${diaLimite}/${mesLimite}/${añoLimite}`;
    
    // Mostrar la fecha límite en el elemento correspondiente
    const fechaLimiteElement = document.getElementById('fechaLimite15Dias');
    if (fechaLimiteElement) {
        fechaLimiteElement.textContent = fechaLimiteFormateada;
        
        // Aplicar clase de estilo
        fechaLimiteElement.classList.add('fecha-maxima');
    }
}


/******************************************************************************
 * GESTIÓN DE PLANTILLAS Y DOCUMENTOS
 * - Funciones para manejar plantillas de resoluciones y documentos
 ******************************************************************************/

/**
 * Abre la plantilla de resolución en un iframe
 */
function abrirPlantillaResolucion() {
    const plantillaPreview = document.getElementById('plantillaPreview');
    const plantillaFrame = document.getElementById('plantillaFrame');
    
    plantillaFrame.src = 'RES_TYPE_DES.HTML';
    plantillaPreview.style.display = 'block';
    
    // Agregar datos del contribuyente a la plantilla
    plantillaFrame.onload = function() {
        try {
            const frameDoc = plantillaFrame.contentDocument || plantillaFrame.contentWindow.document;
            
            // Completar campos básicos de la plantilla con datos del sistema
            const campos = {
                'DR': 'DR METROPOLITANA SANTIAGO ORIENTE',
                'DEPTO': 'DEPARTAMENTO DE FISCALIZACIÓN',
                'GRUPO': 'GRUPO N° 8 IVA EXPORTADOR',
                'R_Social': document.getElementById('folioSolicitud') ? document.getElementById('folioSolicitud').textContent : '[RAZÓN SOCIAL]',
                'RUT_CONTR': '12.345.678-9', // Obtener de datos del sistema
                'DESICIÓN': 'RESOLUCIÓN DE INICIO DE FEP',
                'Numero_RES': generateRandomId(5), // Generar número aleatorio para demo
                'FECHA': new Date().toLocaleDateString('es-CL')
            };
            
            // Establecer valores en la plantilla
            Object.keys(campos).forEach(key => {
                const elements = frameDoc.querySelectorAll(`[data-placeholder="${key}"]`);
                elements.forEach(el => {
                    el.textContent = campos[key];
                });
            });
        } catch (e) {
            console.error('Error al cargar datos en la plantilla:', e);
        }
    };
}

/**
 * Crea una nueva plantilla basada en la actual pero con campos vacíos
 */
function crearNuevaPlantilla() {
    // Crear ventana popup para elegir tipo de plantilla
    const tipoPlantillas = [
        { id: 'fep_inicio', nombre: 'Resolución de Inicio FEP' },
        { id: 'fep_decision', nombre: 'Resolución de Decisión FEP' },
        { id: 'solicitud_antecedentes', nombre: 'Solicitud de Antecedentes' },
        { id: 'acta_recepcion', nombre: 'Acta de Recepción' },
        { id: 'plantilla_vacia', nombre: 'Plantilla Vacía' }
    ];
    
    // Crear y mostrar popup
    const popup = document.createElement('div');
    popup.className = 'modal';
    popup.style.display = 'block';
    popup.style.position = 'fixed';
    popup.style.zIndex = '1000';
    popup.style.left = '0';
    popup.style.top = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.overflow = 'auto';
    popup.style.backgroundColor = 'rgba(0,0,0,0.4)';
    
    // Contenido del popup
    const popupContent = document.createElement('div');
    popupContent.className = 'modal-content';
    popupContent.style.backgroundColor = '#fefefe';
    popupContent.style.margin = '15% auto';
    popupContent.style.padding = '20px';
    popupContent.style.border = '1px solid #888';
    popupContent.style.width = '50%';
    popupContent.style.borderRadius = '5px';
    
    // Título
    const title = document.createElement('h3');
    title.textContent = 'Seleccione tipo de plantilla';
    
    // Lista de opciones
    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    
    tipoPlantillas.forEach(tipo => {
        const item = document.createElement('li');
        item.style.padding = '10px';
        item.style.margin = '5px 0';
        item.style.backgroundColor = '#f5f5f5';
        item.style.borderRadius = '3px';
        item.style.cursor = 'pointer';
        
        item.textContent = tipo.nombre;
        
        item.onclick = function() {
            abrirPlantillaResolucion();
            popup.style.display = 'none';
        };
        
        list.appendChild(item);
    });
    
    // Botón cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cancelar';
    closeBtn.className = 'action-button';
    closeBtn.style.marginTop = '15px';
    closeBtn.onclick = function() {
        popup.style.display = 'none';
    };
    
    // Añadir elementos al popup
    popupContent.appendChild(title);
    popupContent.appendChild(list);
    popupContent.appendChild(closeBtn);
    popup.appendChild(popupContent);
    
    // Añadir popup al body
    document.body.appendChild(popup);
}

/**
 * Genera un ID aleatorio para usar en resoluciones de demo
 */
function generateRandomId(length) {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}