const fs = require('fs');
const path = require('path');
const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const gulp_htmlmin = require('gulp-htmlmin');
const gulp_sass = require('gulp-sass');
const gulp_terser = require('gulp-terser');
const gulp_twig = require('gulp-twig');
const gulp_buster = require('gulp-buster');
const gulp_rename = require('gulp-rename');
const proxyMiddleware = require('http-proxy-middleware');

gulp.task('sass', () => {
  return gulp
    .src('src/css/*.scss')
    .pipe(
      gulp_sass({
        outputStyle: 'compressed'
      }).on('error', gulp_sass.logError)
    ).pipe(gulp.dest('dist/css')).pipe(browserSync.stream());
});

gulp.task('terse', () => {
  return gulp.src('dist/js/*.js')
    .pipe(gulp_terser());
});

gulp.task('copy js', () => {
  return gulp
    .src('src/js/*.js')
    .pipe(gulp.dest('dist/js')).pipe(browserSync.stream());
});

gulp.task('copy images', () => {
  return gulp.src('src/images/*').pipe(gulp.dest('dist/images'))
  .pipe(browserSync.stream());
});

gulp.task('copy favicons', () => {
  return gulp.src('src/favicons/*').pipe(gulp.dest('dist/favicons'))
  .pipe(browserSync.stream());
});

gulp.task('copy primary favicon', () => {
  return gulp.src('src/favicon.ico').pipe(gulp.dest('dist'));
});

gulp.task('bust', () => {
  return gulp.src('dist/**/*')
    .pipe(
      gulp_buster({
        algo: 'sha256',
        length: 16
      })
    ).pipe(gulp.dest('dist')).pipe(browserSync.stream());
});

gulp.task('content', () => {
  return new Promise((resolve, reject) => {
    let busters = JSON.parse(fs.readFileSync('dist/busters.json'));

    var twigData = {
      urls: {}
    };

    Object.keys(busters).forEach(file => {
      let baseName = path.basename(file);
      let dir = path.dirname(file).split('/')[1];
      twigData.urls[dir + '/' + baseName] = dir + '/' + baseName + '?v=' + busters[file];
    });

    gulp.src('src/*.twig')
      .pipe(
        gulp_twig({
          data: twigData
        })
      ).on('error', reject)
      .pipe(
        gulp_rename(path => {
          path.extname = '.html';
        })
      ).pipe(gulp.dest('dist'))
      .on('end', resolve).pipe(browserSync.stream());
  });
});

gulp.task('minify', () => {
  return gulp
    .src('dist/*.html')
    .pipe(
      gulp_htmlmin({
        collapseWhitespace: true,
        removeComments: true
      })
    )
    .pipe(gulp.dest('dist')).pipe(browserSync.stream());
});

gulp.task('quickBuild', gulp.series('sass', 'copy images', 'copy js', 'copy favicons', 'copy primary favicon', 'bust', 'content'));

gulp.task('default', gulp.series('quickBuild', 'terse', 'minify'));

gulp.task('dev', gulp.parallel(gulp.series('quickBuild', () => {
  browserSync.init({
    server: {
      baseDir: 'dist/',
      serveStaticOptions: {
        extensions: ['html']
      },
      middleware: [proxyMiddleware(['/ci', '/api'], {
        target: 'https://papermc.io/',
        secure: false,
        changeOrigin: true
      })]
    }
  })
}), () => {
  gulp.watch('src/**/*', gulp.series('quickBuild'));
}));
