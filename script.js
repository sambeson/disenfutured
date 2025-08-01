// Global variables
let activeWindows = [];
let zIndexCounter = 100;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateTime();
    setInterval(updateTime, 1000);
    
    // Add click listeners to close start menu when clicking elsewhere
    document.addEventListener('click', function(e) {
        const startMenu = document.getElementById('startMenu');
        const startButton = document.querySelector('.start-button');
        
        if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
            startMenu.style.display = 'none';
        }
    });
    
    // Make windows draggable
    makeWindowsDraggable();
    
    // Add some startup sounds simulation
    playStartupSequence();
});

// Update system tray time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('current-time').textContent = timeString;
}

function toggleStartMenu() {
    const startMenu = document.getElementById('startMenu');
    startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
}
// (removed extraneous closing brace)

function openWindow(windowId) {
    const windowElement = document.getElementById(windowId + 'Window');
    if (!windowElement) return;
    
    // Hide start menu
    document.getElementById('startMenu').style.display = 'none';
    
    // If window is already open, just bring it to front
    if (windowElement.style.display === 'block') {
        focusWindow(windowElement, windowId);
        return;
    }
    
    // Show window
    windowElement.style.display = 'block';
    
    // Bring to front
    focusWindow(windowElement, windowId);
    
    // Add to active windows if not already there
    if (!activeWindows.find(w => w.id === windowId)) {
        activeWindows.push({
            id: windowId,
            element: windowElement,
            title: windowElement.querySelector('.window-title').textContent.trim(),
            minimized: false
        });
        updateTaskbar();
    }
    
    // Add window shake effect
    windowElement.style.animation = 'windowOpen 0.3s ease-out';
    setTimeout(() => {
        windowElement.style.animation = '';
    }, 300);
    
    // Play window open sound simulation
    playSound('open');
}
    playSound('open');
function closeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    if (!windowElement) return;
    
    // Add closing animation
    windowElement.style.animation = 'windowClose 0.2s ease-in';
    
    setTimeout(() => {
        windowElement.style.display = 'none';
        windowElement.style.animation = '';
        
        // Remove from active windows
        const baseId = windowId.replace('Window', '');
        const index = activeWindows.findIndex(w => w.id === baseId);
        if (index > -1) {
            activeWindows.splice(index, 1);
            updateTaskbar();
        }
    }, 200);
    
    // Play window close sound simulation
    playSound('close');
}
    // Play window close sound simulation
    playSound('close');

// Focus Window (bring to front)
function focusWindow(windowElement, windowId) {
    zIndexCounter++;
    windowElement.style.zIndex = zIndexCounter;
    
    // Update window state
    const windowObj = activeWindows.find(w => w.id === windowId);
    if (windowObj) {
        windowObj.minimized = false;
    }
    
    updateTaskbar();
}

// Minimize Window
function minimizeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    if (!windowElement) return;
    
    // Add minimize animation
    windowElement.style.animation = 'windowMinimize 0.3s ease-in';
    
    setTimeout(() => {
        windowElement.style.display = 'none';
        windowElement.style.animation = '';
        
        // Update window state
        const baseId = windowId.replace('Window', '');
        const windowObj = activeWindows.find(w => w.id === baseId);
        if (windowObj) {
            windowObj.minimized = true;
        }
        updateTaskbar();
    }, 300);
    
    playSound('minimize');
}

// Maximize/Restore Window
function toggleMaximize(windowId) {
    const windowElement = document.getElementById(windowId);
    if (!windowElement) return;
    
    const isMaximized = windowElement.classList.contains('maximized');
    
    if (isMaximized) {
        // Restore window
        windowElement.classList.remove('maximized');
        windowElement.style.top = windowElement.dataset.originalTop || '100px';
        windowElement.style.left = windowElement.dataset.originalLeft || '100px';
        windowElement.style.width = windowElement.dataset.originalWidth || '500px';
        windowElement.style.height = windowElement.dataset.originalHeight || '400px';
    } else {
        // Store original position and size
        windowElement.dataset.originalTop = windowElement.style.top;
        windowElement.dataset.originalLeft = windowElement.style.left;
        windowElement.dataset.originalWidth = windowElement.style.width;
        windowElement.dataset.originalHeight = windowElement.style.height;
        
        // Maximize window
        windowElement.classList.add('maximized');
        windowElement.style.top = '0px';
        windowElement.style.left = '0px';
        windowElement.style.width = '100vw';
        windowElement.style.height = 'calc(100vh - 28px)';
    }
    
    playSound('maximize');
}

// Update Taskbar with active windows
function updateTaskbar() {
    const taskbarItems = document.querySelector('.taskbar-items');
    taskbarItems.innerHTML = '';
    
    activeWindows.forEach(windowObj => {
        const taskbarItem = document.createElement('div');
        taskbarItem.className = `taskbar-item ${windowObj.minimized ? '' : 'active'}`;
        taskbarItem.textContent = windowObj.title;
        taskbarItem.onclick = () => toggleWindowFromTaskbar(windowObj.id);
        taskbarItems.appendChild(taskbarItem);
    });
}

// Toggle window from taskbar click
function toggleWindowFromTaskbar(windowId) {
    const windowElement = document.getElementById(windowId + 'Window');
    const windowObj = activeWindows.find(w => w.id === windowId);
    
    if (!windowElement || !windowObj) return;
    
    if (windowObj.minimized || windowElement.style.display === 'none') {
        // Restore window
        windowElement.style.display = 'block';
        focusWindow(windowElement, windowId);
        windowObj.minimized = false;
        
        // Add restore animation
        windowElement.style.animation = 'windowRestore 0.3s ease-out';
        setTimeout(() => {
            windowElement.style.animation = '';
        }, 300);
        
        playSound('restore');
    } else if (windowElement.style.zIndex == zIndexCounter) {
        // If window is already focused, minimize it
        minimizeWindow(windowId + 'Window');
    } else {
        // Just bring to front
        focusWindow(windowElement, windowId);
    }
}

// Make windows draggable
function makeWindowsDraggable() {
    // Dragging disabled. Only bring window to front on header click.
    const windows = document.querySelectorAll('.window');
    windows.forEach(windowElement => {
        const header = windowElement.querySelector('.window-header');
        header.style.cursor = 'pointer';
        header.addEventListener('mousedown', function(e) {
            // Don't trigger if clicking on window controls
            if (e.target.classList.contains('window-control')) return;
            zIndexCounter++;
            windowElement.style.zIndex = zIndexCounter;
        });
        // Double-click to maximize/restore
        header.addEventListener('dblclick', function(e) {
            if (e.target.classList.contains('window-control')) return;
            toggleMaximize(windowElement.id);
        });
    });
}

// Sound simulation function
function playSound(type) {
    // Create a brief visual feedback for sound
    const body = document.body;
    
    switch(type) {
        case 'open':
            // Brief flash effect
            body.style.filter = 'brightness(1.1)';
            setTimeout(() => body.style.filter = '', 50);
            break;
        case 'close':
            // Brief dim effect
            body.style.filter = 'brightness(0.9)';
            setTimeout(() => body.style.filter = '', 50);
            break;
        case 'minimize':
            // Brief blue tint
            body.style.filter = 'hue-rotate(30deg)';
            setTimeout(() => body.style.filter = '', 100);
            break;
        case 'maximize':
            // Brief contrast boost
            body.style.filter = 'contrast(1.2)';
            setTimeout(() => body.style.filter = '', 100);
            break;
        case 'restore':
            // Brief saturation boost
            body.style.filter = 'saturate(1.3)';
            setTimeout(() => body.style.filter = '', 100);
            break;
        case 'startup':
            // Gradual brightness increase
            body.style.filter = 'brightness(0.8)';
            setTimeout(() => body.style.filter = 'brightness(1)', 500);
            setTimeout(() => body.style.filter = '', 1000);
            break;
    }
}

// Startup sequence simulation
function playStartupSequence() {
    const desktop = document.querySelector('.desktop');
    desktop.style.opacity = '0';
    
    // Fade in desktop
    setTimeout(() => {
        desktop.style.transition = 'opacity 1s ease-in';
        desktop.style.opacity = '1';
        playSound('startup');
    }, 100);
    
    // Show main window after startup and add to active windows
    setTimeout(() => {
        const mainWindow = document.getElementById('mainWindow');
        mainWindow.style.display = 'block';
        
        // Add main window to active windows
        activeWindows.push({
            id: 'main',
            element: mainWindow,
            title: 'DISENFUTURED',
            minimized: false
        });
        
        focusWindow(mainWindow, 'main');
        updateTaskbar();
    }, 1500);
}

// Error dialog simulation (for fun)
function showError(message) {
    const errorWindow = document.createElement('div');
    errorWindow.className = 'window';
    errorWindow.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        height: 150px;
        z-index: 9999;
        background: #c0c0c0;
        border: 2px outset #c0c0c0;
    `;
    
    errorWindow.innerHTML = `
        <div class="window-header">
            <div class="window-title">
                <img src="images/error.ico" alt="Error" class="window-icon">
                Error
            </div>
            <div class="window-controls">
                <button class="window-control close" onclick="this.closest('.window').remove()">×</button>
            </div>
        </div>
        <div class="window-content" style="display: flex; align-items: center; gap: 12px;">
            <img src="images/error-icon.png" alt="Error" style="width: 32px; height: 32px;">
            <div>
                <p style="font-size: 11px; margin-bottom: 12px;">${message}</p>
                <button class="retro-button" onclick="this.closest('.window').remove()">OK</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorWindow);
    
    // Make it draggable
    makeWindowsDraggable();
}

// Easter eggs and interactive elements
document.addEventListener('keydown', function(e) {
    // Window management shortcuts
    if (e.altKey && e.keyCode === 9) { // Alt+Tab window switching
        e.preventDefault();
        switchToNextWindow();
    }
    
    if (e.altKey && e.keyCode === 32) { // Alt+Space system menu
        e.preventDefault();
        showSystemMenu();
    }
    
    // Konami code easter egg
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    window.konamiProgress = window.konamiProgress || 0;
    
    if (e.keyCode === konamiCode[window.konamiProgress]) {
        window.konamiProgress++;
        if (window.konamiProgress === konamiCode.length) {
            showError('DISENFUTURED RULES! 🤘');
            window.konamiProgress = 0;
        }
    } else {
        window.konamiProgress = 0;
    }
    
    // Alt+F4 easter egg
    if (e.altKey && e.keyCode === 115) {
        e.preventDefault();
        showError('Nice try! But this is a web page, not Windows! 😄');
    }
    
    // Ctrl+Alt+Delete easter egg
    if (e.ctrlKey && e.altKey && e.keyCode === 46) {
        e.preventDefault();
        showError('Task Manager is not available in the browser!');
    }
});

// Alt+Tab window switching
function switchToNextWindow() {
    if (activeWindows.length <= 1) return;
    
    const currentFocused = activeWindows.find(w => w.element.style.zIndex == zIndexCounter);
    let nextIndex = 0;
    
    if (currentFocused) {
        const currentIndex = activeWindows.indexOf(currentFocused);
        nextIndex = (currentIndex + 1) % activeWindows.length;
    }
    
    const nextWindow = activeWindows[nextIndex];
    if (nextWindow.minimized) {
        toggleWindowFromTaskbar(nextWindow.id);
    } else {
        focusWindow(nextWindow.element, nextWindow.id);
    }
}

// Alt+Space system menu simulation
function showSystemMenu() {
    showError('System menu not implemented! Use the window controls instead.');
}

// Random window shake effect
function randomWindowShake() {
    const windows = document.querySelectorAll('.window:not([style*="display: none"])');
    if (windows.length === 0) return;
    
    const randomWindow = windows[Math.floor(Math.random() * windows.length)];
    randomWindow.style.animation = 'windowShake 0.5s ease-in-out';
    
    setTimeout(() => {
        randomWindow.style.animation = '';
    }, 500);
}

// Occasionally shake windows for that authentic 90s experience
setInterval(() => {
    if (Math.random() < 0.1) { // 10% chance every 10 seconds
        randomWindowShake();
    }
}, 10000);

// Blue Screen of Death easter egg (very rare)
function triggerBSOD() {
    const bsod = document.createElement('div');
    bsod.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #0000aa;
        color: white;
        font-family: 'Courier New', monospace;
        font-size: 16px;
        z-index: 99999;
        padding: 40px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
    `;
    
    bsod.innerHTML = `
        <div style="background: white; color: #0000aa; padding: 2px 8px; display: inline-block; margin-bottom: 20px;">
            Windows
        </div>
        <p>A fatal exception has occurred at 0x0000PUNK in DISENFUTURED.EXE</p>
        <p>The current application will be terminated.</p>
        <br>
        <p>* Press any key to destroy the system</p>
        <p>* Press CTRL+ALT+DEL to restart the chaos</p>
        <p>* Press ESC to return to the underground</p>
        <br>
        <p style="margin-top: 40px;">Press any key to continue _</p>
    `;
    
    document.body.appendChild(bsod);
    
    // Remove on any key press
    const removeHandler = () => {
        bsod.remove();
        document.removeEventListener('keydown', removeHandler);
    };
    
    document.addEventListener('keydown', removeHandler);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (bsod.parentNode) {
            bsod.remove();
            document.removeEventListener('keydown', removeHandler);
        }
    }, 5000);
}

// Very rare BSOD trigger
setInterval(() => {
    if (Math.random() < 0.001) { // 0.1% chance every 30 seconds
        triggerBSOD();
    }
}, 30000);

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes windowOpen {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes windowClose {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0.8); opacity: 0; }
    }
    
    @keyframes windowMinimize {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0.1) translateY(500px); opacity: 0; }
    }
    
    @keyframes windowRestore {
        0% { transform: scale(0.1) translateY(500px); opacity: 0; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
    }
    
    @keyframes windowShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(2px); }
    }
    
    .window.maximized {
        transition: all 0.3s ease !important;
    }
    
    .taskbar-item {
        cursor: pointer;
        transition: background-color 0.1s ease;
    }
    
    .taskbar-item:hover {
        background: var(--win98-light-gray);
    }
    
    .window-control:hover.minimize {
        background: #ffff00;
    }
    
    .window-control:hover.maximize {
        background: #00ff00;
    }
`;
document.head.appendChild(style);

// Placeholder functions for merch buttons (to be replaced with real functionality)
document.addEventListener('click', function(e) {
    if (e.target.textContent === 'BUY NOW') {
        showError('Merch store coming soon! DM us on Instagram for now!');
    }
    
    if (e.target.textContent === 'TICKETS' || e.target.textContent === 'INFO' || e.target.textContent === 'DETAILS') {
        showError('Check our Instagram @disenfutured for show updates!');
    }
    
    if (e.target.textContent === 'SEND MESSAGE' || e.target.textContent === 'ORDER FORM') {
        showError('Email us at booking@disenfutured.com or DM on Instagram!');
    }
});

// Console easter egg

// Desktop Icon Drag Functionality
// Dragging for desktop icons is fully removed. Only click events should open windows.

// Fake File System Functions
// Dragging for desktop icons is disabled. Only handle click to open window.
// Remove startDrag and all drag logic entirely.
function openFolder(folderId) {
    const computerWindow = document.getElementById('computerWindow');
    const fileSystem = computerWindow.querySelector('.file-system');
    // Example: just show folder name for now
    fileSystem.innerHTML = `<div><button onclick="openComputer()">← Back</button> <span>Viewing: ${folderId}</span></div>`;
}

function openComputer() {
    const computerWindow = document.getElementById('computerWindow');
    const fileSystem = computerWindow.querySelector('.file-system');

    fileSystem.innerHTML = `
        <div class="file-item folder" onclick="openFolder('cDrive')">
            <div class="file-icon folder"></div>
            <span>Local Disk (C:)</span>
            <span class="file-size">666 GB</span>
        </div>
        <div class="file-item folder" onclick="openFolder('dDrive')">
            <div class="file-icon cd"></div>
            <span>CD-ROM Drive (D:)</span>
            <span class="file-size">---</span>
        </div>
    `;
}

function browserHome() {
    const addressInput = document.getElementById('addressInput');
    addressInput.value = 'http://www.disenfutured.geocities.com';
    showError('Already at home page!');
}

// Map new window IDs to existing openWindow function
const originalOpenWindow = window.openWindow || openWindow;
window.openWindow = function(windowId) {
    // Special cases: run extra logic, but always pass base ID to originalOpenWindow
    if (windowId === 'computer') {
        openComputer(); // Reset to main view
    } else if (windowId === 'clippy') {
        initializeClippy();
    }
    // Always call originalOpenWindow with the base windowId
    return originalOpenWindow(windowId);
};

// ===== CLIPPY CHATBOT FUNCTIONALITY =====

let chatHistory = [];
let isClippyTyping = false;

// Initialize Clippy when window opens
function initializeClippy() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    // Add enter key listener
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Add input listener for send button state
    chatInput.addEventListener('input', function() {
        sendButton.disabled = this.value.trim() === '';
    });
}

// Send user message
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (message === '' || isClippyTyping) return;
    
    // Big Chungus Easter Egg
    if (message.trim().toLowerCase() === 'chunguschunguschungus') {
        triggerBigChungus();
        addUserMessage(message);
        chatInput.value = '';
        document.getElementById('sendButton').disabled = true;
        chatHistory.push({ sender: 'user', text: message });
        return;
    }
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input
    chatInput.value = '';
    document.getElementById('sendButton').disabled = true;
    
    // Add to chat history
    chatHistory.push({ sender: 'user', text: message });
    
    // Show typing indicator and get response
    showTypingIndicator();
    getChatGPTResponse(message);
// Big Chungus Easter Egg
function triggerBigChungus() {
    // Hide everything
    // Save original background
    const originalBg = document.body.style.background;
    document.body.style.background = '#000';
    const desktop = document.querySelector('.desktop');
    if (desktop) desktop.style.display = 'none';
    const windows = document.querySelectorAll('.window');
    windows.forEach(win => win.style.display = 'none');
    const backgroundIcons = document.querySelector('.background-icons');
    if (backgroundIcons) backgroundIcons.style.display = 'none';

    // Create overlay
    let chungusOverlay = document.getElementById('chungusOverlay');
    if (!chungusOverlay) {
        chungusOverlay = document.createElement('div');
        chungusOverlay.id = 'chungusOverlay';
        chungusOverlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: #000;
            pointer-events: none;
            z-index: 99999;
        `;
        document.body.appendChild(chungusOverlay);
    }
    chungusOverlay.innerHTML = '';
    // Add Big Chungus image (PNG)
    const chungusImg = document.createElement('img');
    chungusImg.src = 'images/Big_chungus.png';
    chungusImg.alt = 'Big Chungus';
    chungusImg.style.cssText = `
        position: absolute;
        left: 50vw;
        top: 50vh;
        width: 320px;
        height: 320px;
        transform: translate(-50%, -50%) rotate(0deg);
        will-change: transform;
        transition: none;
        pointer-events: none;
        filter: drop-shadow(0 0 40px #fff);
    `;
    chungusOverlay.appendChild(chungusImg);
    // Add flashing text
    const chungusText = document.createElement('div');
    chungusText.textContent = 'BIG CHUNGUS';
    chungusText.style.cssText = `
        position: fixed;
        top: 18%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 9vw;
        font-family: Impact, Arial Black, sans-serif;
        color: #ff00ff;
        text-shadow: 0 0 60px #fff, 0 0 120px #ff00ff;
        font-weight: bold;
        animation: chungus-flash 0.2s alternate infinite;
        z-index: 999999;
        pointer-events: none;
    `;
    chungusOverlay.appendChild(chungusText);
    // Animate image bouncing and spinning
    let angle = 0;
    let vx = (Math.random() > 0.5 ? 1 : -1) * 14;
    let vy = (Math.random() > 0.5 ? 1 : -1) * 12;
    let x = Math.random() * (window.innerWidth - 320);
    let y = Math.random() * (window.innerHeight - 320);
    function animateChungus() {
        angle += 24;
        x += vx;
        y += vy;
        // Bounce off edges
        if (x < 0) { x = 0; vx *= -1; }
        if (x > window.innerWidth - 320) { x = window.innerWidth - 320; vx *= -1; }
        if (y < 0) { y = 0; vy *= -1; }
        if (y > window.innerHeight - 320) { y = window.innerHeight - 320; vy *= -1; }
        chungusImg.style.left = x + 'px';
        chungusImg.style.top = y + 'px';
        chungusImg.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        chungusImg.style.transition = 'none';
    }
    let frame = 0;
    const interval = setInterval(() => {
        animateChungus();
        frame++;
        // Remove after 5 seconds
        if (frame > 150) {
            chungusOverlay.innerHTML = '';
            clearInterval(interval);
            // Restore desktop and windows
            document.body.style.background = originalBg;
            if (desktop) desktop.style.display = '';
            windows.forEach(win => win.style.display = '');
            if (backgroundIcons) backgroundIcons.style.display = '';
        }
    }, 33);
}
// Add flashing text animation
const chungusStyle = document.createElement('style');
chungusStyle.textContent = `@keyframes chungus-flash { 0% { opacity: 1; color: #ff00ff; } 100% { opacity: 0.2; color: #ffff00; } }`;
document.head.appendChild(chungusStyle);
}

// Send suggestion message
function sendSuggestion(message) {
    const chatInput = document.getElementById('chatInput');
    chatInput.value = message;
    sendMessage();
}

// Add user message to chat
function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.innerHTML = '<span class="message-text">' + escapeHtml(message) + '</span>';
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Add Clippy message to chat
function addClippyMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message clippy-message';
    messageDiv.innerHTML = '<span class="message-text"><img src="images/258-2580697_clippy-png-png-download-clippy-windows-transparent-png.png" alt="Clippy" style="height:24px;vertical-align:middle;margin-right:6px;background:transparent;" />' + escapeHtml(message) + '</span>';
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    chatHistory.push({ sender: 'clippy', text: message });
}

// Show typing indicator
function showTypingIndicator() {
    isClippyTyping = true;
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    isClippyTyping = false;
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'none';
}

// Scroll chat to bottom
function scrollToBottom() {
    const chatContainer = document.querySelector('.chat-container');
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get ChatGPT response from backend
async function getChatGPTResponse(message) {
    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                chatHistory: chatHistory.slice(-10) // Send last 10 messages for context
            })
        });

        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }

        const data = await response.json();
        
        // Simulate typing delay
        setTimeout(() => {
            hideTypingIndicator();
            
            if (data.success && data.response) {
                addClippyMessage(data.response);
            } else {
                addClippyMessage("I'm having trouble connecting right now. Try asking me about DISENFUTURED's music, shows, or merch!");
            }
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds

    } catch (error) {
        console.error('Chat error:', error);
        
        setTimeout(() => {
            hideTypingIndicator();
            addClippyMessage(getStaticResponse(message));
        }, 1500);
    }
}

// Static fallback responses
function getStaticResponse(message) {
    const responses = [
        "Stop asking an AI bot basic questions and use your brain, moron. DISENFUTURED is a band. Figure out the rest yourself.",
        "Seriously? You're talking to a broken chatbot instead of just looking around the website? Touch grass, loser.",
        "Why are you even here? Go listen to actual music instead of wasting time with a bot, idiot.",
        "Bro, it's literally a band website. Click around and figure it out yourself instead of being lazy.",
        "Imagine needing to ask a chatbot about obvious stuff. Get a life and stop being so helpless."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}