const downloads = {
  "Paper": {
      "title": "Paper",
      "desc": "Legacy downloads for old major releases of the Paper software.",
      "api_endpoint": "paper",
      "versions": [
        {
          "version": "1.16.5",
          "build": "791"
        },
        {
          "version": "1.15.2",
          "build": "391"
        },
        {
          "version": "1.14.4",
          "build": "243"
        },
        {
          "version": "1.13.2",
          "build": "655"
        },
        {
          "version": "1.12.2",
          "build": "1618"
        },
        {
          "version": "1.11.2",
          "build": "1104"
        },
        {
          "version": "1.10.2",
          "build": "916"
        },
        {
          "version": "1.9.4",
          "build": "773"
        },
        {
          "version": "1.8.8",
          "build": "443"
        }
      ],
      cache: null
  },
  "Travertine": {
      "title": "Travertine",
      "desc": "Legacy downloads for our retired 1.7-capable server proxy software, Travertine.",
      "api_endpoint": "travertine",
      "versions": [
        {
          "version": "1.16",
          "build": "191",
          "name": "1.16-1.17"
        },
        {
          "version": "1.15",
          "build": "144"
        },
        {
          "version": "1.14",
          "build": "112"
        },
        {
          "version": "1.13",
          "build": "93"
        },
        {
          "version": "1.12",
          "build": "44"
        }
      ],
      cache: null
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  let tabs = "", tabContents = "";

  for (const id in downloads) {
    const title = downloads[id].title;
    tabs += `<li class="tab"><a href="#${id}">${title}</a></li>`;

    tabContents += `
    <div id="${id}" class="col s12">
      <div class="download-content">
        <div class="download-desc">${downloads[id].desc}</div>
        <div class="progress">
          <div class="indeterminate"></div>
        </div>
      </div>
    </div>`;
  }

  document.getElementById("content").innerHTML = `<div class="col s12">
    <ul id="legacy-tabs" class="tabs">
      ${tabs}
    </ul>
  </div>
  ${tabContents}`;

  M.Tabs.init(document.querySelector("#legacy-tabs"), {
    onShow: (e) => {
        history.pushState(null, null, '#' + e.getAttribute('id'));
    }
  });

  for (const id in downloads) {
    let container = document.getElementById(id).querySelector(".download-content");
    let rows = "";

    for (const version of downloads[id].versions) {
      let json = await apiFetch(downloads[id].api_endpoint, version.version, version.build)
      downloads[id].cache = json;

      try {
        rows += await load(id, version.version, version.build, version.name)
      } catch (e) {
        console.error(e);
        document.getElementById(id).innerText = "Failed to load downloads.";
      }
    }

    container.innerHTML = `<div class="download-desc">${downloads[id].desc}</div>
    ${rows}`;
  }
});

async function apiFetch(project, version, build) {
  return window.fetch(`/api/v2/projects/${project}/versions/${version}/builds/${build}`).then((response) => {
      if (response.status >= 400) {
          return null;
      }

      return response.json();
  });
}

async function load(id, version, build, name) {
  const container = document.getElementById(id).querySelector(".download-content");

  const json = downloads[id].cache;
  if (json == null) {
      container.innerText = "Failed to load downloads.";
      return;
  }

  if (!json.downloads && !json.downloads.application) {
    return `<div class="row">
      <div class="col s12 l3">
        <i class="material-icons benefit-icon">assignment_late</i>
      </div>
      <p></p>
      <div class="col s12 l9">
        <h4>${name ? name : version}</h4>
        <p>Failed to retrieve information for this legacy download. Please try again later.</p>
      </div>
    </div>`;
  } else {
    return `<div class="row">
      <div class="col s12 l3">
        <i class="material-icons benefit-icon">assignment_late</i>
      </div>
      <p></p>
      <div class="col s12 l9">
        <h4>${name ? name : version}</h4>
        <p><strong>This build is purely for accessibility. By clicking the download button, you acknowledge that no support will be provided whatsoever.</strong></p>
        <a id="${id}-${version}-${build}" href="https://papermc.io/api/v2/projects/${downloads[id].api_endpoint}/versions/${version}/builds/${build}/downloads/${json.downloads.application.name}" class="waves-effect waves-light btn red darken-2">Download Anyway</a>
      </div>
    </div>`;
  }
}
