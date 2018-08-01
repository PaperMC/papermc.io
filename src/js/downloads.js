function fetchJenkinsBuilds() {
    return window.fetch(
        "https://ci.velocitypowered.com/job/velocity/job/master/api/json?tree=builds[number,url,artifacts[fileName,relativePath],timestamp]{,10}"
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

    fetchJenkinsBuilds().then(function(jenkinsResult) {
        // Lightly process the result
        jenkinsResult.builds.forEach(function(build, i) {
            build.latest = i === 0;
            build.formattedDate = new Date(build.timestamp).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
            build.artifacts.forEach(function(artifact) {
                artifact.url = "https://ci.velocitypowered.com/job/velocity/job/master/" + build.number + "/artifact/" + artifact.relativePath;
                artifact.type = function() {
                    if (artifact.fileName.startsWith('velocity-1.0') || artifact.fileName.startsWith('velocity-proxy-')) {
                        return "Proxy";
                    }

                    if (artifact.fileName.startsWith('velocity-api')) {
                        return "API";
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