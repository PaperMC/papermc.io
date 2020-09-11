const downloads = {
    "Paper-1.16": {
        "title": "Paper 1.16.3",
        "api_endpoint": "paper",
        "api_version": "1.16.3", // 1.16.2 tacked on below
        "jenkins": "Paper-1.16",
        "github": "PaperMC/Paper",
        "desc": "Active development for the current Minecraft version.",
    },
    "Paper-1.15": {
        "title": "Paper 1.15.2",
        "api_endpoint": "paper",
        "api_version": "1.15.2", // 1.15.1 tacked on below
        "jenkins": "Paper-1.15",
        "github": "PaperMC/Paper",
        "desc": "Legacy support while the newest version stabilizes.",
    },
    "Waterfall": {
        "title": "Waterfall",
        "api_endpoint": "waterfall",
        "api_version": "1.16",
        "jenkins": "Waterfall",
        "github": "PaperMC/Waterfall",
        "desc": "Our fork of the BungeeCord software, with improved Forge support and more features."
    },
    "Travertine": {
        "title": "Travertine",
        "api_endpoint": "travertine",
        "api_version": "1.16",
        "jenkins": "Travertine",
        "github": "PaperMC/Travertine",
        "desc": "Waterfall, with additional support for Minecraft 1.7.10."
    }
};

function jenkinsFetch(job, path) {
    return window.fetch("/ci/job/" + job + path).then((response) => {
        if (response.status > 400)
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
        const githubID = downloads[id].github;
        jenkinsFetch(downloads[id].jenkins, "/api/json?tree=builds[number,url,artifacts[fileName,relativePath],timestamp,changeSet[items[comment,commitId,msg]]]{,10}").then((json) => {
            const container = document.getElementById(id).querySelector(".download-content");
            if (json == null) {
                container.innerText = "Failed to load downloads.";
                return;
            }

            let rows = "";
            const builds = json.builds.filter(build => build.artifacts && build.artifacts.length);
            builds.forEach((build) => {

                const el = container.querySelector("td[data-build-id='" + build.number + "']");
                if (build == null) {
                    el.innerText = "Failed to load downloads.";
                    return;
                }

                let changes = "";
                build.changeSet.items.forEach((item) => {
                    changes += `<span class="commit-hash">[<a title="${escapeHTML(item.comment)}" href="https://github.com/${githubID}/commit/${item.commitId}" target="_blank">${escapeHTML(item.commitId.substring(0, 7))}</a>]</span> ${escapeHTML(item.msg).replace(/([^&])#([0-9]+)/gm, `$1<a target="_blank" href="https://github.com/${githubID}/issues/$2">#$2</a>`)}<br>`;
                });

                if (!changes) {
                    changes = "No changes";
                }

                // TODO - rework system, add to API, whatever so that this crap is no longer needed
                let apiVer = downloads[id].api_version
                if (downloads[id].api_endpoint == "paper" && apiVer == "1.16.3" && build.number <= 189) {
                    apiVer = "1.16.2"
                } else if (downloads[id].api_endpoint == "paper" && apiVer == "1.15.2" && build.number <= 62) {
                    apiVer = "1.15.1"
                } else if (downloads[id].api_endpoint == "waterfall" && build.number <= 350) {
                    apiVer = "1.15"
                } else if (downloads[id].api_endpoint == "travertine" && build.number <= 144) {
                    apiVer = "1.15"
                }

                rows += `<tr>
                  <td><a href="/api/v1/${downloads[id].api_endpoint}/${apiVer}/${build.number}/download"
                  class="btn waves-light waves-effect grey darken-4">
                  #${build.number}<i class="material-icons left">cloud_download</i>
                  </a></td>
                  <td data-build-id="${build.number}">${changes}</td>
                  <td>${new Date(build.timestamp).toISOString().split('T')[0]}</td>
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
                <a class="jenkins-btn btn light-blue darken-2 waves-effect waves-light" href="/ci/job/${downloads[id].jenkins}/">More</a><br>`;

            if (downloads[id].api_endpoint == "paper") {
              container.innerHTML += `<a class="jenkins-btn btn grey darken-2 waves-effect waves-light" href="legacy">Legacy</a>`
            }

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
