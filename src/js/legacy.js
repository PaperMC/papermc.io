const versions = ["1.12.2", "1.11.2", "1.10.2", "1.9.4", "1.8.8"];
var div = document.getElementById('content');
document.addEventListener('DOMContentLoaded', () => {
  // init layout first for ordering
  for (const i in versions) {

    var div = document.createElement('div');
    div.innerHTML = `<div class="row">
    <div class="col s12 l3">
      <i class="material-icons benefit-icon">assignment_late</i>
    </div>
    <p></p>
    <div class="col s12 l9">
      <h4>${versions[i]}</h4>
      <p><strong>This build is purely for accessibility. By clicking the download button, you acknowledge that no support will be provided whatsoever. You also acknowledge that tacos are tasty and that by asking for support, you understand that you will be yelled at by a leaf.</strong></p>
      <a id="${versions[i]}" href="https://papermc.io/api/v1/paper/${versions[i]}/latest/download" class="waves-effect waves-light btn light-blue darken-2">
        Download Anyway</a>
    </div>
  </div>`;

    document.getElementById("content").appendChild(div);

    // update with edge-cached URL
    fetch('/api/v1/paper/' + versions[i] + '/latest').then(r => r.json()).then(data => {
      document.getElementById(versions[i]).setAttribute("href", `https://papermc.io/api/v1/paper/${versions[i]}/${data.build}/download`);
    }).catch((e) => {
      console.error(e);
    });
  }
});
