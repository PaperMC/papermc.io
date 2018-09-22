let JENKINS_LEGACY_URL = "https://papermc.io/ci/job/Paper/";
let JENKINS_113_URL = "https://papermc.io/ci/job/Paper-1.13/";

function fetchJenkinsBuilds(baseUrl) {
    return window.fetch(
        baseUrl + "/api/json?tree=builds[number,url,artifacts[fileName,relativePath],timestamp]{,10}"
    )
    .then(function(resp) {
        if (resp.status !== 200) {
            throw new Error("unexpected error status " + resp.status)
        }
        return resp.json();
    });
}

function onLoad() {
    var app = new Vue({
        el: '#downloads-container',
        data: {
            loading: true,
            builds: []
        }
    });

    let baseUrl = JENKINS_LEGACY_URL; // initial page load artifacts

    fetchJenkinsBuilds(baseUrl).then(function(jenkinsResult) {
        // Lightly process the result
        jenkinsResult.builds.forEach(function(build, i) {
            build.latest = i === 0;
            build.formattedDate = new Date(build.timestamp).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
            build.artifacts.forEach(function(artifact) {
                artifact.url = baseUrl + build.number + "/artifact/" + artifact.relativePath;
                artifact.type = function() {
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

window.addEventListener('load', onLoad);