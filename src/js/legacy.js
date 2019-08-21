const versions = ["1.12.2", "1.11.2", "1.10.2", "1.9.4", "1.8.8"];
var div = document.getElementById('content');
document.addEventListener('DOMContentLoaded', () => {
	var text = '';
	versions.forEach(function(i) {
		fetch('/api/v1/paper/' + i + '/latest').then(r => r.json()).then(data => {
			text += `<div class="row">
      <div class="col s12 l3">
        <i class="material-icons benefit-icon">assignment_late</i>
      </div>
      <p></p>
      <div class="col s12 l9">
        <h4>${i}</h4>
        <p><strong>This build is purely for accessability. By clicking the download button, you acknowledge that no support will be provided whatsoever.</strong></p>
        <a id="${i}" href="https://papermc.io/api/v1/paper/${i}/${data.build}/download" class="waves-effect waves-light btn light-blue darken-2">
          Download Anyways</a>
      </div>
    </div>`
		}).then(() => div.innerHTML = text);
	});
});