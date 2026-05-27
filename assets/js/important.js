/* IMPORTANT.JS */
// This file contains drc.js script and notes for developers; please do not unload or not use this script //
/* ---------------------------------------------------------------------------------------------------------------------------------------------- */
/* drc.js */
/*(() => {

    // =========================
    // CONFIG
    // =========================

    const DEVTOOLS_WIDTH_THRESHOLD = 160;
    const DEVTOOLS_HEIGHT_THRESHOLD = 160;

    // Your custom 403 page
    const BLOCK_PAGE = "/403.html";

    // =========================
    // RIGHT CLICK BLOCK
    // =========================

    document.addEventListener("contextmenu", e => {
        e.preventDefault();
        return false;
    });

    // =========================
    // SHORTCUT BLOCKER
    // =========================

    document.addEventListener("keydown", e => {

        const key = e.key.toUpperCase();

        // F12
        if (key === "F12") {
            e.preventDefault();
            e.stopPropagation();
        }

        // CTRL+SHIFT+I/J/C/K
        if (
            e.ctrlKey &&
            e.shiftKey &&
            ["I", "J", "C", "K"].includes(key)
        ) {
            e.preventDefault();
            e.stopPropagation();
        }

        // CTRL+U
        if (e.ctrlKey && key === "U") {
            e.preventDefault();
            e.stopPropagation();
        }

        // CMD+OPTION+I
        if (
            e.metaKey &&
            e.altKey &&
            key === "I"
        ) {
            e.preventDefault();
            e.stopPropagation();
        }

    }, true);

    // =========================
    // WINDOW SIZE DEVTOOLS DETECTOR
    // =========================

    function detectWindowDevtools() {

        const widthDiff =
            window.outerWidth - window.innerWidth;

        const heightDiff =
            window.outerHeight - window.innerHeight;

        return (
            widthDiff > DEVTOOLS_WIDTH_THRESHOLD ||
            heightDiff > DEVTOOLS_HEIGHT_THRESHOLD
        );
    }

    // =========================
    // DEBUGGER TIMING DETECTOR
    // =========================

    function detectDebugger() {

        const start = performance.now();

        debugger;

        const end = performance.now();

        return (end - start) > 100;
    }

    // =========================
    // CONSOLE DETECTOR
    // =========================

    let detected = false;

    const bait = new Image();

    Object.defineProperty(bait, "id", {
        get() {

            detected = true;

            activateDefense();

            return "devtools";
        }
    });

    setInterval(() => {
        console.log(bait);
        console.clear();
    }, 1000);

    // =========================
    // BOT / HEADLESS DETECTOR
    // =========================

    function detectBot() {

        if (navigator.webdriver) return true;

        if (!window.chrome) return true;

        if (navigator.plugins.length === 0) return true;

        const ua = navigator.userAgent.toLowerCase();

        const blocked = [
            "headless",
            "bot",
            "crawl",
            "spider",
            "selenium",
            "puppeteer",
            "playwright"
        ];

        return blocked.some(x => ua.includes(x));
    }

    // =========================
    // DEFENSE ACTIVATION
    // =========================

    function activateDefense() {

        if (window.__BLOCKED__) return;

        window.__BLOCKED__ = true;

        // Optional visual flash before redirect
        document.documentElement.innerHTML = `
            <style>
                body {
                    margin:0;
                    background:black;
                    color:red;
                    font-family:monospace;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    height:100vh;
                    font-size:50px;
                }
            </style>

            <body>
                403 FORBIDDEN
            </body>
        `;

        // tiny delay so they see it
        setTimeout(() => {
            window.location.replace(BLOCK_PAGE);
        }, 800);
    }

    // =========================
    // MAIN DETECTION LOOP
    // =========================

    setInterval(() => {

        if (detectWindowDevtools()) {
            activateDefense();
        }

        if (detectDebugger()) {
            activateDefense();
        }

        if (detectBot()) {
            activateDefense();
        }

    }, 500);

    // =========================
    // DISABLE TEXT SELECTION
    // =========================

    document.addEventListener("selectstart", e => {
        e.preventDefault();
    });

    // =========================
    // DISABLE DRAGGING
    // =========================

    document.addEventListener("dragstart", e => {
        e.preventDefault();
    });

})();
*/
/* END OF drc.js */
/* DEV NOTES dev.js */
console.log("version 1.0.0.0 [beta]")
console.warn("Depreciated/errored file assets/js/*.js")
/* END OF dev.js */
/* END OF FILE */
