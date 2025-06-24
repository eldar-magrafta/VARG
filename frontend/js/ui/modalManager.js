// Modal state tracking
let activeModals = new Set();
let modalStack = [];

// Modal types enum
export const MODAL_TYPES = {
    REPORT_HISTORY: 'reportHistory',
    MAP_OVERLAY: 'mapOverlay',
    CONFIRMATION: 'confirmation',
    LOADING: 'loading',
    ERROR: 'error'
};

// Initialize modal manager
export function initializeModalManager() {
    console.log('🔧 Modal manager initialized');
    
    // Set up global event listeners
    document.addEventListener('keydown', handleGlobalKeydown);
    document.addEventListener('click', handleGlobalClick);
    
    // Set up window resize handler
    window.addEventListener('resize', handleWindowResize);
}

// Global keydown handler (ESC key support)
function handleGlobalKeydown(event) {
    if (event.key === 'Escape') {
        closeTopModal();
    }
}

// Global click handler (background click to close)
function handleGlobalClick(event) {
    // Check if click is on a modal overlay background
    const target = event.target;
    if (target.classList.contains('modal-overlay') || 
        target.classList.contains('map-overlay') ||
        target.id === 'reportHistoryOverlay') {
        closeModal(target.id || target.className.split(' ')[0]);
    }
}

// Handle window resize for responsive modals
function handleWindowResize() {
    activeModals.forEach(modalId => {
        repositionModal(modalId);
    });
}

// Create modal overlay element
export function createModal(modalId, modalType = MODAL_TYPES.CONFIRMATION) {
    // Remove existing modal if it exists
    removeModal(modalId);
    
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = getModalClasses(modalType);
    modal.setAttribute('data-modal-type', modalType);
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('tabindex', '-1');
    
    // Add to DOM
    document.body.appendChild(modal);
    
    // Track modal
    activeModals.add(modalId);
    modalStack.push(modalId);
    
    // Focus management
    setTimeout(() => {
        modal.focus();
        trapFocus(modal);
    }, 100);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    console.log(`📱 Modal created: ${modalId} (${modalType})`);
    return modal;
}

// Get CSS classes for modal type
function getModalClasses(modalType) {
    const baseClasses = 'modal-overlay';
    
    switch (modalType) {
        case MODAL_TYPES.REPORT_HISTORY:
            return `${baseClasses} report-history-overlay`;
        case MODAL_TYPES.MAP_OVERLAY:
            return `${baseClasses} map-overlay`;
        case MODAL_TYPES.LOADING:
            return `${baseClasses} loading-overlay`;
        case MODAL_TYPES.ERROR:
            return `${baseClasses} error-overlay`;
        default:
            return baseClasses;
    }
}

// Close and remove modal
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.warn(`⚠️ Modal not found: ${modalId}`);
        return false;
    }
    
    // Trigger close event
    modal.dispatchEvent(new CustomEvent('modalClose', {
        detail: { modalId, modalType: modal.getAttribute('data-modal-type') }
    }));
    
    // Remove from tracking
    activeModals.delete(modalId);
    modalStack = modalStack.filter(id => id !== modalId);
    
    // Remove from DOM
    modal.remove();
    
    // Restore body scrolling if no modals are active
    if (activeModals.size === 0) {
        document.body.style.overflow = '';
    }
    
    console.log(`❌ Modal closed: ${modalId}`);
    return true;
}

// Remove modal from DOM
export function removeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        closeModal(modalId);
    }
}

// Close the topmost modal
export function closeTopModal() {
    if (modalStack.length > 0) {
        const topModalId = modalStack[modalStack.length - 1];
        closeModal(topModalId);
        return true;
    }
    return false;
}

// Close all modals
export function closeAllModals() {
    const modalsToClose = [...activeModals];
    modalsToClose.forEach(modalId => {
        closeModal(modalId);
    });
    
    // Reset state
    activeModals.clear();
    modalStack = [];
    document.body.style.overflow = '';
    
    console.log('🧹 All modals closed');
}

// Reposition modal (for responsive design)
function repositionModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const modalType = modal.getAttribute('data-modal-type');
    
    // Apply responsive positioning based on modal type
    switch (modalType) {
        case MODAL_TYPES.REPORT_HISTORY:
            repositionReportHistoryModal(modal);
            break;
        case MODAL_TYPES.MAP_OVERLAY:
            repositionMapModal(modal);
            break;
        default:
            repositionGenericModal(modal);
    }
}

// Reposition report history modal
function repositionReportHistoryModal(modal) {
    const container = modal.querySelector('.report-history-container');
    if (!container) return;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (windowWidth <= 768) {
        container.style.width = '98%';
        container.style.margin = '1% auto';
        container.style.maxHeight = '96vh';
    } else {
        container.style.width = '95%';
        container.style.margin = '2% auto';
        container.style.maxHeight = '90vh';
    }
}

// Reposition map modal
function repositionMapModal(modal) {
    const container = modal.querySelector('.map-container');
    if (!container) return;
    
    const windowWidth = window.innerWidth;
    
    if (windowWidth <= 768) {
        container.style.width = '98%';
        container.style.height = '95%';
        container.style.margin = '1% auto';
    } else {
        container.style.width = '95%';
        container.style.height = '90%';
        container.style.margin = '2.5% auto';
    }
}

// Reposition generic modal
function repositionGenericModal(modal) {
    // Generic repositioning logic
    const windowWidth = window.innerWidth;
    
    if (windowWidth <= 480) {
        modal.style.padding = '10px';
    } else if (windowWidth <= 768) {
        modal.style.padding = '20px';
    } else {
        modal.style.padding = '40px';
    }
}

// Focus trap utility
function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    if (firstFocusable) {
        firstFocusable.focus();
    }
    
    modal.addEventListener('keydown', function(event) {
        if (event.key === 'Tab') {
            if (event.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    event.preventDefault();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    event.preventDefault();
                }
            }
        }
    });
}