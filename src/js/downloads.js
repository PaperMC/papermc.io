const downloads = {
    "Paper-1.19": {
        "title": "Paper 1.19",
        "api_endpoint": "paper",
        "api_version": "1.19",
        "github": "PaperMC/Paper",
        "desc": "Active development for Minecraft 1.19",
        "limit": 10,
        "cache": null,
    },
    "Paper-1.18": {
        "title": "Paper 1.18.2",
        "api_endpoint": "paper",
        "api_version": "1.18",
        "github": "PaperMC/Paper",
        "desc": "Active development for Minecraft 1.18.2",
        "limit": 10,
        "cache": null,
    },
    "Velocity": {
        "title": "Velocity",
        "api_endpoint": "velocity",
        "api_version": "3.0.0",
        "github": "PaperMC/Velocity",
        "desc": "The modern, next-generation Minecraft server proxy.",
        "limit": 10,
        "cache": null,
    },
    "Waterfall": {
        "title": "Waterfall",
        "api_endpoint": "waterfall",
        "api_version": "1.19",
        "github": "PaperMC/Waterfall",
        "desc": "Our fork of the BungeeCord software, with improved Forge support and more features.",
        "limit": 10,
        "cache": null,
    }
};

function apiFetch(project, version) {
    return window.fetch(`https://api.papermc.io/v2/projects/${project}/version_group/${version}/builds`).then((response) => {
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
        apiFetch(downloads[id].api_endpoint, downloads[id].api_version).then((json) => {
            downloads[id].cache = json;
            load(id);
        }).catch((e) => {
            console.error(e);
            document.getElementById(id).innerText = "Failed to load downloads.";
        });
    }

    M.Tabs.init(document.querySelector("#downloads-tabs"), {
        onShow: (e) => {
            history.pushState(null, null, '#' + e.getAttribute('id'));
        }
    });
});

function load(id) {
    const githubID = downloads[id].github;
    const container = document.getElementById(id).querySelector(".download-content");
    const json = downloads[id].cache;
    if (json == null) {
        container.innerText = "Failed to load downloads.";
        return;
    }

    let promotedRows = "";
    let rows = "";
    const builds = json.builds.filter(build => build.downloads && build.downloads.application);
    let oldVersion;
    let atLeastOneExperimental = false;
    builds.sort((a, b) => b.build - a.build).slice(0, downloads[id].limit).forEach((build) => {
        let changes = "";
        build.changes.forEach((item) => {
            changes += `<span class="commit-hash">
                            [<a title="${escapeHTML(item.summary)}" href="https://github.com/${githubID}/commit/${item.commit}" target="_blank">${escapeHTML(item.commit.substring(0, 7))}</a>]
                        </span>
                        ${escapeHTML(item.summary).replace(/([^&])#([0-9]+)/gm, `$1<a target="_blank" href="https://github.com/${githubID}/issues/$2">#$2</a>`)}
                        <br>`;
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

        const experimental = build.channel === 'experimental';
        atLeastOneExperimental = atLeastOneExperimental || experimental;
        const download_color = build.promoted === true ? 'light-green' : experimental ? 'red' : 'light-blue';
        const download_icon = experimental ? 'error' : 'cloud_download';

        const row = `<tr>
                        <td>
                            <a href="https://api.papermc.io/v2/projects/${downloads[id].api_endpoint}/versions/${build.version}/builds/${build.build}/downloads/${build.downloads.application.name}"
                                class="waves-effect waves-light btn ${download_color} darken-2" title="Version: ${build.version}\nChannel: ${capitalizeFirstLetter(build.channel)}">
                                #${build.build}<i class="material-icons left">${download_icon}</i>
                            </a>
                        </td>
                        <td data-build-id="${build.build}">
                            ${changes}
                        </td>
                        <td>
                            ${new Date(build.time).toISOString().split('T')[0]}
                        </td>
                        <td>
                            <a class="downloads-button white grey-text text-darken-4 btn nav-btn waves-effect" onclick="copy('${build.downloads.application.sha256}')" title="Click to copy the SHA256 of the jar, used to verify the integrity">
                                <i class="material-icons">content_copy</i>
                            </a>
                        </td>
                     </tr>`;

        build.promoted === true
            ? promotedRows += row
            : rows += row;
    });

    const noBuilds = `<tr class="no-builds-row">
                            <td colspan="4">No builds.</td>
                      </tr>`;

    if (rows === "") {
        rows = noBuilds;
    }

    container.innerHTML = `<div class="download-desc">${downloads[id].desc}</div>`;

    const experimentalBox = `<div class="experimental-desc">
                                    <i class="material-icons left">error</i>
                                    <span>Builds marked in red are early, experimental builds. They are only recommended for usage on test servers and should be used with caution. <b>Backups are mandatory!</b></span>
                                </div>`
    if (atLeastOneExperimental) {
        container.innerHTML += experimentalBox;
    }

    if (promotedRows) {
        container.innerHTML += `
              <div class="builds-title">Promoted Builds</div>
              <table class="builds-table striped" style="margin-bottom: 15px">
                <thead>
                  <tr>
                    <th width="10%">Build</th>
                    <th width="75%">Changes</th>
                    <th width="10%">Date</th>
                    <th width="5%" title="The SHA256 of the jar, used to verify the integrity">SHA256</th>
                  </tr>
                </thead>

                <tbody>
                  ${promotedRows}
                </tbody>
              </table>
              
              <div class="builds-title" style="padding-bottom: 5px">Other Builds</div>
              `;
    }

    container.innerHTML += `
            <table class="builds-table striped">
              <thead style="visibility: collapse">
                <tr>
                  <th width="10%"></th>
                  <th width="75%"></th>
                  <th width="10%"></th>
                  <th width="5%"></th>
                </tr>
              </thead>

              <tbody>
                ${rows}
              </tbody>
            </table>
            `;

    if (json.builds.length > downloads[id].limit) {
        container.innerHTML += `<a class="wide-btn btn light-blue darken-2 waves-effect waves-light white-text" onclick="loadMore('${id}')">More</a><br>`;
    }

    if (downloads[id].api_endpoint === "paper") {
        container.innerHTML += `<a class="wide-btn btn grey darken-2 waves-effect waves-light" href="legacy">Legacy</a>`
    }

    if (atLeastOneExperimental) {
        container.innerHTML += experimentalBox;
    }
}

function loadMore(id) {
    downloads[id].limit += 10;
    load(id);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function copy(string) {
    await navigator.clipboard.writeText(string);
}
