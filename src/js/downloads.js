const downloads = {
    "Paper-1.16": {
        "title": "Paper 1.16.4",
        "api_endpoint": "paper",
        "api_version": "1.16",
        "jenkins": "Paper-1.16",
        "github": "PaperMC/Paper",
        "desc": "Active development for the current Minecraft version.",
        "limit": 10
    },
    "Paper-1.15": {
        "title": "Paper 1.15.2",
        "api_endpoint": "paper",
        "api_version": "1.15",
        "github": "PaperMC/Paper",
        "desc": "Legacy support while the newest version stabilizes.",
        "limit": 10
    },
    "Waterfall": {
        "title": "Waterfall",
        "api_endpoint": "waterfall",
        "api_version": "1.16",
        "github": "PaperMC/Waterfall",
        "desc": "Our fork of the BungeeCord software, with improved Forge support and more features.",
        "limit": 10,
    },
    "Travertine": {
        "title": "Travertine",
        "api_endpoint": "travertine",
        "api_version": "1.16",
        "github": "PaperMC/Travertine",
        "desc": "Waterfall, with additional support for Minecraft 1.7.10.",
        "limit": 10,
    }
};

function apiFetch(project, version) {
    return window.fetch(`/api/v2/projects/${project}/version_group/${version}/builds`).then((response) => {
        if (response.status >= 400)
            return null;

        return response.json();
    });
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', () => {
    // Show downloads
    let tabs = "", tabContents = "", jobs = Object.keys(downloads).length;
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
    document.getElementById("content").innerHTML = `
      <div class="col s12">
        <ul id="downloads-tabs" class="tabs">
          ${tabs}
        </ul>
      </div>
      ${tabContents}`;

    for (const id in downloads) {
        load(id);
    }

    M.Tabs.init(document.querySelector("#downloads-tabs"), {
        onShow: (e) => {
            history.pushState(null, null, '#' + e.getAttribute('id'));
        }
    });
});

function load(id) {
    const githubID = downloads[id].github;
    apiFetch(downloads[id].api_endpoint, downloads[id].api_version).then((json) => {
        const container = document.getElementById(id).querySelector(".download-content");
        if (json == null) {
            container.innerText = "Failed to load downloads.";
            return;
        }

        let rows = "";
        const builds = json.builds.filter(build => build.downloads && build.downloads.application);
        let oldVersion;
        builds.sort((a, b) => b.build - a.build).slice(0, downloads[id].limit).forEach((build) => {
            let changes = "";
            build.changes.forEach((item) => {
                changes += `<span class="commit-hash">[<a title="${escapeHTML(item.summary)}" href="https://github.com/${githubID}/commit/${item.commit}" target="_blank">${escapeHTML(item.commit.substring(0, 7))}</a>]</span> ${escapeHTML(item.summary).replace(/([^&])#([0-9]+)/gm, `$1<a target="_blank" href="https://github.com/${githubID}/issues/$2">#$2</a>`)}<br>`;
            });

            if (!changes) {
                changes = "No changes";
            }

            if (!oldVersion) {
                oldVersion = build.version;
            }

            if (oldVersion !== build.version) {
                oldVersion = build.version;
                rows += `<tr>
                    <td colspan="3">${capitalizeFirstLetter(downloads[id].api_endpoint)} ${build.version}</td>
                </tr>`;
            }

            rows += `<tr>
                  <td><a href="/api/v2/projects/${downloads[id].api_endpoint}/versions/${build.version}/builds/${build.build}/downloads/paper-${build.version}-${build.build}.jar"
                  class="btn waves-light waves-effect grey darken-4">
                  #${build.build}<i class="material-icons left">cloud_download</i>
                  </a></td>
                  <td data-build-id="${build.build}">${changes}</td>
                  <td>${new Date(build.time).toISOString().split('T')[0]}</td>
                </tr>`;
        });

        container.innerHTML = `
              <div class="download-desc">${downloads[id].desc}</div>
                <table class="builds-table">
                  <thead>
                    <tr>
                      <th>Build</th>
                      <th>Changes</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${rows}
                  </tbody>
                </table>
                <a class="jenkins-btn btn light-blue darken-2 waves-effect waves-light" onclick="loadMore('${id}')">More</a><br>`;

        if (downloads[id].api_endpoint == "paper") {
            container.innerHTML += `<a class="jenkins-btn btn grey darken-2 waves-effect waves-light" href="legacy">Legacy</a>`
        }

    }).catch((e) => {
        console.error(e);
        document.getElementById(id).innerText = "Failed to load downloads.";
    });
}

function loadMore(id) {
    downloads[id].limit += 10;
    load(id);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}