const fs = require("fs");
const gulp = require("gulp");
const gulp_htmlmin = require("gulp-htmlmin");
const gulp_sass = require("gulp-sass");
const gulp_terser = require("gulp-terser");
const gulp_twig = require("gulp-twig");
const gulp_buster = require("gulp-buster");
const gulp_rename = require("gulp-rename");

gulp.task("sass", function() {
  return gulp
    .src("src/css/*.scss")
    .pipe(
      gulp_sass({
        outputStyle: "compressed"
      }).on("error", gulp_sass.logError)
    )
    .pipe(gulp.dest("dist/css"));
});

gulp.task("terse", function() {
  return gulp
    .src("src/js/*.js")
    .pipe(gulp_terser())
    .pipe(gulp.dest("dist/js"));
});

gulp.task("copy images", function() {
  return gulp
    .src("src/images/*")
    .pipe(gulp.dest("dist/images"))
})

gulp.task("copy favicons", function() {
  return gulp
    .src("src/favicons/*")
    .pipe(gulp.dest("dist/favicons"))
})

gulp.task("bust", function() {
  return Promise.all([
    // CSS busters
    new Promise((resolve, reject) => {
      gulp.src("dist/css/*.css")
        .pipe(gulp_buster({algo: "sha256", length: 16}))
        .on("error", reject)
        .pipe(gulp.dest("dist/css"))
        .on("end", resolve);
    }),
    // JS busters
    new Promise((resolve, reject) => {
      gulp.src("dist/js/*.js")
        .pipe(gulp_buster({algo: "sha256", length: 16}))
        .on("error", reject)
        .pipe(gulp.dest("dist/js"))
        .on("end", resolve);
    }),
    // Image busters
    new Promise((resolve, reject) => {
      gulp.src("dist/images/*")
        .pipe(gulp_buster({algo: "sha256", length: 16}))
        .on("error", reject)
        .pipe(gulp.dest("dist/images"))
        .on("end", resolve);
    })
  ]);
});

gulp.task("content", function() {
  return new Promise((resolve, reject) => {
    let cssBusters = JSON.parse(fs.readFileSync("dist/css/busters.json"));
    let jsBusters = JSON.parse(fs.readFileSync("dist/js/busters.json"));
    let imageBusters = JSON.parse(fs.readFileSync("dist/images/busters.json"));

    gulp.src("src/*.twig")
      .pipe(
        gulp_twig({
          data: {
            community_css_version: cssBusters["dist/css/community.css"],
            documentation_css_version: cssBusters["dist/css/documentation.css"],
            downloads_css_version: cssBusters["dist/css/downloads.css"],
            index_css_version: cssBusters["dist/css/index.css"],
            materialize_css_version: cssBusters["dist/css/materialize.min.css"],
            styles_css_version: cssBusters["dist/css/styles.css"],

            documentation_js_version: jsBusters["dist/js/documentation.js"],
            downloads_js_version: jsBusters["dist/js/downloads.js"],
            materialize_js_version: jsBusters["dist/js/materialize.js"],
            script_js_version: jsBusters["dist/js/script.js"],
            site_js_version: jsBusters["dist/js/site.js"],

            discord_background_image_version: imageBusters["dist/images/discord-background.svg"],
            irc_background_image_version: imageBusters["dist/images/irc-background.svg"],
            jumbotron_image_version: imageBusters["dist/images/jumbotron.png"],
            logo_image_version: imageBusters["dist/images/logo.svg"],
            logo_marker_image_version: imageBusters["dist/images/logo-marker.svg"],
            twitter_image_version: imageBusters["dist/images/twitter.svg"]
          }
        })
      )
      .on("error", reject)
      .pipe(
        gulp_rename(path => {
          path.extname = ".html";
        })
      )
      .pipe(gulp.dest("dist"))
      .on("end", resolve);
  });
});

gulp.task("minify", function() {
  return gulp
    .src("dist/*.html")
    .pipe(gulp_htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("dist"));
});

gulp.task("default", gulp.series("sass", "terse", "copy images", "copy favicons", "bust", "content", "minify"));
