var mq = window.matchMedia( "(prefers-color-scheme: dark)" );
var tl = document.getElementById("twitter-timeline");
if (mq.matches) {
  tl.innerHTML = '<a class="twitter-timeline" data-dnt="true" data-theme="dark" href="https://twitter.com/PaperPowered">PaperMC Tweets</a>';
}
else {
  tl.innerHTML = '<a class="twitter-timeline" data-dnt="true" data-theme="light" href="https://twitter.com/PaperPowered">PaperMC Tweets</a>';
}
