const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const gulp_htmlmin = require("gulp-htmlmin");
const gulp_sass = require("gulp-sass");
const gulp_terser = require("gulp-terser");
const gulp_twig = require("gulp-twig");
const gulp_buster = require("gulp-buster");
const gulp_rename = require("gulp-rename");

const dirs = {
  src: path.resolve("src"),
  out: path.resolve("dist")
}

gulp.task("sass", function() {
  return gulp
    .src(path.join(dirs.src, "css/*.scss"))
    .pipe(
      gulp_sass({
        outputStyle: "compressed"
      }).on("error", gulp_sass.logError)
    )
    .pipe(gulp.dest(path.join(dirs.out, "css")));
});

gulp.task("terse", function() {
  return gulp
    .src(path.join(dirs.src, "js/*.js"))
    .pipe(gulp_terser())
    .pipe(gulp.dest(path.join(dirs.out, "js")));
});

gulp.task("copy images", function() {
  return gulp.src(path.join(dirs.src, "images/**/*"))
    .pipe(gulp.dest(path.join(dirs.out, "images")));
});

gulp.task("copy favicons", function() {
  return gulp.src(path.join(dirs.src, "favicons/**/*"))
    .pipe(gulp.dest(path.join(dirs.out, "favicons")));
});

gulp.task("copy htaccess", function() {
  return gulp.src(path.join(dirs.src, ".htaccess"))
    .pipe(gulp.dest(dirs.out));
});

gulp.task("bust", function() {
  return gulp
    .src(path.join(dirs.out, "**/*"))
    .pipe(
      gulp_buster({
        algo: "sha256",
        length: 16
      })
    )
    .pipe(gulp.dest(dirs.out));
});

gulp.task("content", function() {
  return new Promise((resolve, reject) => {
    let busters = JSON.parse(fs.readFileSync(path.join(dirs.out, "busters.json")));

    var twigData = {
      urls: {}
    };

    Object.keys(busters).forEach(file => {
      let baseName = path.basename(file);
      let dir = path.dirname(file).split("/")[1];
      twigData.urls[dir + "/" + baseName] = dir + "/" + baseName + "?v=" + busters[file];
    });

    gulp
      .src(path.join(dirs.src, "**/*.twig"))
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
      .pipe(gulp.dest(dirs.out))
      .on("end", resolve);
  });
});

gulp.task("minify", function() {
  return gulp
    .src(path.join(dirs.out, "**/*.html"))
    .pipe(
      gulp_htmlmin({
        collapseWhitespace: true,
        removeComments: true
      })
    )
    .pipe(gulp.dest(dirs.out));
});

gulp.task(
  "default",
  gulp.series("sass", "terse", "copy images", "copy favicons", "copy htaccess", "bust", "content", "minify")
);
