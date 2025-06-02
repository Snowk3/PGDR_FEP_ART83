      let editMode = false;
        
// Text formatting functions
function formatText(command, value = null) {
    document.execCommand(command, false, value);
}

function addToolbars() {
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        // Check if this section already has a toolbar
        if (section.querySelector('.editor-toolbar')) {
            // Toolbar already exists, just update its display property
            const existingToolbar = section.querySelector('.editor-toolbar');
            existingToolbar.style.display = editMode ? 'flex' : 'none';
            return;
        }
        
        const sectionContent = section.querySelector('.section-content');
        const sectionTitle = section.querySelector('.section-title');
        
        // Create toolbar container
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';
        toolbar.style.display = editMode ? 'flex' : 'none';
        
        // Add buttons to toolbar
        const buttons = [
            { command: 'bold', icon: '<strong>B</strong>', title: 'Negrita' },
            { command: 'italic', icon: '<em>I</em>', title: 'Cursiva' },
            { command: 'underline', icon: '<u>U</u>', title: 'Subrayado' },
            { command: 'insertUnorderedList', icon: '•', title: 'Lista con viñetas' },
            { command: 'insertOrderedList', icon: '1.', title: 'Lista numerada' },
            { command: 'justifyLeft', icon: '←', title: 'Alinear a la izquierda' },
            { command: 'justifyCenter', icon: '↔', title: 'Centrar' },
            { command: 'justifyRight', icon: '→', title: 'Alinear a la derecha' }
        ];
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.innerHTML = btn.icon;
            button.title = btn.title;
            button.onclick = (e) => {
                e.preventDefault();
                formatText(btn.command);
                sectionContent.focus();
            };
            toolbar.appendChild(button);
        });
        
        // Insert toolbar before section content
        section.insertBefore(toolbar, sectionContent);
        
        // Add class to section content for styling
        sectionContent.classList.add('with-toolbar');
    });
}

function toggleEdit() {
    editMode = !editMode;
    const button = document.querySelector('.edit-button');
    const fields = document.querySelectorAll('.field');
    const sections = document.querySelectorAll('.section-content');
    const toolbars = document.querySelectorAll('.editor-toolbar');
    
    if (editMode) {
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
        
    } else {
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

// Auto-save to localStorage (basic implementation)
function saveContent() {
    const content = document.querySelector('.document-container').innerHTML;
    localStorage.setItem('resolution_draft', content);
    
    // Show save notification
    const notification = document.createElement('div');
    notification.textContent = 'Documento guardado';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#4caf50';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '1000';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Initialize editor when page loads
window.addEventListener('DOMContentLoaded', () => {
    // Clear any existing toolbars and add fresh ones
    document.querySelectorAll('.editor-toolbar').forEach(toolbar => toolbar.remove());
    addToolbars();
    
    // Set up auto-save
    setInterval(() => {
        if (editMode) {
            saveContent();
        }
    }, 30000);
    
    // Load saved content
    const saved = localStorage.getItem('resolution_draft');
    if (saved && confirm('¿Desea cargar el borrador guardado anteriormente?')) {
        document.querySelector('.document-container').innerHTML = saved;
        // Remove any old toolbars that might have been in the saved content
        document.querySelectorAll('.editor-toolbar').forEach(toolbar => toolbar.remove());
        // Reapply toolbars after loading content
        addToolbars();
    }
});