const versions = ["1.14.4", "1.13.2", "1.12.2", "1.11.2", "1.10.2", "1.9.4", "1.8.8"];

document.addEventListener('DOMContentLoaded', () => {
  // init layout first for ordering
  for (const i in versions) {

    let div = document.createElement('div');
    div.innerHTML = `<div class="row">
    <div class="col s12 l3">
      <i class="material-icons benefit-icon">assignment_late</i>
    </div>
    <p></p>
    <div class="col s12 l9">
      <h4>${versions[i]}</h4>
      <p><strong>This build is purely for accessibility. By clicking the download button, you acknowledge that no support will be provided whatsoever.</strong></p>
      <a id="${versions[i]}" href="https://papermc.io/api/v1/paper/${versions[i]}/latest/download" class="waves-effect waves-light btn light-blue darken-2">
        Download Anyway</a>
    </div>
  </div>`;

    document.getElementById("content").appendChild(div);

    // update with edge-cached URL
    fetch(`/api/v2/projects/paper/versions/${versions[i]}`).then(r => r.json()).then(data => {
      const build = data.builds[data.builds.length - 1];
      document.getElementById(versions[i]).setAttribute("href", `https://papermc.io/api/v2/projects/paper/versions/${data.version}/builds/${build}/downloads/paper-${data.version}-${build}.jar`);
    }).catch((e) => {
      console.error(e);
    });
  }
});