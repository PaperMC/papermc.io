const downloads = {
  "Paper": {
      "title": "Paper",
      "desc": "Legacy downloads for old major releases of the Paper software.",
      "api_endpoint": "paper",
      "versions": [
          "1.17",
          "1.16",
          "1.15",
          "1.14",
          "1.13",
          "1.12",
          "1.11",
          "1.10",
          "1.9",
          "1.8"
      ]
  },
  "Travertine": {
      "title": "Travertine",
      "desc": "Legacy downloads for our retired 1.7-capable server proxy software, Travertine.",
      "api_endpoint": "travertine",
      "versions": [
        "1.16"
      ]
  }
};

const submitButton = document.getElementById("submit-quiz");

if (localStorage.getItem("quiz-complete") == "true") {
  document.getElementById("quiz").style.display = 'none';
  document.getElementById("content").style.display = 'block';
}

let timer;
let counterValue = 0;
let timerSeconds = 0;

function setTimer(value) {
    counterValue = value;
    submitButton.textContent = "Invalid answers, try again in " + value + " seconds...";
}

timer = setInterval(
  function() {
      if (counterValue > 1) {
          setTimer(counterValue - 1);
          submitButton.disabled = true;
      } else {
          setTimer(0);
          submitButton.disabled = false;
          submitButton.textContent = "Submit";
      }
  },
  1000
);

function checkValue(id, value) {
  const element = document.getElementById(id);
  const elementValue = element.options[element.selectedIndex].value;
  return value === elementValue;
}

submitButton.onclick = function() {
  submitButton.disabled = true;
  let failed = false;

  if (!checkValue("quiz-1", "2") || !checkValue("quiz-2", "2")) {
    failed = true;
  }

  if (failed) {
    timerSeconds = timerSeconds + 5;
    setTimer(timerSeconds);
  } else {
    localStorage.setItem("quiz-complete", "true");
    document.getElementById("quiz").style.display = 'none';
    document.getElementById("content").style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  let tabs = "", tabContents = "";

  for (const id in downloads) {
    const title = downloads[id].title;
    tabs += `<li class="tab"><a href="#${id}">${title}</a></li>`;

    tabContents += `
    <div id="${id}" class="col s12">
      <div class="download-content">
        <div class="download-desc">${downloads[id].desc}</div>
        <div class="progress">
          <div class="indeterminate"></div>
        </div>
      </div>
    </div>`;
  }

  document.getElementById("content").innerHTML = `<div class="col s12">
    <ul id="legacy-tabs" class="tabs">
      ${tabs}
    </ul>
  </div>
  ${tabContents}`;

  M.Tabs.init(document.querySelector("#legacy-tabs"), {
    onShow: (e) => {
        history.pushState(null, null, '#' + e.getAttribute('id'));
    }
  });

  for (const id in downloads) {
    let container = document.getElementById(id).querySelector(".download-content");
    let rows = "";

    for (const version of downloads[id].versions) {
      try {
        rows += await load(id, downloads[id].api_endpoint, version)
      } catch (e) {
        console.error(e);
        document.getElementById(id).innerText = "Failed to load downloads.";
      }
    }

    container.innerHTML = `<div class="download-desc">${downloads[id].desc}</div>
    ${rows}`;
  }
});

function apiFetch(project, version) {
  return window.fetch(`https://api.papermc.io/v2/projects/${project}/version_group/${version}/builds`).then((response) => {
    if (response.status >= 400)
      return null;

      return response.json();
  });
}

async function load(id, api_endpoint, version) {
  const container = document.getElementById(id).querySelector(".download-content");

  const json = await apiFetch(api_endpoint, version)
  if (json == null) {
      container.innerText = "Failed to load downloads.";
      return;
  }

  return `<div class="row">
    <div class="col s12 l3">
      <i class="material-icons benefit-icon">assignment_late</i>
    </div>
    <p></p>
    <div class="col s12 l9">
      <h4>${json.versions[json.versions.length - 1]}</h4>
      <p><strong>This build is purely for accessibility. By clicking the download button, you acknowledge that no support will be provided whatsoever.</strong></p>
      <a id="${id}-${version}" href="https://api.papermc.io/v2/projects/${downloads[id].api_endpoint}/versions/${json.versions[json.versions.length - 1]}/builds/${json.builds[json.builds.length - 1].build}/downloads/${json.builds[json.builds.length - 1].downloads.application.name}" class="waves-effect waves-light btn red darken-2">Download Anyway</a>
    </div>
  </div>`;
}
