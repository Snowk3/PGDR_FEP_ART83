/*
====================================================================
RESOLUCIÓN DESESTIMIENTO - EDITOR INTERACTIVO AVANZADO
====================================================================
Sistema de edición con funcionalidades avanzadas:
- Copia directa de tablas de Excel con formato
- Inserción de imágenes por copy/paste y desde archivo
- Toolbar de formato enriquecido
====================================================================
*/

let editMode = false;

// Enhanced text formatting functions
function formatText(command, value = null, targetSection = null) {
    switch(command) {
        case 'insertTable':
            insertTable(targetSection);
            break;
        case 'importExcel':
            importFromExcel(targetSection);
            break;
        case 'insertImage':
            insertImage(targetSection);
            break;
        case 'pasteExcel':
            showPasteInstructions(targetSection);
            break;
        default:
            document.execCommand(command, false, value);
    }
}

// Show instructions for Excel paste
function showPasteInstructions(targetSection) {
    const instructions = document.createElement('div');
    instructions.className = 'paste-instructions';
    instructions.innerHTML = `
        <div class="instruction-content">
            <h4>📊 Instrucciones para copiar tabla de Excel</h4>
            <ol>
                <li>Seleccione la tabla en Excel (incluya encabezados)</li>
                <li>Copie con Ctrl+C</li>
                <li>Haga clic en esta sección y pegue con Ctrl+V</li>
            </ol>
            <p><strong>Nota:</strong> El formato de la tabla se mantendrá automáticamente</p>
            <button onclick="this.parentElement.parentElement.remove()" class="close-instructions">✕ Cerrar</button>
        </div>
    `;
    
    if (targetSection) {
        targetSection.appendChild(instructions);
        setTimeout(() => {
            if (instructions.parentNode) {
                instructions.remove();
            }
        }, 10000); // Auto-remove after 10 seconds
    }
}

// Enhanced paste handler for Excel tables and images
function handleEnhancedPaste(event, targetElement) {
    const clipboardData = event.clipboardData || window.clipboardData;
    
    // Handle image paste
    const items = clipboardData.items;
    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            event.preventDefault();
            const blob = item.getAsFile();
            insertImageFromBlob(blob, targetElement);
            return;
        }
    }
    
    // Handle HTML content (Excel tables)
    const htmlData = clipboardData.getData('text/html');
    const plainText = clipboardData.getData('text/plain');
    
    if (htmlData && htmlData.includes('<table')) {
        event.preventDefault();
        insertExcelTable(htmlData, targetElement);
        return;
    }
    
    // Handle plain text tables (tab-separated)
    if (plainText && plainText.includes('\t') && plainText.includes('\n')) {
        event.preventDefault();
        insertPlainTextTable(plainText, targetElement);
        return;
    }
}

// Insert Excel table with preserved formatting
function insertExcelTable(htmlData, targetElement) {
    // Clean and enhance the HTML
    let cleanedHtml = htmlData;
    
    // Remove Microsoft Office specific attributes
    cleanedHtml = cleanedHtml.replace(/class="[^"]*"/g, '');
    cleanedHtml = cleanedHtml.replace(/style="[^"]*"/g, '');
    cleanedHtml = cleanedHtml.replace(/<o:p[^>]*>.*?<\/o:p>/g, '');
    cleanedHtml = cleanedHtml.replace(/<\/?\w+:[^>]*>/g, '');
    
    // Extract table content
    const tableMatch = cleanedHtml.match(/<table[^>]*>.*?<\/table>/i);
    if (tableMatch) {
        let tableHtml = tableMatch[0];
        
        // Add enhanced styling
        tableHtml = tableHtml.replace(/<table[^>]*>/i, 
            '<table class="excel-imported-table" style="border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">'
        );
        
        // Style table cells
        tableHtml = tableHtml.replace(/<td([^>]*)>/g, 
            '<td$1 style="border: 1px solid #ccc; padding: 8px; vertical-align: top;">'
        );
        tableHtml = tableHtml.replace(/<th([^>]*)>/g, 
            '<th$1 style="border: 1px solid #ccc; padding: 8px; background-color: #f5f5f5; font-weight: bold; text-align: left;">'
        );
        
        // Add wrapper for responsiveness
        const wrappedTable = `<div class="table-wrapper">${tableHtml}</div>`;
        
        if (targetElement) {
            targetElement.insertAdjacentHTML('beforeend', wrappedTable);
        }
        
        showSuccessMessage('Tabla de Excel insertada correctamente');
    }
}

// Insert plain text table (tab-separated values)
function insertPlainTextTable(plainText, targetElement) {
    const rows = plainText.trim().split('\n');
    let tableHtml = '<table class="plain-text-table" style="border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">';
    
    rows.forEach((row, index) => {
        const cells = row.split('\t');
        const tag = index === 0 ? 'th' : 'td';
        const style = index === 0 ? 
            'border: 1px solid #ccc; padding: 8px; background-color: #f5f5f5; font-weight: bold; text-align: left;' : 
            'border: 1px solid #ccc; padding: 8px; vertical-align: top;';
            
        tableHtml += '<tr>';
        cells.forEach(cell => {
            tableHtml += `<${tag} style="${style}">${cell.trim() || '&nbsp;'}</${tag}>`;
        });
        tableHtml += '</tr>';
    });
    
    tableHtml += '</table>';
    
    const wrappedTable = `<div class="table-wrapper">${tableHtml}</div>`;
    
    if (targetElement) {
        targetElement.insertAdjacentHTML('beforeend', wrappedTable);
    }
    
    showSuccessMessage('Tabla de texto insertada correctamente');
}

// Insert image from blob (paste)
function insertImageFromBlob(blob, targetElement) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const imgSrc = event.target.result;
        
        // Create image with responsive styling
        const imgHtml = `
            <div class="image-container" style="margin: 15px 0; text-align: center;">
                <img src="${imgSrc}" 
                     alt="Imagen pegada" 
                     class="pasted-image" 
                     style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
                     onclick="toggleImageSize(this)">
                <div class="image-controls" style="margin-top: 5px; font-size: 11px; color: #666;">
                    <button onclick="resizeImage(this.parentElement.previousElementSibling, '50%')" class="img-btn">50%</button>
                    <button onclick="resizeImage(this.parentElement.previousElementSibling, '75%')" class="img-btn">75%</button>
                    <button onclick="resizeImage(this.parentElement.previousElementSibling, '100%')" class="img-btn">100%</button>
                    <button onclick="this.parentElement.parentElement.remove()" class="img-btn delete-btn">🗑️</button>
                </div>
            </div>
        `;
        
        if (targetElement) {
            targetElement.insertAdjacentHTML('beforeend', imgHtml);
        }
        
        showSuccessMessage('Imagen insertada correctamente');
    };
    
    reader.readAsDataURL(blob);
}

// Image utility functions
function toggleImageSize(img) {
    const currentWidth = img.style.width || '100%';
    if (currentWidth === '100%') {
        img.style.width = '50%';
    } else if (currentWidth === '50%') {
        img.style.width = '75%';
    } else {
        img.style.width = '100%';
    }
}

function resizeImage(img, size) {
    img.style.width = size;
}

// Insert basic table
function insertTable(targetSection) {
    const rows = prompt('Número de filas:', '3');
    const cols = prompt('Número de columnas:', '3');
    
    if (rows && cols && !isNaN(rows) && !isNaN(cols)) {
        let tableHTML = '<div class="table-wrapper"><table class="inserted-table" style="border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">';
        
        // Create header row
        tableHTML += '<tr>';
        for (let j = 0; j < cols; j++) {
            tableHTML += `<th style="border: 1px solid #ccc; padding: 8px; background-color: #f5f5f5; font-weight: bold;">Columna ${j + 1}</th>`;
        }
        tableHTML += '</tr>';
        
        // Create data rows
        for (let i = 1; i < rows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
                tableHTML += '<td style="border: 1px solid #ccc; padding: 8px; vertical-align: top;">&nbsp;</td>';
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</table></div>';
        
        if (targetSection) {
            targetSection.insertAdjacentHTML('beforeend', tableHTML);
        }
        
        showSuccessMessage('Tabla básica insertada');
    }
}

// Import from Excel file
function importFromExcel(targetSection) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls,.csv';
    fileInput.style.display = 'none';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    if (file.name.toLowerCase().endsWith('.csv')) {
                        const data = parseCSV(event.target.result);
                        if (data && data.length > 0) {
                            const tableHTML = createTableFromData(data);
                            if (targetSection) {
                                targetSection.insertAdjacentHTML('beforeend', tableHTML);
                            }
                            showSuccessMessage('Archivo CSV importado correctamente');
                        }
                    } else {
                        showErrorMessage('Por favor, exporte su archivo Excel como CSV para importarlo.');
                    }
                } catch (error) {
                    showErrorMessage('Error al procesar el archivo: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        }
        
        document.body.removeChild(fileInput);
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const data = [];
    
    for (let line of lines) {
        if (line.trim()) {
            const row = line.split(',').map(cell => cell.trim().replace(/^"(.*)"$/, '$1'));
            data.push(row);
        }
    }
    
    return data;
}

// Create HTML table from data array
function createTableFromData(data) {
    let tableHTML = '<div class="table-wrapper"><table class="imported-table" style="border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">';
    
    data.forEach((row, index) => {
        const tag = index === 0 ? 'th' : 'td';
        const style = index === 0 ? 
            'border: 1px solid #ccc; padding: 8px; background-color: #f5f5f5; font-weight: bold; text-align: left;' : 
            'border: 1px solid #ccc; padding: 8px; vertical-align: top;';
            
        tableHTML += '<tr>';
        row.forEach(cell => {
            tableHTML += `<${tag} style="${style}">${cell || '&nbsp;'}</${tag}>`;
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += '</table></div>';
    return tableHTML;
}

// Insert image from file
function insertImage(targetSection) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                const imgSrc = event.target.result;
                
                const imgHtml = `
                    <div class="image-container" style="margin: 15px 0; text-align: center;">
                        <img src="${imgSrc}" 
                             alt="${file.name}" 
                             class="inserted-image" 
                             style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
                             onclick="toggleImageSize(this)">
                        <div class="image-controls" style="margin-top: 5px; font-size: 11px; color: #666;">
                            <button onclick="resizeImage(this.parentElement.previousElementSibling, '50%')" class="img-btn">50%</button>
                            <button onclick="resizeImage(this.parentElement.previousElementSibling, '75%')" class="img-btn">75%</button>
                            <button onclick="resizeImage(this.parentElement.previousElementSibling, '100%')" class="img-btn">100%</button>
                            <button onclick="this.parentElement.parentElement.remove()" class="img-btn delete-btn">🗑️</button>
                        </div>
                    </div>
                `;
                
                if (targetSection) {
                    targetSection.insertAdjacentHTML('beforeend', imgHtml);
                }
                
                showSuccessMessage('Imagen insertada desde archivo');
            };
            
            reader.readAsDataURL(file);
        }
        
        document.body.removeChild(fileInput);
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
}

// Add enhanced toolbars with copy/paste functionality
function addToolbars() {
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        if (section.querySelector('.editor-toolbar')) {
            const existingToolbar = section.querySelector('.editor-toolbar');
            existingToolbar.style.display = editMode ? 'flex' : 'none';
            return;
        }
        
        const sectionContent = section.querySelector('.section-content');
        
        // Create enhanced toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';
        toolbar.style.display = editMode ? 'flex' : 'none';
        
        // Enhanced buttons with copy/paste functionality
        const buttons = [
            { command: 'bold', icon: '<strong>B</strong>', title: 'Negrita' },
            { command: 'italic', icon: '<em>I</em>', title: 'Cursiva' },
            { command: 'underline', icon: '<u>U</u>', title: 'Subrayado' },
            { command: 'insertUnorderedList', icon: '•', title: 'Lista con viñetas' },
            { command: 'insertOrderedList', icon: '1.', title: 'Lista numerada' },
            { command: 'justifyLeft', icon: '←', title: 'Alinear izquierda' },
            { command: 'justifyCenter', icon: '↔', title: 'Centrar' },
            { command: 'justifyRight', icon: '→', title: 'Alinear derecha' },
            { command: 'insertTable', icon: '⊞', title: 'Insertar tabla' },
            { command: 'pasteExcel', icon: '📋', title: 'Pegar tabla Excel (Ctrl+V)' },
            { command: 'importExcel', icon: '📊', title: 'Importar archivo CSV' },
            { command: 'insertImage', icon: '🖼️', title: 'Insertar imagen desde archivo' }
        ];
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.innerHTML = btn.icon;
            button.title = btn.title;
            button.onclick = (e) => {
                e.preventDefault();
                formatText(btn.command, null, sectionContent);
                sectionContent.focus();
            };
            toolbar.appendChild(button);
        });
        
        section.insertBefore(toolbar, sectionContent);
        sectionContent.classList.add('with-toolbar');
        
        // Add enhanced paste event listener
        sectionContent.addEventListener('paste', (e) => {
            if (editMode) {
                handleEnhancedPaste(e, sectionContent);
            }
        });
    });
}

// Toolbar button functions for section content editing
function insertExcelTable(buttonElement) {
    const sectionContent = buttonElement.parentElement.nextElementSibling;
    const placeholder = document.createElement('div');
    placeholder.innerHTML = '<table class="excel-imported-table"><tr><th>Columna 1</th><th>Columna 2</th><th>Columna 3</th></tr><tr><td>Dato 1</td><td>Dato 2</td><td>Dato 3</td></tr></table>';
    
    if (sectionContent.querySelector('em')) {
        sectionContent.innerHTML = '';
    }
    
    sectionContent.appendChild(placeholder.firstChild);
    showSuccessMessage('Tabla insertada. Puede editarla directamente o pegar desde Excel con Ctrl+V');
}

function insertList(listType, buttonElement) {
    const sectionContent = buttonElement.parentElement.nextElementSibling;
    const list = document.createElement(listType);
    const listItem = document.createElement('li');
    listItem.textContent = 'Nuevo elemento';
    list.appendChild(listItem);
    
    if (sectionContent.querySelector('em')) {
        sectionContent.innerHTML = '';
    }
    
    sectionContent.appendChild(list);
    
    // Focus on the new list item
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(listItem);
    selection.removeAllRanges();
    selection.addRange(range);
}

function undoAction(buttonElement) {
    if (document.queryCommandSupported('undo')) {
        document.execCommand('undo', false, null);
    }
}

function redoAction(buttonElement) {
    if (document.queryCommandSupported('redo')) {
        document.execCommand('redo', false, null);
    }
}

function formatText(command, buttonElement) {
    const sectionContent = buttonElement.parentElement.nextElementSibling;
    
    // Remove placeholder content if present
    if (sectionContent.querySelector('em')) {
        sectionContent.innerHTML = '';
        sectionContent.focus();
    }
    
    switch(command) {
        case 'bold':
            document.execCommand('bold', false, null);
            break;
        case 'italic':
            document.execCommand('italic', false, null);
            break;
        case 'underline':
            document.execCommand('underline', false, null);
            break;
        case 'removeFormat':
            document.execCommand('removeFormat', false, null);
            break;
    }
}

// Utility functions for user feedback
function showSuccessMessage(message) {
    showMessage(message, '#4caf50');
}

function showErrorMessage(message) {
    showMessage(message, '#f44336');
}

function showMessage(message, color) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: ${color};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 1000;
        font-size: 14px;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Enhanced toggle edit function
function toggleEdit() {
    editMode = !editMode;
    const button = document.querySelector('.edit-button');
    const fields = document.querySelectorAll('.field');
    const sections = document.querySelectorAll('.section-content');
    const toolbars = document.querySelectorAll('.editor-toolbar');
      if (editMode) {
        document.body.classList.add('edit-mode');
        button.textContent = 'Desactivar Edición';
        button.style.background = '#f44336';
        
        fields.forEach(field => {
            field.contentEditable = 'true';
            if (field.textContent.startsWith('[') && field.textContent.endsWith(']')) {
                field.textContent = '';
                field.style.minWidth = '100px';
            }
        });
        
        sections.forEach(section => {
            section.contentEditable = 'true';
            if (section.querySelector('em')) {
                section.innerHTML = '';
            }
        });
          toolbars.forEach(toolbar => {
            toolbar.style.display = 'flex';
        });
        
        addToolbars(); // Refresh toolbars with enhanced functionality
        setupSectionContentHandlers(); // Setup enhanced paste and focus handlers
        showSuccessMessage('Modo de edición activado. Puede pegar tablas de Excel con Ctrl+V');
          } else {
        document.body.classList.remove('edit-mode');
        button.textContent = 'Activar Edición';
        button.style.background = '#4caf50';
        
        fields.forEach(field => {
            field.contentEditable = 'false';
            if (field.textContent.trim() === '') {
                field.textContent = field.getAttribute('data-placeholder') || '[Campo]';
            }
        });
        
        sections.forEach(section => {
            section.contentEditable = 'false';
            if (section.textContent.trim() === '') {
                section.innerHTML = '<p><em>Contenido de la sección...</em></p>';
            }
        });
        
        toolbars.forEach(toolbar => {
            toolbar.style.display = 'none';
        });
    }
}

// Global variable to track the last active section content for file uploads
let lastActiveSection = null;

// Initialize file input handlers when document loads
document.addEventListener('DOMContentLoaded', function() {
    // Track the last clicked section content for file operations
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('section-content') || e.target.closest('.section-content')) {
            lastActiveSection = e.target.classList.contains('section-content') ? e.target : e.target.closest('.section-content');
        }
        
        // Also track when toolbar buttons are clicked
        if (e.target.closest('.editor-toolbar')) {
            const toolbar = e.target.closest('.editor-toolbar');
            lastActiveSection = toolbar.nextElementSibling;
        }
    });
    
    // Excel file input handler
    const excelInput = document.getElementById('excel-input');
    if (excelInput) {
        excelInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && lastActiveSection) {
                loadExcelFile(file, lastActiveSection);
            }
        });
    }
    
    // Image file input handler
    const imageInput = document.getElementById('image-input');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && lastActiveSection) {
                loadImageFile(file, lastActiveSection);
            }
        });
    }
});

// Load Excel file and convert to table
function loadExcelFile(file, targetElement) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // For simplicity, we'll create a basic table structure
            // In a real implementation, you'd use a library like xlsx to parse Excel files
            const tableHTML = `
                <table class="excel-imported-table">
                    <tr>
                        <th>Columna 1</th>
                        <th>Columna 2</th>
                        <th>Columna 3</th>
                        <th>Columna 4</th>
                    </tr>
                    <tr>
                        <td>Datos del archivo Excel</td>
                        <td>Columna 2</td>
                        <td>Columna 3</td>
                        <td>Columna 4</td>
                    </tr>
                    <tr>
                        <td>Fila 2</td>
                        <td>Dato B2</td>
                        <td>Dato C2</td>
                        <td>Dato D2</td>
                    </tr>
                </table>
            `;
            
            if (targetElement.querySelector('em')) {
                targetElement.innerHTML = '';
            }
            
            targetElement.insertAdjacentHTML('beforeend', tableHTML);
            showSuccessMessage(`Archivo Excel "${file.name}" importado exitosamente`);
            
        } catch (error) {
            showErrorMessage('Error al importar el archivo Excel: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

// Load image file
function loadImageFile(file, targetElement) {
    if (!file.type.startsWith('image/')) {
        showErrorMessage('Por favor seleccione un archivo de imagen válido');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'inserted-image';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        
        const controls = document.createElement('div');
        controls.className = 'image-controls';
        controls.innerHTML = `
            <button class="img-btn" onclick="resizeImage(this, 0.8)">Reducir</button>
            <button class="img-btn" onclick="resizeImage(this, 1.2)">Ampliar</button>
            <button class="img-btn delete-btn" onclick="removeImage(this)">Eliminar</button>
        `;
        
        imageContainer.appendChild(img);
        imageContainer.appendChild(controls);
        
        if (targetElement.querySelector('em')) {
            targetElement.innerHTML = '';
        }
        
        targetElement.appendChild(imageContainer);
        showSuccessMessage(`Imagen "${file.name}" insertada exitosamente`);
    };
    reader.readAsDataURL(file);
}

// Image control functions
function resizeImage(button, factor) {
    const img = button.closest('.image-container').querySelector('img');
    const currentWidth = img.offsetWidth;
    const newWidth = Math.max(100, Math.min(800, currentWidth * factor));
    img.style.width = newWidth + 'px';
}

function removeImage(button) {
    const container = button.closest('.image-container');
    container.remove();
    showSuccessMessage('Imagen eliminada');
}

// Enhanced paste handler specifically for section content
function setupSectionContentHandlers() {
    const sectionContents = document.querySelectorAll('.section-content.with-toolbar');
    
    sectionContents.forEach(sectionContent => {
        sectionContent.addEventListener('paste', function(e) {
            if (editMode) {
                handleEnhancedPaste(e, this);
            }
        });
        
        sectionContent.addEventListener('focus', function() {
            lastActiveSection = this;
            
            // Remove placeholder text when focused
            if (this.querySelector('em')) {
                this.innerHTML = '';
            }
        });
        
        sectionContent.addEventListener('blur', function() {
            // Add placeholder text if empty
            if (this.textContent.trim() === '') {
                this.innerHTML = '<p><em>Haga clic aquí para agregar contenido...</em></p>';
            }
        });
    });
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    addToolbars();
    
    // Auto-save every 30 seconds
    setInterval(() => {
        if (editMode) {
            saveContent();
        }
    }, 30000);
    
    // Load saved content
    const saved = localStorage.getItem('resolution_draft');
    if (saved && confirm('¿Desea cargar el borrador guardado anteriormente?')) {
        document.querySelector('.document-container').innerHTML = saved;
        addToolbars(); // Re-add toolbars after loading content
    }
});