// Main Application Entry Point
document.addEventListener('DOMContentLoaded', () => {
    console.log('Chat app initialized');
    
    // Add any global functionality here
    // The auth and chat modules handle themselves
});

// Helper function for notifications (optional)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}