async function fetchLatestArtifactVersion() {
    const rootResponse = await fetchUrl('https://api.papermc.io/v2/projects/paper');
    if (rootResponse === null)
        return null;

    const versionGroups = rootResponse.version_groups;
    versionGroups.reverse();
    let latestVersion = "Unknown";

    for (const id of versionGroups) {
        const versionGroupResponse = await fetchUrl(`https://api.papermc.io/v2/projects/paper/version_group/${id}/`);
        const versions = versionGroupResponse.versions;
        if (versions === null || versions.length === 0) {
            continue;
        }

        const versionInfo = await fetchUrl(`https://api.papermc.io/v2/projects/paper/versions/${versions[versions.length-1]}`);
        if (versionInfo === null || versionInfo.builds === null || versionInfo.builds.length === 0) {
            continue;
        }
        latestVersion = versions[versions.length-1];
        break;
    }

    return `${latestVersion}-R0.1-SNAPSHOT`;
}

function fetchUrl(url) {
    return window.fetch(url).then((response) => {
        if (response.status >= 400)
            return null;

        return response.json();
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const latestArtifactVersion = await fetchLatestArtifactVersion();

    M.Tabs.init(document.querySelector("#snippet-tabs"), {
        onShow: (e) => {
            history.pushState(null, null, '#' + e.getAttribute('id'));
        }
    });

    document.querySelectorAll('.latest-artifact-version').forEach(toReplace => {
        toReplace.innerHTML = latestArtifactVersion;
    });

    document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightBlock(block);
    });
});
