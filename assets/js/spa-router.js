/**
 * MxM Website - Robust Single-Page Application Router
 * Correctly manages script and style lifecycles to prevent conflicts during navigation.
 */
function spaRouter() {
    const pageContainer = document.body.appendChild(document.createElement('div'));
    pageContainer.id = 'page-content-container';

    const roomsContainer = document.querySelector('.container');
    const persistentScripts = new Set();
    const homepageScripts = [];

    // Identify persistent and homepage-specific scripts from the initial page load
    document.querySelectorAll('script[src]').forEach(s => {
        const url = new URL(s.src, document.baseURI).href;
        if (url.includes('audio.js') || url.includes('spa-router.js')) {
            persistentScripts.add(url);
        } else if (url.includes('navigation.js') || url.includes('quantum-effects.js')) {
            homepageScripts.push(url);
        }
    });

    const loadedStyles = new Set();
    document.querySelectorAll('link[rel="stylesheet"]').forEach(sheet => {
        loadedStyles.add(sheet.href);
    });

    // --- Core Functions ---

    function cleanupPageSpecificElements() {
        document.querySelectorAll('[data-page-specific="true"]').forEach(el => el.remove());
    }

    async function loadPage(pageUrl) {
        cleanupPageSpecificElements();

        try {
            const response = await fetch(pageUrl);
            if (!response.ok) throw new Error(`Fetch failed for ${pageUrl}`);
            
            const html = await response.text();
            const pageBaseUrl = new URL(pageUrl, window.location.origin);
            const doc = new DOMParser().parseFromString(html, 'text/html');

            // Add new page-specific stylesheets
            doc.querySelectorAll('link[rel="stylesheet"]').forEach(sheet => {
                const absoluteUrl = new URL(sheet.getAttribute('href'), pageBaseUrl.href).href;
                if (!loadedStyles.has(absoluteUrl)) {
                    const newSheet = document.createElement('link');
                    newSheet.rel = 'stylesheet';
                    newSheet.href = absoluteUrl;
                    newSheet.dataset.pageSpecific = 'true';
                    document.head.appendChild(newSheet);
                }
            });

            // Inject body content
            const bodyContent = doc.body;
            bodyContent.querySelector('.music-player')?.remove();
            roomsContainer.style.display = 'none';
            pageContainer.innerHTML = bodyContent.innerHTML;
            pageContainer.style.display = 'block';

            // Load and execute new page-specific scripts
            for (const script of doc.querySelectorAll('script')) {
                const absoluteSrc = script.src ? new URL(script.src, pageBaseUrl.href).href : null;
                if (absoluteSrc && persistentScripts.has(absoluteSrc)) continue;

                const newScript = document.createElement('script');
                newScript.dataset.pageSpecific = 'true';
                if (absoluteSrc) {
                    newScript.src = absoluteSrc;
                    newScript.async = false; // Ensure scripts execute in order
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
            }
            
            window.scrollTo(0, 0);
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';

        } catch (error) {
            console.error('SPA Router Error:', error);
            // Fallback to traditional navigation if SPA fails
            // window.location.href = pageUrl; 
        }
    }

    function showHomePage() {
        cleanupPageSpecificElements();
        pageContainer.style.display = 'none';
        pageContainer.innerHTML = '';
        roomsContainer.style.display = 'block';
        history.pushState({ page: '/' }, '', '/');
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        // Re-initialize homepage scripts
        homepageScripts.forEach(src => {
            const newScript = document.createElement('script');
            newScript.src = src;
            newScript.dataset.pageSpecific = 'true';
            document.body.appendChild(newScript);
        });
    }

    // --- Event Listeners ---

    document.body.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link || link.target === '_blank' || link.href.startsWith('javascript:')) return;

        const linkUrl = new URL(link.href);
        if (linkUrl.origin !== window.location.origin) return;

        e.preventDefault();
        const targetPath = linkUrl.pathname;
        if (window.location.pathname === targetPath && linkUrl.hash === window.location.hash) return;

        if (targetPath === '/' || targetPath.endsWith('index.html')) {
            showHomePage();
        } else {
            history.pushState({ page: targetPath }, '', targetPath);
            loadPage(targetPath);
        }
    });

    window.addEventListener('popstate', e => {
        const targetPath = e.state?.page || '/';
        if (window.location.pathname === targetPath) return;

        if (targetPath === '/' || targetPath.endsWith('index.html')) {
            showHomePage();
        } else {
            loadPage(targetPath);
        }
    });

    // --- Initial Load ---
    const initialPath = window.location.pathname;
    if (initialPath && initialPath !== '/' && !initialPath.endsWith('index.html')) {
        loadPage(initialPath);
    } else {
        showHomePage();
    }
}

document.addEventListener('DOMContentLoaded', spaRouter); 