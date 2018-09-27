let JENKINS_LEGACY_URL = "/ci/job/Paper/";
let JENKINS_113_URL = "/ci/job/Paper-1.13/";
Vue.component('download-container', {
    template: '#download-container-template'
});
function fetchJenkinsBuilds(baseUrl) {
    return window.fetch(
        baseUrl + "/api/json?tree=builds[number,url,artifacts[fileName,relativePath],timestamp]{,5}"
    )
    .then(function(resp) {
        if (resp.status !== 200) {
            throw new Error("unexpected error status " + resp.status)
        }
        return resp.json();
    });
}

function onLoad() {
    function buildChanges(baseUrl, ver, target) {
        var app = new Vue({
            el: target,
            data: {
                loading: true,
                builds: []
            }
        });
        app.downloadClick = function(build) {
            gtag && gtag('event', 'Download', {
                'event_category': 'Paper ' + ver,
                'event_label': build,
                'value': 1
            });
        };

        fetchJenkinsBuilds(baseUrl).then(function (jenkinsResult) {
            // Lightly process the result
            jenkinsResult.builds.forEach(function (build, i) {
                build.latest = i === 0;
                build.formattedDate = new Date(build.timestamp).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });
                window.fetch(baseUrl + '/' + build.number + '/api/json?wrapper=changes').then((changesResp) => {
                    return changesResp.json();
                }).then((changes) => {
                    const changeList = [];
                    changes.changeSet.items.forEach(item => {
                        if (item.comment.toUpperCase().indexOf('[CI-SKIP]') !== -1) return;
                        changeList.push({
                            title: item.comment.split(/\n/)[0],
                            text: item.comment,
                            url: 'https://github.com/PaperMC/Paper/commit/' + item.commitId,
                            id: item.commitId.substring(0, 7)
                        });
                    });
                    build.changes = changeList.reverse();
                    Vue.set(app.builds, i, build);
                });
                build.artifacts = build.artifacts.slice(0, 1);
                build.artifacts.forEach(function (artifact) {
                    artifact.url = baseUrl + build.number + "/artifact/" + artifact.relativePath;
                    artifact.type = function () {
                        if (artifact.fileName.startsWith('paperclip')) {
                            return "Server";
                        }

                        return "Unknown";
                    }
                })
            });
            app.loading = false;
            app.builds = jenkinsResult.builds;
        })
    }

    buildChanges(JENKINS_113_URL, '1.13.1', '#downloads-container-113');
    buildChanges(JENKINS_LEGACY_URL, '1.12.2', '#downloads-container-112');
}

window.addEventListener('load', onLoad);
