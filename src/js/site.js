let hasLoaded = false;
window.dataLayer = window.dataLayer || [];
function gtag(){
    if (!hasLoaded || !consentRevoked) {
        dataLayer.push(arguments);
    }
}

gtag('js', new Date());
gtag('config', 'UA-126555192-1');


function checkConsent(consent) {
    consentRevoked = !consent;
    if (consent && !hasLoaded) {
        const gtmJS = document.createElement('script');
        gtmJS.setAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=UA-126555192-1');
        document.head.appendChild(gtmJS);
        hasLoaded = true;
    }
}

cookieconsent.initialise({
    container: document.body.getElementsByTagName("main")[0],
    "palette": {
        "popup": {
            "background": "#252e39"
        },
        "button": {
            "background": "#14a7d0"
        }
    },
    "theme": "edgeless",
    "type": "opt-in",
    "content": {
        "message": "PaperMC uses cookies to help analyze how many people use our software.",
        "allow": "Allow"
    },
    revokable: true,
    onStatusChange(status) {
        checkConsent(this.hasConsented());
    },
    onInitialise(status) {
        checkConsent(this.hasConsented());
    },
    onNoCookieLaw() {
        checkConsent(true);
    },
    law: {
        regionalLaw: true,
    },
    location: true
});
