/**
 * Delays the loading of third-party scripts until the first user interaction.
 * This helps prioritize critical content and improves initial page load performance.
 */
const loadThirdPartyScripts = () => {
    console.log("User interaction detected, loading third-party scripts.");
    
    // Load Google Tag Manager
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-TGW0QRR2X6';
    document.head.appendChild(gtmScript);

    const gtagScript = document.createElement('script');
    gtagScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-TGW0QRR2X6');
    `;
    document.head.appendChild(gtagScript);

    // TODO: Add logic for Facebook Pixel if needed.

    // Remove the event listeners after they've fired once.
    ['scroll', 'mousemove', 'touchstart'].forEach(event => {
        window.removeEventListener(event, loadThirdPartyScripts);
    });
};

// Add event listeners to trigger the script loading on user interaction.
['scroll', 'mousemove', 'touchstart'].forEach(event => {
    window.addEventListener(event, loadThirdPartyScripts, { once: true, passive: true });
}); 