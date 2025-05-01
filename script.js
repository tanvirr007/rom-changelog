/*
-----------------------------------------------------------
 JavaScript for Build Changelogs Site (External script.js)
 Includes:
 - Sidebar Toggle (Global for onclick, finds button internally)
 - DOMContentLoaded setup
 - Author/Credit Console Logs
 - Click Outside / Escape Key to Close Sidebar (Manual close)
 - Sidebar Link Click/Scrolling Handler (Manual close)
 - Dynamic Header Title on Scroll (All Devices - Revised)
 - Custom Cursor and Trail Effect (Desktop/Fine Pointer Only)
 - ROM Card Share Functionality (Mobile Share / Desktop Copy) with Specific Message Format (Handles 'by' in JS)
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
// Helper Function to Show Toast Notification (For Desktop Copy)
// ===================================
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) {
        // console.warn("Toast notification element not found. Falling back to alert.");
        // alert(message); // Fallback to alert if toast div is missing - Re-evaluate if alert is desired
        return; // Silently fail if toast element doesn't exist
    }
    toast.textContent = message;
    toast.classList.add('show');
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


// ===================================
// Share Icon Click Handler (Revised Logic - Cleans Author Name in JS)
// ===================================
// Note: This function is designed to be called by an event listener
// using event delegation on a parent element.
async function handleShareClick(event) {
    // The event delegation listener will ensure event.target is related to the share icon.
    // We use closest('.share-icon') to be safe in case a child element within the span was clicked.
    const shareIcon = event.target.closest('.share-icon');
    if (!shareIcon) {
        // This check is mostly for robustness, delegation should prevent calling if not needed
        return;
    }

    const romId = shareIcon.dataset.romId;
    if (!romId) {
        console.error("Share icon clicked, but data-rom-id attribute is missing on the element or its closest ancestor with class 'share-icon'.");
        showToast('Share data missing!'); // Provide feedback to user
        return;
    }

    // --- Find relevant elements ---
    const romCard = document.getElementById(romId);
    if (!romCard) {
        console.error(`Could not find ROM card with ID: ${romId}`);
        showToast('ROM details not found!'); // Provide feedback to user
        return;
    }
    const romNameElement = romCard.querySelector('.rom-title-share h3');
    const authorElement = romCard.querySelector('.rom-author'); // Find author element
    // Find the closest ancestor with class 'device-section'
    const deviceSection = romCard.closest('.device-section');
    const deviceNameElement = deviceSection ? deviceSection.querySelector('h2') : null; // Find h2 within that section

    // --- Extract data ---
    const romName = romNameElement ? romNameElement.textContent.trim() : 'Unknown ROM';
    const deviceName = deviceNameElement ? deviceNameElement.textContent.trim() : 'Unknown Device';
    let authorName = authorElement ? authorElement.textContent.trim() : 'Unknown Author'; // Extract raw author text

    // *** NEW: Clean the extracted author name to remove potential leading "by " ***
    // This handles variations like "by Author Name", "By Author Name", "BY Author Name"
    let cleanedAuthorName = authorName;
    if (authorName && typeof authorName === 'string') { // Ensure authorName is a non-empty string
         const lowerAuthor = authorName.toLowerCase();
         if (lowerAuthor.startsWith('by ')) {
             // Remove the first 3 characters ("by ")
             cleanedAuthorName = authorName.substring(3).trim();
         } else {
             cleanedAuthorName = authorName.trim(); // Just trim if it doesn't start with "by "
         }
    }
     // If after trimming/cleaning, the name is empty, revert to 'Unknown Author'
     if (!cleanedAuthorName) {
          cleanedAuthorName = 'Unknown Author';
     }
    // *** End of cleaning logic ***


    // --- Construct URL and Share Text ---
    // Ensure the URL includes the hash for direct linking to the ROM card
    const shareUrl = `${window.location.origin}${window.location.pathname}#${romId}`;
    const shareTitle = `Build Changelogs: ${deviceName}`; // Title for Web Share API
    // *** Construct the share text format using the CLEANED author name ***
    // This format is designed to be descriptive for sharing.
    const shareText = `Build Changelog of ${romName} for ${deviceName} by ${cleanedAuthorName}`;


    // --- Check for Web Share API support ---
    if (navigator.share) {
        // --- Use Web Share API (Mobile/Supported Browsers) ---
        console.log("Web Share API detected. Attempting to share...");
        try {
            // The `text` property is often preferred as it's widely supported
            // and can include the URL within the message body.
            await navigator.share({
                title: shareTitle,
                text: `${shareText}\n\nRead more: ${shareUrl}`, // Combine text and URL with a separator
                // url: shareUrl, // Can also provide separately, but including in text is reliable
            });
            console.log('Content shared successfully via Web Share API');
            // No toast needed for successful Web Share, native UI handles feedback
        } catch (err) {
            if (err.name !== 'AbortError') {
                 console.error('Error sharing via Web Share API:', err);
                 showToast('Failed to share.'); // Provide feedback for actual errors
            } else {
                 console.log('Share action cancelled by user.');
                 // No toast needed for user cancellation
            }
        }
    } else {
        // --- Fallback to Clipboard (Desktop/Unsupported Browsers) ---
        console.log("Web Share API not detected. Falling back to clipboard copy.");
        // Combine text and URL for clipboard copy
        const textToCopy = `${shareText}\n\nRead more: ${shareUrl}`;
        try {
            await navigator.clipboard.writeText(textToCopy);
            console.log('Content copied to clipboard:', textToCopy);
            showToast('Share message copied to clipboard!'); // Success feedback
        } catch (err) {
            console.error('Failed to copy content to clipboard:', err);
            showToast('Failed to copy message to clipboard.'); // Failure feedback
        }
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
    const mainContentArea = document.querySelector('main'); // Needed for event delegation (e.g., share clicks)

    // --- Basic Safety Checks ---
    if (!sidebar) {
        console.error("Sidebar element (#sidebar) not found. Sidebar features disabled.");
    }
    if (!menuButton) {
        console.warn("Menu button element (.menu-icon) not found. ARIA updates might fail.");
    }
    if (!mainContentArea) {
         console.error("Main content area element ('main') not found. Share functionality and potentially other delegation disabled.");
         // Share functionality won't work without mainContentArea for delegation
    } else {
         // ===================================
         // Event Delegation for Share Icons
         // Attaches ONE listener to the main content area
         // This listener checks if a clicked element is or is inside a .share-icon
         // ===================================
         mainContentArea.addEventListener('click', handleShareClick);
         console.log("Event listener for share icons attached to main content area.");
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
                    // Use querySelector for robustness, handles valid CSS selectors
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        // Close sidebar after clicking a link
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
            // Check if sidebar is active, click was outside sidebar, and click was not on the menu button
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
    // Dynamic Header Title Logic (Revised Approach)
    // ===================================
    let dynamicHeaderEnabled = true;
    if (!header || !headerName || deviceSections.length === 0) {
        console.warn("Dynamic Header Title: Required elements not all found (header, .header-name, or .device-section). Feature disabled.");
        dynamicHeaderEnabled = false;
    }
    if (dynamicHeaderEnabled) {
        // Store the original header text content
        const originalHeaderText = headerName.textContent.trim();
        let currentActiveTitle = originalHeaderText; // State variable for current title

        // Function to find the title of the device section currently in view
        function findActiveDeviceSectionTitle(headerBottomPosition) {
            let activeTitle = null;
            const scrollY = window.scrollY;

            // Iterate through device sections to find the one whose top is above the header's bottom edge
            // and whose bottom is below the current scroll position.
            for (let i = 0; i < deviceSections.length; i++) {
                const section = deviceSections[i];
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionTitleElement = section.querySelector('h2');

                // Check if the scroll position is within the range of the section,
                // considering the header height as an offset.
                // The headerBottomPosition accounts for the fixed header masking the top of sections.
                if (sectionTitleElement && scrollY >= (sectionTop - headerBottomPosition) && scrollY < (sectionTop + sectionHeight - headerBottomPosition)) {
                    activeTitle = sectionTitleElement.textContent.trim();
                    // Found the first active section, no need to check further
                    break;
                }
            }
            return activeTitle; // Returns the title or null
        }

        // Function to update the header title element
        function updateHeaderTitle(newTitle) {
            // Default to original text if no new title is provided (e.g., scrolled to top)
            const targetTitle = newTitle || originalHeaderText;
            // Only update if the title is actually changing to avoid unnecessary DOM updates
            if (currentActiveTitle !== targetTitle) {
                if (headerName) {
                    // Add a class for potential CSS transitions/animations
                    headerName.classList.add('changing');
                    currentActiveTitle = targetTitle; // Update state
                    // Use a timeout to allow CSS transition to start before changing text
                    setTimeout(() => {
                        if (headerName) {
                            headerName.textContent = targetTitle;
                            headerName.classList.remove('changing');
                        }
                    }, 150); // Match this duration to CSS transition duration for .header-name
                }
            }
        }

        // Scroll event handler
        function handleScroll() {
            if (header) {
                // Get the height of the fixed header to calculate the correct scroll offset
                const headerHeight = header.offsetHeight;
                // Find the title of the currently active section
                const activeTitle = findActiveDeviceSectionTitle(headerHeight);
                // Update the header title
                updateHeaderTitle(activeTitle);
            }
        }

        // Throttle scroll and resize events for performance
        let scrollTimeout;
        const throttledScroll = () => {
            clearTimeout(scrollTimeout);
            // Delay the scroll handling slightly
            scrollTimeout = setTimeout(handleScroll, 50); // Adjust delay as needed
        };

        let resizeTimeout;
        const throttledResize = () => {
            clearTimeout(resizeTimeout);
            // Re-calculate header height and update title after resize ends
            resizeTimeout = setTimeout(handleScroll, 150); // Delay for resize handling
        };

        // Add event listeners
        window.addEventListener('scroll', throttledScroll, { passive: true });
        window.addEventListener('resize', throttledResize);

        // Also call handleScroll once initially to set the correct header text on page load
        handleScroll();
    }


    // ==============================================================
    // Custom Cursor & Trail Logic (Smoother JS Interpolation)
    // ==============================================================

    // Check for fine pointer device (typically desktop/laptop with mouse/trackpad)
    // and if the necessary custom cursor element exists in the HTML.
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (isFinePointer && cursorElement) {
        console.log("Fine pointer detected, initializing smooth custom cursor.");

        // The element to append trail dots to (e.g., the body or a dedicated container)
        const trailContainer = document.body;
        // Number of trail dots (0 for just the main cursor element)
        const numDots = 0;
        const dots = []; // Array to hold trail dot elements
        const positions = []; // Array to hold target positions for interpolation
        // Interpolation factor (lower = smoother/laggy, higher = faster/snappy)
        const lerpFactor = 0.2; // Common value between 0 and 1

        // Add initial position for the main cursor element
        // Start off-screen so it doesn't pop in at (0,0)
        positions.push([-100, -100]);

        // Create trail dot elements and add their initial positions
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('div');
            dot.classList.add('trail-dot'); // CSS class for styling
            trailContainer.appendChild(dot);
            dots.push(dot);
            // Initial position off-screen, same as the cursor
            positions.push([-100, -100]);
        }

        // Variables to store the raw mouse coordinates
        let mouseX = -100;
        let mouseY = -100;
        // Variable to hold the requestAnimationFrame ID
        let animationFrameId = null;

        // Event listener to capture mouse movement coordinates
        // Use passive: true as we're not preventing default behavior
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Make cursor/trail visible on first movement if it was hidden
            if (cursorElement.style.opacity !== '1') {
                cursorElement.style.opacity = '1';
                dots.forEach(dot => dot.style.opacity = '1');
            }
        }, { passive: true });

        // Animation loop using requestAnimationFrame
        function animate() {
            // Basic check for valid coordinates
            if (isNaN(mouseX) || isNaN(mouseY)) {
                 console.error("mouseX or mouseY is NaN! Cannot animate cursor.");
                 // Still request next frame, hoping values become valid
                 animationFrameId = requestAnimationFrame(animate);
                 return;
            }

            // Interpolate the main cursor element's position towards the mouse position
            // positions[0] is the target for the main cursor
            positions[0][0] += (mouseX - positions[0][0]) * lerpFactor;
            positions[0][1] += (mouseY - positions[0][1]) * lerpFactor;

            // Apply the interpolated position using translate
            // Use toFixed(2) to limit decimal places for transform string
            if (isNaN(positions[0][0]) || isNaN(positions[0][1])) {
                 console.error(`CURSOR POS CALCULATION resulted in NaN! Input: (${mouseX}, ${mouseY}), Factor: ${lerpFactor}`);
                 // Do not update transform if calculation failed
            } else {
                 cursorElement.style.transform = `translate(${positions[0][0].toFixed(2)}px, ${positions[0][1].toFixed(2)}px)`;
            }


            // Interpolate positions for trail dots, each following the one before it
            for (let i = 1; i <= numDots; i++) {
                 const currentDot = dots[i-1]; // dots array is 0-indexed, positions array includes cursor at index 0
                 const followX = positions[i-1][0]; // The position this dot is following
                 const followY = positions[i-1][1];

                 if (isNaN(followX) || isNaN(followY)) {
                     console.error(`Follow position for DOT ${i-1} is NaN! Skipping update for this dot.`);
                     continue; // Skip update for this specific dot if follow position is bad
                 }

                 positions[i][0] += (followX - positions[i][0]) * lerpFactor;
                 positions[i][1] += (followY - positions[i][1]) * lerpFactor;

                 // Apply the interpolated position to the dot element
                 if (isNaN(positions[i][0]) || isNaN(positions[i][1])) {
                     console.error(`DOT ${i-1} POS CALCULATION resulted in NaN! Input: (${followX.toFixed(2)}, ${followY.toFixed(2)}), Factor: ${lerpFactor}`);
                     // Do not update transform if calculation failed
                 } else {
                      currentDot.style.transform = `translate(${positions[i][0].toFixed(2)}px, ${positions[i][1].toFixed(2)}px)`;
                 }
            }

            // Request the next frame
            animationFrameId = requestAnimationFrame(animate);
        }

        // Hide cursor and trail when mouse leaves the document body
        document.addEventListener('mouseleave', () => {
            if(cursorElement) cursorElement.style.opacity = '0';
            dots.forEach(dot => dot.style.opacity = '0');
            // Optional: Reset positions off-screen immediately or let them trail off
            // positions.forEach(pos => { pos[0] = -100; pos[1] = -100; });
        });

        // Show cursor and trail when mouse enters the document body,
        // but only if the mouse position seems valid (not at the default -100,-100)
        document.addEventListener('mouseenter', () => {
             // Check if mouse has moved from the initial off-screen position
             if (mouseX > -99 && mouseY > -99) { // Use > -99 to account for potential float inaccuracies
                 if(cursorElement) cursorElement.style.opacity = '1';
                 dots.forEach(dot => dot.style.opacity = '1');
             }
        });

        // Start the animation loop
        animate();

    } else if (!cursorElement && isFinePointer) {
          console.warn("Custom cursor element (#custom-cursor) not found in HTML. Custom cursor disabled.");
    } else {
          console.log("Coarse pointer detected (likely touch device) or custom cursor element missing. Custom cursor disabled.");
          // Ensure the system cursor is visible on coarse pointers
          document.body.style.cursor = 'auto';
    }
    // ==============================================================
    // <<< END: Custom Cursor & Trail Logic >>>
    // ==============================================================


    // ===================================
    // Final Log
    // ===================================
    console.log("Build Changelogs site scripts initialized successfully from script.js.");

}); // End of DOMContentLoaded listener