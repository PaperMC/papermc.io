var consentRevoked = false, hasLoaded = false;
Element.prototype.goTo = function() {
  window.scroll({ 
    top: this.offsetTop - (document.innerWidth > 601 ? 64 : 56),
    left: 0,
    behavior: 'smooth'
  });
}

document.addEventListener('DOMContentLoaded', function() {
  sidenav = M.Sidenav.init(document.querySelectorAll('.sidenav'), {});
  
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

  const triggers = document.getElementsByClassName("dropdown-trigger");
  for (var i = 0; i < triggers.length; i++) {
    const trigger = triggers.item(i);
    if (trigger != null) {
        M.Dropdown.init(trigger, {
            alignment: 'right',
            coverTrigger: false,
            hover: true,
            onOpenStart: function() {
                trigger.classList.add("dropdown-active");
            },
            onCloseStart: function() {
                trigger.classList.remove("dropdown-active");
            }
        });
    }
  }
});