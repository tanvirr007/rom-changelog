/*
-----------------------------------------------------------
 JavaScript for Build Changelogs Site (External script.js)
 Includes:
 - Sidebar Toggle (Global for onclick, finds button internally)
 - DOMContentLoaded setup
 - Author/Credit Console Logs
 - Click Outside / Escape Key to Close Sidebar (Manual close)
 - Sidebar Link Click/Scrolling Handler (Manual close)
 - Dynamic Header Title on Scroll (All Devices)
 - Custom Cursor and Trail Effect (Desktop/Fine Pointer Only) << UPDATED
-----------------------------------------------------------
*/

// Use strict mode for potentially better error handling and performance
'use strict';

// ===================================
// Global Scope Function for HTML onclick="toggleSidebar()"
// ===================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.querySelector('.menu-icon');

    if (!sidebar) {
        console.error("Sidebar element not found in toggleSidebar.");
        return;
    }
    const isActive = sidebar.classList.toggle('active');
    if (menuButton) {
         menuButton.setAttribute('aria-expanded', isActive);
    }
}

// ===================================
// DOMContentLoaded Event Listener
// ===================================
document.addEventListener('DOMContentLoaded', function() {

    // --- Select elements needed within DOMContentLoaded ---
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.querySelector('.menu-icon');
    const sidebarLinks = document.querySelectorAll('.sidebar .roms-list a');
    const header = document.querySelector('header');
    const headerName = document.querySelector('.header-name');
    const deviceSections = document.querySelectorAll('.device-section');
    const cursorElement = document.getElementById('custom-cursor'); // For custom cursor

    // --- Basic Safety Checks ---
    if (!sidebar) {
        console.error("Sidebar element not found. Sidebar features disabled.");
    }
    if (!menuButton) {
        console.warn("Menu button element not found. ARIA updates in non-toggle closures might fail.");
    }

    // ===================================
    // Author/Credit Console Logs (Unchanged)
    // ===================================
    console.log(
        "%cAuthor: SHITIJ HALDER | Telegram: @shitijnotop",
        "color: cyan; background-color: #333; padding: 3px 8px; border-radius: 3px; font-weight: bold;"
    );
    console.log(
        "%cThis website is designed by Shitij Halder (GitHub: https://github.com/SHITIJHALDER), any modifications in the existing code is strictly not allowed. All the code authority is hereby limited to the author and the designer of the website only. Failing to follow these may result in legal charges.",
        "color: black; background-color: yellow; padding: 5px 10px; border: 1px solid black; font-weight: bold; display: block; text-align: center;"
    );

    // ===================================
    // Sidebar Link Scrolling Logic (Unchanged)
    // ===================================
    if (sidebar && sidebarLinks.length > 0) {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const targetId = this.getAttribute('href');
                if (!targetId || !targetId.startsWith('#') || targetId.length === 1) {
                    console.warn(`Invalid href attribute for sidebar link: ${targetId}`); return;
                }
                try {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        if (sidebar.classList.contains('active')) {
                            sidebar.classList.remove('active');
                            if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
                        }
                    } else {
                        console.warn(`Target element not found for selector: ${targetId}`);
                    }
                } catch (e) {
                    console.error(`Error finding or scrolling to element with selector: ${targetId}`, e);
                }
            });
        });
    }

    // ===================================
    // Click Outside & Escape Key Listeners (Unchanged)
    // ===================================
    if (sidebar) {
        document.addEventListener('click', function(event) {
            if (sidebar.classList.contains('active') && event.target && !sidebar.contains(event.target) && (!menuButton || !menuButton.contains(event.target))) {
                sidebar.classList.remove('active');
                if(menuButton) menuButton.setAttribute('aria-expanded', 'false');
            }
        });
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                if(menuButton) menuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ===================================
    // Dynamic Header Title Logic (Unchanged)
    // ===================================
    let dynamicHeaderEnabled = true;
    if (!header || !headerName || deviceSections.length === 0) {
        console.warn("Dynamic Header Title: Required elements not all found. Feature disabled.");
        dynamicHeaderEnabled = false;
    }
    if (dynamicHeaderEnabled) {
        const originalHeaderText = headerName.textContent.trim();
        let currentActiveTitle = headerName.textContent.trim();
        function findActiveDeviceSectionTitle(headerBottomPosition) { /* ... implementation ... */
            let activeTitle = null; const scrollY = window.scrollY;
            for (let i = deviceSections.length - 1; i >= 0; i--) {
                const section = deviceSections[i]; const sectionTop = section.offsetTop;
                const sectionTitleElement = section.querySelector('h2');
                if (sectionTitleElement && scrollY >= (sectionTop - headerBottomPosition - 10)) {
                    activeTitle = sectionTitleElement.textContent.trim(); break;
                }
            } return activeTitle;
        }
        function updateHeaderTitle(newTitle) { /* ... implementation ... */
             const targetTitle = newTitle || originalHeaderText;
            if (currentActiveTitle !== targetTitle) {
                if(headerName){
                    headerName.classList.add('changing'); currentActiveTitle = targetTitle;
                    setTimeout(() => { if(headerName) { headerName.textContent = targetTitle; headerName.classList.remove('changing');}}, 150);
                }
            }
        }
        let scrollTimeout; function handleScroll() { /* ... implementation ... */
             clearTimeout(scrollTimeout); scrollTimeout = setTimeout(() => { if(header) { const headerHeight = header.offsetHeight; const activeTitle = findActiveDeviceSectionTitle(headerHeight); updateHeaderTitle(activeTitle);}}, 50);
        }
        let resizeTimeout; function handleResize() { /* ... implementation ... */
             clearTimeout(resizeTimeout); resizeTimeout = setTimeout(handleScroll, 150);
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);
        handleScroll(); // Initial check
    }


    // ==============================================================
    // <<< START: Custom Cursor & Trail Logic (Smoother JS Interpolation) >>>
    // ==============================================================

    // Check if the primary input method is 'fine' (like a mouse)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    // OR Keep the check bypassed if needed for your testing device:
    // const isFinePointer = true; // Force true if needed

    // Use the cursorElement declared at the top of DOMContentLoaded
    if (isFinePointer && cursorElement) {
        console.log("Fine pointer detected, initializing smooth custom cursor.");
        // document.body.classList.add('custom-cursor-enabled'); // Add if using class-based cursor:none

        const trailContainer = document.body;
        // --- REDUCE NUMBER OF DOTS HERE ---
        const numDots = 0; // <<<<------ CHANGED FROM 12
        const dots = [];    // Holds the dot elements
        const positions = []; // Holds current [x, y] for cursor + each dot

        // --- Easing Factor ---
        const lerpFactor = 0.2;

        // --- Create Trail Dots & Initialize Positions ---
        positions.push([-100, -100]); // Start cursor off-screen

        for (let i = 0; i < numDots; i++) { // Loop uses the new numDots value
            const dot = document.createElement('div');
            dot.classList.add('trail-dot');
            trailContainer.appendChild(dot);
            dots.push(dot);
            positions.push([-100, -100]); // Start dots off-screen
        }

        let mouseX = -100; // Target X
        let mouseY = -100; // Target Y
        let animationFrameId = null;

        // --- Update Target Mouse Position ---
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (cursorElement.style.opacity !== '1') {
                cursorElement.style.opacity = '1';
                dots.forEach(dot => dot.style.opacity = '1');
            }
        }, { passive: true });

        function animate() {
            // Check for NaN - VERY IMPORTANT before calculations
            if (isNaN(mouseX) || isNaN(mouseY)) {
                 console.error("mouseX or mouseY is NaN! Cannot animate.");
                 animationFrameId = requestAnimationFrame(animate); // Still request next frame
                 return; // Skip this frame's calculations
            }

            // Interpolate main cursor position towards mouse position
            positions[0][0] += (mouseX - positions[0][0]) * lerpFactor;
            positions[0][1] += (mouseY - positions[0][1]) * lerpFactor;

            // Check for NaN after calculation
            if (isNaN(positions[0][0]) || isNaN(positions[0][1])) {
                 console.error(`CURSOR POS CALCULATION resulted in NaN! Input: (${mouseX}, ${mouseY}), Factor: ${lerpFactor}`);
            } else {
                 // Apply transform only if numbers are valid
                 cursorElement.style.transform = `translate(${positions[0][0]}px, ${positions[0][1]}px)`;
            }

            // Interpolate each dot towards the position of the element before it
            for (let i = 1; i <= numDots; i++) { // Loop uses the new numDots value
                 const currentDot = dots[i-1];
                 const followX = positions[i-1][0];
                 const followY = positions[i-1][1];

                 // Check for NaN before calculation
                 if (isNaN(followX) || isNaN(followY)) {
                      console.error(`Follow position for DOT ${i-1} is NaN! Skipping update.`);
                      continue; // Skip this dot's update for this frame
                 }

                 positions[i][0] += (followX - positions[i][0]) * lerpFactor;
                 positions[i][1] += (followY - positions[i][1]) * lerpFactor;

                 // Check for NaN after calculation
                 if (isNaN(positions[i][0]) || isNaN(positions[i][1])) {
                      // Corrected console.error line
                      console.error(`DOT ${i-1} POS CALCULATION resulted in NaN! Input: (${followX.toFixed(2)}, ${followY.toFixed(2)}), Factor: ${lerpFactor}`);
                 } else {
                     // Apply transform only if numbers are valid
                     currentDot.style.transform = `translate(${positions[i][0]}px, ${positions[i][1]}px)`;
                 }
            }

            animationFrameId = requestAnimationFrame(animate); // Continue the loop
        }

        // --- Handle Mouse Leaving/Entering Window ---
        document.addEventListener('mouseleave', () => {
            if(cursorElement) cursorElement.style.opacity = '0';
            dots.forEach(dot => dot.style.opacity = '0');
        });
        document.addEventListener('mouseenter', () => {
             if (mouseX > -100) {
                  if(cursorElement) cursorElement.style.opacity = '1';
                  dots.forEach(dot => dot.style.opacity = '1');
             }
        });

        // --- Start the animation ---
        animate();

    } else if (!cursorElement && isFinePointer) {
         console.warn("Custom cursor element (#custom-cursor) not found, custom cursor disabled.");
    } else {
         console.log("Coarse pointer detected or custom cursor element missing, custom cursor disabled.");
    }
    // ==============================================================
    // <<< END: Custom Cursor & Trail Logic >>>
    // ==============================================================


    // ===================================
    // Final Log
    // ===================================
    console.log("Build Changelogs site scripts initialized successfully from script.js.");

}); // End of DOMContentLoaded listener