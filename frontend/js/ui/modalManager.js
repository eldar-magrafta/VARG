// modalManager.js - Modal and Overlay Management Module
// Handles all modal dialogs, overlays, and popup management

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

// Show existing modal
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.warn(`⚠️ Modal not found: ${modalId}`);
        return false;
    }
    
    modal.style.display = 'block';
    modal.classList.add('modal-visible');
    
    // Track if not already tracked
    if (!activeModals.has(modalId)) {
        activeModals.add(modalId);
        modalStack.push(modalId);
    }
    
    // Focus management
    setTimeout(() => {
        modal.focus();
        trapFocus(modal);
    }, 100);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    console.log(`👁️ Modal shown: ${modalId}`);
    return true;
}

// Hide modal (but don't remove from DOM)
export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.warn(`⚠️ Modal not found: ${modalId}`);
        return false;
    }
    
    modal.style.display = 'none';
    modal.classList.remove('modal-visible');
    
    // Remove from tracking
    activeModals.delete(modalId);
    modalStack = modalStack.filter(id => id !== modalId);
    
    // Restore body scrolling if no modals are active
    if (activeModals.size === 0) {
        document.body.style.overflow = '';
    }
    
    console.log(`🙈 Modal hidden: ${modalId}`);
    return true;
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

// Check if any modals are active
export function hasActiveModals() {
    return activeModals.size > 0;
}

// Get active modal count
export function getActiveModalCount() {
    return activeModals.size;
}

// Get list of active modal IDs
export function getActiveModalIds() {
    return Array.from(activeModals);
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

// Create confirmation dialog
export function showConfirmationDialog(message, onConfirm, onCancel = null, options = {}) {
    const modalId = 'confirmationDialog';
    const modal = createModal(modalId, MODAL_TYPES.CONFIRMATION);
    
    const {
        title = 'Confirm Action',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        type = 'warning'
    } = options;
    
    modal.innerHTML = `
        <div class="confirmation-dialog">
            <div class="confirmation-header">
                <h3>${escapeHtml(title)}</h3>
            </div>
            <div class="confirmation-body">
                <p>${escapeHtml(message)}</p>
            </div>
            <div class="confirmation-actions">
                <button id="confirmBtn" class="btn-${type}">${escapeHtml(confirmText)}</button>
                <button id="cancelBtn" class="btn-secondary">${escapeHtml(cancelText)}</button>
            </div>
        </div>
    `;
    
    // Set up event listeners
    const confirmBtn = modal.querySelector('#confirmBtn');
    const cancelBtn = modal.querySelector('#cancelBtn');
    
    confirmBtn.addEventListener('click', () => {
        closeModal(modalId);
        if (onConfirm) onConfirm();
    });
    
    cancelBtn.addEventListener('click', () => {
        closeModal(modalId);
        if (onCancel) onCancel();
    });
    
    return modal;
}

// Create loading dialog
export function showLoadingDialog(message = 'Loading...', options = {}) {
    const modalId = 'loadingDialog';
    const modal = createModal(modalId, MODAL_TYPES.LOADING);
    
    const {
        cancellable = false,
        onCancel = null
    } = options;
    
    modal.innerHTML = `
        <div class="loading-dialog">
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${escapeHtml(message)}</p>
                ${cancellable ? `<button id="cancelLoadingBtn" class="btn-secondary">Cancel</button>` : ''}
            </div>
        </div>
    `;
    
    if (cancellable) {
        const cancelBtn = modal.querySelector('#cancelLoadingBtn');
        cancelBtn.addEventListener('click', () => {
            closeModal(modalId);
            if (onCancel) onCancel();
        });
    }
    
    return modal;
}

// Update loading dialog message
export function updateLoadingDialog(message) {
    const modal = document.getElementById('loadingDialog');
    if (modal) {
        const messageElement = modal.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
}

// Close loading dialog
export function closeLoadingDialog() {
    closeModal('loadingDialog');
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Check if specific modal is active
export function isModalActive(modalId) {
    return activeModals.has(modalId);
}

// Get modal element by ID
export function getModal(modalId) {
    return document.getElementById(modalId);
}

// Set modal content
export function setModalContent(modalId, content) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.innerHTML = content;
        return true;
    }
    return false;
}

// Add event listener to modal
export function addModalEventListener(modalId, event, handler) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.addEventListener(event, handler);
        return true;
    }
    return false;
}

// Cleanup function
export function cleanupModalManager() {
    closeAllModals();
    document.removeEventListener('keydown', handleGlobalKeydown);
    document.removeEventListener('click', handleGlobalClick);
    window.removeEventListener('resize', handleWindowResize);
    
    console.log('🧹 Modal manager cleaned up');
}