const downloads = {
    "Paper 1.13.1": {
        "id": "Paper-1.13",
        "github": "PaperMC/Paper"
    },
    "Paper 1.12.2": {
        "id": "Paper",
        "github": "PaperMC/Paper"
    },
    "Waterfall": {
        "id": "Waterfall",
        "github": "WaterfallMC/Waterfall"
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
    for (const title in downloads) {
        tabs += `<li class="tab col s${12 / jobs}"><a href="#${downloads[title].id}">${title}</a></li>`;
        const id = downloads[title].id;

        tabContents += `<div id="${id}" class="col s12">
      <div class="progress">
          <div class="indeterminate"></div>
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

    for (const title in downloads) {
        const id = downloads[title].id;
        const githubID = downloads[title].github;
        jenkinsFetch(id, "/api/json?tree=builds[number,url,artifacts[fileName,relativePath],timestamp]{,5}").then(function (json) {
            const container = document.getElementById(id);
            console.log(id, container, json);
            if (json == null) {
                container.innerText = "Failed to load downloads.dd";
                return;
            }

            let rows = "";
            const builds = json.builds.filter(build => build.artifacts && build.artifacts.length);
            builds.forEach(function (build) {
                rows += `
        <tr>
          <td><a href="https://papermc.io/ci/job/${id}/${build.number}/artifact/${build.artifacts[0].fileName}" class="btn waves-light waves-effect grey darken-4">#${build.number}<i class="material-icons left">save_alt</i></a></td>
          <td data-build-id="${build.number}">Loading...</td>
          <td>${new Date(build.timestamp).toLocaleDateString({year: "numeric", month: "numeric", day: "numeric"})}</td>
        </tr>`;
            });

            container.innerHTML = `
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

            builds.forEach(build => {
                jenkinsFetch(id, "/" + build.number + "/api/json?wrapper=changes").then(function (build) {
                    const el = container.querySelector("td[data-build-id='" + build.number + "']");
                    if (build == null) {
                        el.innerText = "Failed to load downloads.";
                        return;
                    }

                    let changes = "";
                    build.changeSet.items.forEach(function (item) {
                        changes += `[<a title="${escapeHTML(item.comment)}" href="https://github.com/${githubID}/commit/${item.commitId}" target="_blank">${escapeHTML(item.commitId.substring(0, 7))}</a>] ${escapeHTML(item.msg)}<br>`;
                    });

                    el.innerHTML = changes ? changes.substr(0, changes.length - 1) : "Changes not known";
                }).catch(function (e) {
                    console.error(e);
                    document.querySelector("td[data-build-id='" + build.number + "']").innerText = "Failed to load downloads.";
                });
            });

        }).catch(function (e) {
            console.error(e);
            document.getElementById(id).innerText = "Failed to load downloads.";
        });
    }

    M.Tabs.init(document.querySelector("#downloads-tabs"), {});
});
