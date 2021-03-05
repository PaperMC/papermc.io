async function fetchLatestArtifactVersion() {
    const rootResponse = await fetchUrl('/api/v2/projects/paper');
    if (rootResponse === null)
        return null;

    const versionGroups = rootResponse.version_groups;
    const latestVersionGroup = versionGroups[versionGroups.length - 1];

    const versionGroupResponse = await fetchUrl(`/api/v2/projects/paper/version_group/${latestVersionGroup}/`);
    if (versionGroupResponse === null)
        return null;

    const versions = versionGroupResponse.versions;
    const latestVersion = versions[versions.length - 1];

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