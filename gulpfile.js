'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')
const plumber = require('gulp-plumber')
const autoprefixer = require('gulp-autoprefixer')
const browserSync = require('browser-sync').create()
const rename = require('gulp-rename')
const cssMinify = require('gulp-csso')
const del = require('del')
const injectPartials = require('gulp-inject-partials')
const imagemin = require('gulp-imagemin')
const uglify = require('gulp-uglify-es').default
const newer = require('gulp-newer')
const svgstore = require('gulp-svgstore')
const svgmin = require('gulp-svgmin')
const path = require('path')
const webp = require('gulp-webp')
const htmlbeautify = require('gulp-html-beautify')
const htmlbeautifyOptions = {
  indent_size: 2,
  indent_char: ' ',
  eol: '\n',
  indent_level: 0,
  indent_with_tabs: false,
  preserve_newlines: true,
  max_preserve_newlines: 10,
  jslint_happy: false,
  space_after_anon_function: false,
  brace_style: 'collapse',
  keep_array_indentation: false,
  keep_function_indentation: false,
  space_before_conditional: true,
  break_chained_methods: false,
  eval_code: false,
  unescape_strings: false,
  wrap_line_length: 0,
  wrap_attributes: 'auto',
  wrap_attributes_indent_size: 2,
  end_with_newline: false
}

const webpack = require('webpack')
const webpackconfig = require('./webpack.config.js')
const webpackstream = require('webpack-stream')

gulp.task('html', function() {
  return gulp
    .src('src/*.html')
    .pipe(plumber())
    .pipe(injectPartials({ removeTags: true }))
    .pipe(htmlbeautify(htmlbeautifyOptions))
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream())
})

gulp.task('styles', function() {
  return gulp
    .src('src/scss/styles.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('build/css'))
    .pipe(cssMinify())
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.stream())
})

gulp.task('scripts', function() {
  return gulp
    .src('./src/js/**/*')
    .pipe(plumber())
    .pipe(webpackstream(webpackconfig, webpack))
    .pipe(gulp.dest('./build/js/'))
    .pipe(rename('bundle.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build/js/'))
    .pipe(browserSync.stream())
})

gulp.task('clean', function() {
  return del('./build')
})

gulp.task('serve', function() {
  browserSync.init({
    server: 'build/',
    port: 4000
  })
  gulp.watch('./src/**/*.html', gulp.series('html'))
  gulp.watch('./src/scss/**/*.scss', gulp.series('styles'))
  gulp.watch('./src/js/main.js', gulp.series('scripts'))
  gulp.watch('./src/img/**/*', gulp.series('images'))
  gulp.watch('./src/misc/**/*', gulp.series('miscellaneous'))
  gulp.watch('./src/img/icons/**/*.svg', gulp.series('sprite'))
  gulp.watch('src/img/**/*.{png,jpg,jpeg}', gulp.series('webp'))
})

gulp.task('images', function() {
  return gulp
    .src('./src/img/**/*')
    .pipe(newer('./build/img'))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 4 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest('./build/img'))
    .pipe(browserSync.stream())
})

gulp.task('webp', function() {
  return gulp
    .src('src/img/**/*.{png,jpg,jpeg}')
    .pipe(
      webp({
        quality: 85
      })
    )
    .pipe(gulp.dest('./build/img'))
    .pipe(browserSync.stream())
})

gulp.task('miscellaneous', function() {
  return gulp
    .src('./src/misc/**/*')
    .pipe(newer('./build/misc'))
    .pipe(gulp.dest('./build/misc'))
    .pipe(browserSync.stream())
})

gulp.task('sprite', function() {
  return gulp
    .src('./src/img/icons/*.svg')
    .pipe(
      svgmin({
        js2svg: {
          pretty: true
        }
      })
    )
    .pipe(rename({ prefix: 'icon-' }))
    .pipe(svgstore())
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('./build/img'))
    .pipe(browserSync.stream())
})

gulp.task(
  'build',
  gulp.series(
    'clean',
    'html',
    'images',
    gulp.parallel('miscellaneous', 'styles', 'scripts', 'sprite', 'webp')
  )
)

gulp.task('default', gulp.series('build', 'serve'))
