const fs = require("fs");
const path = require("path");
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
  return gulp.src("src/images/*").pipe(gulp.dest("dist/images"));
});

gulp.task("copy favicons", function() {
  return gulp.src("src/favicons/*").pipe(gulp.dest("dist/favicons"));
});

gulp.task("bust", function() {
  return gulp
    .src("dist/**/*")
    .pipe(
      gulp_buster({
        algo: "sha256",
        length: 16
      })
    )
    .pipe(gulp.dest("dist"));
});

gulp.task("content", function() {
  return new Promise((resolve, reject) => {
    let busters = JSON.parse(fs.readFileSync("dist/busters.json"));

    var twigData = {};

    Object.keys(busters).forEach(file => {
      let baseName = path.basename(file);
      let dir = path.dirname(file).split("/")[1];
      twigData[baseName.replace(/-/g, "__").replace(/\./g, "_")] =
        dir + "/" + baseName + "?v=" + busters[file];
    });

    gulp
      .src("src/*.twig")
      .pipe(
        gulp_twig({
          data: twigData
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
    .pipe(
      gulp_htmlmin({
        collapseWhitespace: true,
        removeComments: true
      })
    )
    .pipe(gulp.dest("dist"));
});

gulp.task(
  "default",
  gulp.series("sass", "terse", "copy images", "copy favicons", "bust", "content", "minify")
);
