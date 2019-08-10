const versions = ["1.11.2", "1.10.2", "1.9.4", "1.8.8"];

versions.forEach(function(i) {
  fetch('/api/v1/paper/' + i + '/latest').then(r => r.json())
  .then(data => document.getElementById(i).href="https://papermc.io/api/v1/paper/" + i + "/" + data.build + "/download");
});
