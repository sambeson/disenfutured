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
    
    // On mobile, close the main window when opening a sub-window to reduce clutter
    if (isMobile() && windowId !== 'main') {
        const mainWindow = document.getElementById('mainWindow');
        if (mainWindow) mainWindow.style.display = 'none';
    }
    
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

// Track if user manually closed the main window
let mainWindowClosed = false;

function closeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    if (!windowElement) return;
    
    // Track if user closed the main window
    if (windowId === 'mainWindow') {
        mainWindowClosed = true;
    }
    
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
        
        // On mobile, re-show main window when closing a sub-window (only if user didn't close it)
        if (isMobile() && windowId !== 'mainWindow' && !mainWindowClosed) {
            const mainWindow = document.getElementById('mainWindow');
            if (mainWindow) {
                mainWindow.style.display = 'block';
                focusWindow(mainWindow, 'main');
            }
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

// Check if we're on a mobile device
function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

// Make windows draggable
function makeWindowsDraggable() {
    const windows = document.querySelectorAll('.window');
    windows.forEach(windowElement => {
        const header = windowElement.querySelector('.window-header');
        header.style.cursor = 'move';
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        // --- Mouse events (desktop) ---
        header.addEventListener('mousedown', function(e) {
            if (e.target.classList.contains('window-control')) return;
            if (isMobile()) return; // skip drag on mobile
            
            zIndexCounter++;
            windowElement.style.zIndex = zIndexCounter;
            isDragging = true;
            
            const rect = windowElement.getBoundingClientRect();
            initialX = e.clientX - rect.left;
            initialY = e.clientY - rect.top;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isDragging && windowElement.style.display === 'block') {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                windowElement.style.left = currentX + 'px';
                windowElement.style.top = currentY + 'px';
                windowElement.style.position = 'fixed';
            }
        });
        
        document.addEventListener('mouseup', function(e) {
            isDragging = false;
        });
        
        // --- Touch events (mobile) ---
        header.addEventListener('touchstart', function(e) {
            if (e.target.classList.contains('window-control')) return;
            if (isMobile()) return; // on mobile, windows are fullscreen — no drag needed
            
            zIndexCounter++;
            windowElement.style.zIndex = zIndexCounter;
            isDragging = true;
            
            const touch = e.touches[0];
            const rect = windowElement.getBoundingClientRect();
            initialX = touch.clientX - rect.left;
            initialY = touch.clientY - rect.top;
        }, { passive: true });
        
        document.addEventListener('touchmove', function(e) {
            if (isDragging && windowElement.style.display === 'block') {
                const touch = e.touches[0];
                currentX = touch.clientX - initialX;
                currentY = touch.clientY - initialY;
                windowElement.style.left = currentX + 'px';
                windowElement.style.top = currentY + 'px';
                windowElement.style.position = 'fixed';
            }
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            isDragging = false;
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

// Close the new-single splash modal
function closeSplash() {
    const overlay = document.getElementById('splashOverlay');
    if (overlay) {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            // Now show the main window
            showMainWindow();
        }, 300);
    }
}

function showMainWindow() {
    const mainWindow = document.getElementById('mainWindow');
    mainWindow.style.display = 'block';

    if (!activeWindows.find(w => w.id === 'main')) {
        activeWindows.push({
            id: 'main',
            element: mainWindow,
            title: 'DISENFUTURED',
            minimized: false
        });
    }

    focusWindow(mainWindow, 'main');
    updateTaskbar();
}

// Startup sequence simulation
function playStartupSequence() {
    const desktop = document.querySelector('.desktop');
    
    try {
        desktop.style.opacity = '0';
        
        // Fade in desktop
        setTimeout(() => {
            desktop.style.transition = 'opacity 1s ease-in';
            desktop.style.opacity = '1';
            playSound('startup');
        }, 100);
        
        // If splash is visible, don't auto-show main window — wait for splash close
        const splash = document.getElementById('splashOverlay');
        if (splash && getComputedStyle(splash).display !== 'none') {
            // Main window will be shown when splash is dismissed
            return;
        }

        // No splash — show main window after startup
        setTimeout(() => {
            showMainWindow();
        }, 1500);
    } catch (e) {
        // If anything fails, make sure the site is still usable
        desktop.style.opacity = '1';
        showMainWindow();
    }
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
        showError('Merch store coming soon! <a href="https://instagram.com/disenfutured" target="_blank" style="color:blue;text-decoration:underline;">DM us on Instagram</a> for now!');
    }
    
    if (e.target.textContent === 'TICKETS' || e.target.textContent === 'INFO' || e.target.textContent === 'DETAILS') {
        showError('Check our <a href="https://instagram.com/disenfutured" target="_blank" style="color:blue;text-decoration:underline;">Instagram @disenfutured</a> for show updates!');
    }
    
    if (e.target.textContent === 'SEND MESSAGE' || e.target.textContent === 'ORDER FORM') {
        showError('Email us at booking@disenfutured.com or <a href="https://instagram.com/disenfutured" target="_blank" style="color:blue;text-decoration:underline;">DM on Instagram!</a>');
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
    
    const folders = {
        cDrive: `
            <div><button class="retro-button small" onclick="openComputer()">← Back</button> <span>C:\\</span></div>
            <div class="file-item folder" onclick="openFolder('program_files')">
                <div class="file-icon folder"></div>
                <span>Program Files</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item folder" onclick="openFolder('windows')">
                <div class="file-icon folder"></div>
                <span>WINDOWS</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item folder" onclick="openFolder('users')">
                <div class="file-icon folder"></div>
                <span>Users</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item file">
                <div class="file-icon system"></div>
                <span>AUTOEXEC.BAT</span>
                <span class="file-size">1 KB</span>
            </div>
            <div class="file-item file">
                <div class="file-icon system"></div>
                <span>CONFIG.SYS</span>
                <span class="file-size">1 KB</span>
            </div>
            <div class="file-item file">
                <div class="file-icon document"></div>
                <span>BOOT.INI</span>
                <span class="file-size">1 KB</span>
            </div>
        `,
        program_files: `
            <div><button class="retro-button small" onclick="openFolder('cDrive')">← Back</button> <span>C:\\Program Files</span></div>
            <div class="file-item folder">
                <div class="file-icon folder"></div>
                <span>Internet Explorer</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item folder">
                <div class="file-icon folder"></div>
                <span>Windows Media Player</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item folder">
                <div class="file-icon folder"></div>
                <span>Accessories</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item folder">
                <div class="file-icon folder"></div>
                <span>WinRAR</span>
                <span class="file-size"></span>
            </div>
        `,
        windows: `
            <div><button class="retro-button small" onclick="openFolder('cDrive')">← Back</button> <span>C:\\WINDOWS</span></div>
            <div class="file-item folder">
                <div class="file-icon folder"></div>
                <span>System</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item folder">
                <div class="file-icon folder"></div>
                <span>System32</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item folder">
                <div class="file-icon folder"></div>
                <span>Fonts</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item folder">
                <div class="file-icon folder"></div>
                <span>Temp</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item file">
                <div class="file-icon system"></div>
                <span>explorer.exe</span>
                <span class="file-size">593 KB</span>
            </div>
            <div class="file-item file">
                <div class="file-icon system"></div>
                <span>notepad.exe</span>
                <span class="file-size">52 KB</span>
            </div>
        `,
        users: `
            <div><button class="retro-button small" onclick="openFolder('cDrive')">← Back</button> <span>C:\\Users</span></div>
            <div class="file-item folder" onclick="openFolder('user_home')">
                <div class="file-icon folder"></div>
                <span>disenfutured</span>
                <span class="file-size"></span>
            </div>
        `,
        user_home: `
            <div><button class="retro-button small" onclick="openFolder('users')">← Back</button> <span>C:\\Users\\disenfutured</span></div>
            <div class="file-item folder">
                <div class="file-icon folder"></div>
                <span>Desktop</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item folder">
                <div class="file-icon folder"></div>
                <span>Documents</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item folder" onclick="openFolder('downloads')">
                <div class="file-icon folder"></div>
                <span>Downloads</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item folder">
                <div class="file-icon folder"></div>
                <span>My Music</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item folder">
                <div class="file-icon folder"></div>
                <span>My Pictures</span>
                <span class="file-size"></span>
            </div>
            <div class="file-item file">
                <div class="file-icon document"></div>
                <span>README.TXT</span>
                <span class="file-size">2 KB</span>
            </div>
        `,
        downloads: `
            <div><button class="retro-button small" onclick="openFolder('user_home')">← Back</button> <span>C:\\Users\\disenfutured\\Downloads</span></div>
            <div class="file-item file" onclick="openImageViewer()">
                <div class="file-icon document"></div>
                <span>the big man.jpg</span>
                <span class="file-size">1.3 MB</span>
            </div>
        `,
        dDrive: `
            <div><button class="retro-button small" onclick="openComputer()">← Back</button> <span>D:\\</span></div>
            <p style="padding: 8px; color: #808080; font-style: italic;">Drive is empty. Please insert a disc.</p>
        `,
        music: `
            <div><button class="retro-button small" onclick="openComputer()">← Back</button> <span>DISENFUTURED Collection</span></div>
            <div class="file-item file">
                <div class="file-icon music"></div>
                <span>Suit.mp3</span>
                <span class="file-size">4.2 MB</span>
            </div>
            <div class="file-item file">
                <div class="file-icon music"></div>
                <span>Rigged (Demo).mp3</span>
                <span class="file-size">3.8 MB</span>
            </div>
        `
    };

    fileSystem.innerHTML = folders[folderId] || `
        <div><button class="retro-button small" onclick="openComputer()">← Back</button></div>
        <p style="padding: 8px; color: #808080;">This folder is empty.</p>
    `;
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

function browserBack() {
    // No-op in embedded mode
}

function browserForward() {
    // No-op in embedded mode
}

function browserRefresh() {
    const iframe = document.getElementById('browserIframe');
    if (iframe) {
        iframe.src = iframe.src;
    }
}

function browserHome() {
    const iframe = document.getElementById('browserIframe');
    if (iframe) {
        iframe.src = 'tetris.html';
    }
}

function openImageViewer() {
    const viewer = document.getElementById('imageViewerWindow');
    if (!viewer) return;
    viewer.style.display = 'block';
    zIndexCounter++;
    viewer.style.zIndex = zIndexCounter;

    if (!activeWindows.find(w => w.id === 'imageViewer')) {
        activeWindows.push({
            id: 'imageViewer',
            element: viewer,
            title: 'the big man.jpg',
            minimized: false
        });
        updateTaskbar();
    }
}

// Map new window IDs to existing openWindow function
const originalOpenWindow = window.openWindow || openWindow;
window.openWindow = function(windowId) {
    // Special cases: run extra logic, but always pass base ID to originalOpenWindow
    if (windowId === 'computer') {
        openComputer(); // Reset to main view
    }
    // Always call originalOpenWindow with the base windowId
    return originalOpenWindow(windowId);
};
