var documentationFileToTitle = {}, documentation =
{
  "PaperMC Documentation": {
    "file": "index.html"
  },
  "Running A Server": {
    "file": "server/index.html",
    "Getting Started": {
      "file": "server/getting-started.html"
    },
    "Configuration": {
      "file": "server/configuration.html"
    },
  },
  "Contributing": {
    "file": "contributing/index.html"
  },
  "About the PaperMC Project": {
    "file": "about/index.html",
    "Introduction": {
      "file": "about/introduction.html"
    },
    "Frequently Asked Questions": {
      "file": "about/faq.html"
    },
    "The Structure of PaperMC": {
      "file": "about/structure.html"
    },
    "Art Assets": {
      "file": "about/assets.html"
    },
    "Contact Us": {
      "file": "about/contact.html"
    },
  }
};

function addSection(section) {
  let html = "";
  for (const subsection in section) {
    const length = Object.keys(section[subsection]).length;
    if (length == 0 || subsection == "file")
      continue;
    
    documentationFileToTitle[section[subsection].file] = subsection;
    
    // Page
    if (length == 1) {
      html += '<li><a href="#' + subsection.replace(/ /g, '_') + '" data-file="' + section[subsection].file + '">' + subsection + '</a></li>';
      
      continue;
    }
    
    // Category
    let sectionsHTML = addSection(section[subsection]);
    html += `
      <li>
        <ul class="collapsible collapsible-accordion">
          <li>
            <a class="collapsible-header" href="#${subsection.replace(/ /g, '_')}" data-file="${section[subsection].file}">${subsection}</a>
            <div class="collapsible-body">
              <ul>
                ${sectionsHTML}
              </ul>
            </div>
          </li>
        </ul>
      </li>
    `;
  }
  
  return html;
}

function loadDocumentation(file) {
  container = document.querySelector("#content>.container");
  
  // Loader
  container.innerHTML = '<div class="progress"><div class="indeterminate"></div></div>';
  
  // Load
  window.fetch("/documentation/sphinx/" + file).then(function(response) {
    if (response.status !== 200) {
      container.innerText = "Something went wrong, how embarrassing.";
      
      return;
    }
    
    response.text().then(function(text) {
      const xml = text, html = new DOMParser().parseFromString(xml, "text/xml");
      
      // Fix image relativity
      html.querySelectorAll("img[src]:not([src^='http'])").forEach(function(img) {
        src = img.getAttribute("src");
        img.src = "/documentation/sphinx/" + (src.startsWith('../') ? src.substr(3) : src);
      });
      
      // Fix href relativity
      
      html.querySelectorAll("*[href]:not([href^='http'])").forEach(function(el) {
        href = el.getAttribute("href");
        hrefRelative = href.startsWith('../') ? href.substr(3) : href;
        for (let file in documentationFileToTitle) {
          if (file == hrefRelative || file == file.substr(0, file.indexOf("/")) + "/" + hrefRelative) {
            el.href = "#" + documentationFileToTitle[file].replace(/ /g, '_');
            
            break;
          }
        }
      });
      
      // Remove title self anchors
      html.querySelectorAll("a.toc-backref").forEach(function(el) {
        el.removeAttribute("href");
      });
      
      container.innerHTML = html.querySelector(".body[role='main']").innerHTML;
      anchorScrollHandler();
      
      // Active
      document.querySelectorAll("#sidenav li").forEach(function(el) {
        el.classList.remove("active");
        const a = el.querySelector("a");
        if (a == null)
          return;
        
        if (a.getAttribute("data-file") == file) {
          el.classList.add("active");
        }
      });
    });
  });
}

let anchorClickHandler = function(e) {
  if (this.hash.length == 0) {
      window.scroll({ 
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      
      e.preventDefault();
      return;
  }
  
  el = document.getElementById(this.hash.substr(1));
  if (el == null)
    return;

  el.goTo();
  e.preventDefault();
};

document.addEventListener('DOMContentLoaded', function() {
    anchorScrollHandler = function() {
      document.querySelectorAll('a[href*="#"]').forEach(function(el) {
        el.removeEventListener('click', anchorClickHandler);
        el.addEventListener('click', anchorClickHandler);
      });
    }
    
    anchorScrollHandler();
    
    // Documentation Sidenav
    document.getElementById("sidenav").innerHTML += addSection(documentation);
                
    /*document.querySelectorAll('a[data-file]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        file = this.getAttribute("data-file");
        loadDocumentation(file);
        document.getElementById("documentation").goTo();
      });
    });*/
    
    // Material initialization
    M.Collapsible.init(document.querySelectorAll('.collapsible'), {});
    
    // Load first documentation page
    const hashFile = location.hash.substring(1).toLowerCase().replace(/_/g, ' ');
    for (file in documentationFileToTitle)
      if (hashFile == documentationFileToTitle[file].toLowerCase()) {
        document.getElementById("documentation").goTo();
        loadDocumentation(file);
        
        return;
      }
      
    loadDocumentation("index.html");
});

window.addEventListener("hashchange", function(e) {
  const hash = location.hash.substring(1), hashFile = hash.toLowerCase().replace(/_/g, ' ');
  for (file in documentationFileToTitle)
    if (hashFile == documentationFileToTitle[file].toLowerCase()) {
      loadDocumentation(file);
      if (window.innerWidth < 992)
        M.Sidenav.getInstance(document.querySelector("#sidenav")).close();
      
      document.getElementById("documentation").goTo();
      e.preventDefault();
      
      return;
    }
    
  // Not a page, see if the element is around
  el = document.getElementById(hash);
  if (el === null)
    return;
  
  el.goTo();
});