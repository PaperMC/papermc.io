const downloads = {
    "Paper-1.13": {
        "title": "Paper 1.13.1",
        "jenkins": "Paper-1.13",
        "github": "PaperMC/Paper",
        "desc": "Active development for the current Minecraft version.",
    },
    "Paper-1.12": {
        "title": "Paper 1.12.2",
        "jenkins": "Paper",
        "github": "PaperMC/Paper",
        "desc": "Legacy support for Minecraft 1.12.2, accepting bug and security fixes only."
    },
    "Waterfall": {
        "title": "Waterfall",
        "jenkins": "Waterfall",
        "github": "PaperMC/Waterfall",
        "desc": "Our fork of the BungeeCord software, with improved Forge support and more features."
    },
    "Travertine": {
        "title": "Travertine",
        "jenkins": "Travertine",
        "github": "PaperMC/Travertine",
        "desc": "Waterfall, with additional support for Minecraft 1.7.10."
    }
};

function jenkinsFetch(job, path) {
    return window.fetch("/ci/job/" + job + path).then(function (response) {
        if (response.status > 400)
            return null;

        return response.json();
    });
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', function () {
    // Show downloads
    let tabs = "", tabContents = "", jobs = Object.keys(downloads).length;
    for (const id in downloads) {
        const title = downloads[id].title;
        tabs += `<li class="tab col s${12 / jobs}"><a href="#${id}">${title}</a></li>`;

        tabContents += `<div id="${id}" class="col s12">
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
        jenkinsFetch(downloads[id].jenkins, "/api/json?tree=builds[number,url,artifacts[fileName,relativePath],timestamp,changeSet[items[comment,commitId,msg]]]{,10}").then(function (json) {
            const container = document.getElementById(id).querySelector(".download-content");
            if (json == null) {
                container.innerText = "Failed to load downloads.dd";
                return;
            }

            let rows = "";
            const builds = json.builds.filter(build => build.artifacts && build.artifacts.length);
            builds.forEach(function (build) {

                const el = container.querySelector("td[data-build-id='" + build.number + "']");
                if (build == null) {
                    el.innerText = "Failed to load downloads.";
                    return;
                }

                let changes = "";
                build.changeSet.items.forEach(function (item) {
                    changes += `<span class="commit-hash">[<a title="${escapeHTML(item.comment)}" href="https://github.com/${githubID}/commit/${item.commitId}" target="_blank">${escapeHTML(item.commitId.substring(0, 7))}</a>]</span> ${escapeHTML(item.msg)}<br>`;
                });

                if (!changes) {
                    changes = "No changes";
                }

                rows += `<tr>
                  <td><a href="https://papermc.io/ci/job/${id}/${build.number}/artifact/${build.artifacts[0].fileName}" 
                  class="btn waves-light waves-effect grey darken-4">
                  #${build.number}<i class="material-icons left">save_alt</i>
                  </a></td>
                  <td data-build-id="${build.number}">${changes}</td>
                  <td>${new Date(build.timestamp).toLocaleDateString({year: "numeric", month: "numeric", day: "numeric"})}</td>
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
              <a class="jenkins-btn btn blue darken-4 waves-effect waves-light" href="https://papermc.io/ci/job/${id}/">More</a>
            `;

        }).catch(function (e) {
            console.error(e);
            document.getElementById(id).innerText = "Failed to load downloads.";
        });
    }

    M.Tabs.init(document.querySelector("#downloads-tabs"), {});
});
