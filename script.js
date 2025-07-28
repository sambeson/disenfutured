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

// Toggle Start Menu
function toggleStartMenu() {
    const startMenu = document.getElementById('startMenu');
    startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
}

// Open Window
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

// Close Window
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
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(windowElement => {
        const header = windowElement.querySelector('.window-header');
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        header.addEventListener('mousedown', function(e) {
            // Don't drag if clicking on window controls
            if (e.target.classList.contains('window-control')) {
                return;
            }
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = windowElement.offsetLeft;
            startTop = windowElement.offsetTop;
            
            // Bring window to front
            zIndexCounter++;
            windowElement.style.zIndex = zIndexCounter;
            
            header.style.cursor = 'grabbing';
            
            // Prevent text selection
            e.preventDefault();
        });
        
        // Double-click to maximize/restore
        header.addEventListener('dblclick', function(e) {
            if (e.target.classList.contains('window-control')) return;
            toggleMaximize(windowElement.id);
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            const newLeft = startLeft + (e.clientX - startX);
            const newTop = startTop + (e.clientY - startY);
            
            // Keep window within bounds
            const maxLeft = window.innerWidth - windowElement.offsetWidth;
            const maxTop = window.innerHeight - windowElement.offsetHeight - 28; // Account for taskbar
            
            windowElement.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
            windowElement.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'grab';
            }
        });
        
        // Set initial cursor
        header.style.cursor = 'grab';
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
console.log(`
██████╗ ██╗███████╗███████╗███╗   ██╗███████╗██╗   ██╗████████╗██╗   ██╗██████╗ ███████╗██████╗ 
██╔══██╗██║██╔════╝██╔════╝████╗  ██║██╔════╝██║   ██║╚══██╔══╝██║   ██║██╔══██╗██╔════╝██╔══██╗
██║  ██║██║███████╗█████╗  ██╔██╗ ██║█████╗  ██║   ██║   ██║   ██║   ██║██████╔╝█████╗  ██║  ██║
██║  ██║██║╚════██║██╔══╝  ██║╚██╗██║██╔══╝  ██║   ██║   ██║   ██║   ██║██╔══██╗██╔══╝  ██║  ██║
██████╔╝██║███████║███████╗██║ ╚████║██║     ╚██████╔╝   ██║   ╚██████╔╝██║  ██║███████╗██████╔╝
╚═════╝ ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝      ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝ 

Welcome to the DISENFUTURED underground experience!

🎮 SHORTCUTS & EASTER EGGS:
- Try the Konami code (↑↑↓↓←→←→BA) for a surprise!
- Alt+F4 or Ctrl+Alt+Delete for some 90s nostalgia!
- Press 'P' key to toggle pixelation levels!
- Alt+Tab to switch between windows!
- Double-click window headers to maximize/restore!
- Click taskbar items to minimize/restore windows!

🪟 WINDOW CONTROLS:
- _ = Minimize   □ = Maximize   × = Close
`);

// Pixelation toggle function
let pixelationLevel = 0;
const maxPixelationLevels = 3;

function togglePixelation() {
    const desktop = document.querySelector('.desktop');
    
    // Remove existing pixelation classes
    desktop.classList.remove('pixelated', 'mega-pixelated');
    
    pixelationLevel = (pixelationLevel + 1) % maxPixelationLevels;
    
    switch(pixelationLevel) {
        case 0:
            // Normal pixelation (default)
            break;
        case 1:
            // Enhanced pixelation
            desktop.classList.add('pixelated');
            break;
        case 2:
            // Mega pixelation
            desktop.classList.add('mega-pixelated');
            break;
    }
    
    // Show feedback
    showError(`Pixelation Level: ${pixelationLevel + 1}/${maxPixelationLevels}`);
}

// Add P key listener for pixelation toggle
document.addEventListener('keydown', function(e) {
    // P key for pixelation toggle
    if (e.keyCode === 80 && !e.ctrlKey && !e.altKey) {
        togglePixelation();
    }
});
