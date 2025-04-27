import { dest, parallel, series, src } from 'gulp';
import concat from 'gulp-concat';
import data from 'gulp-data';
import frontmatter from 'front-matter';
import { marked } from 'marked';
import print from 'gulp-print';
import rename from 'gulp-rename';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';
import sitemap from 'gulp-sitemap';
import uglify from 'gulp-uglify';
import wrap from 'gulp-wrap';

const sass = gulpSass(dartSass);
const printDefault = print.default;

const path = {
  template: 'src/template/',
  pages: 'src/pages/',
  assets: 'src/assets/',
};

function buildHtml() {
  return src(path.pages + 'html/**/*.html')
    .pipe(
      data(function (file) {
        const content = frontmatter(String(file.contents));
        file.contents = Buffer.from(content.body);
        const fm = { attr: content['attributes'] };
        return fm;
      })
    )
    .pipe(wrap({ src: path.template + '_page.html' }))
    .pipe(dest('dist'))
    .pipe(printDefault());
}

function buildTmdbHtml() {
  return src(path.pages + 'tmdb/*.md')
    .pipe(
      data(function (file) {
        const content = frontmatter(String(file.contents));
        file.contents = Buffer.from(content.body);
        const fm = { attr: content['attributes'] };
        return fm;
      })
    )
    .pipe(
      data(function (file) {
        file.contents = Buffer.from(marked.parse(String(file.contents)));
      })
    )
    .pipe(wrap({ src: path.template + '_tmdb.html' }))
    .pipe(
      rename(function (path) {
        path.extname = '.html';
      })
    )
    .pipe(dest('dist/tmdb'))
    .pipe(printDefault());
}

function buildTmdbJson() {
  return src(path.pages + 'tmdb/*.md')
    .pipe(
      data(function (file) {
        const content = frontmatter(String(file.contents));
        file.contents = Buffer.from(content.body);
        const fm = { attr: content['attributes'] };
        return fm;
      })
    )
    .pipe(wrap({ src: path.template + '/_tmdb.json' }))
    .pipe(concat('db.js', { newLine: ',\r\n' }))
    .pipe(
      wrap('const db = {\r\n  "version":"<%= ver %>",\r\n  "data":[\r\n<%= contents %>\r\n  ]\r\n};', {
        ver: '2015.3.14',
      })
    )
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(dest('dist/src'))
    .pipe(printDefault());
}

function buildStaticFiles() {
  return src(path.assets + 'static/**/*', { encoding: false })
    .pipe(dest('dist'))
    .pipe(printDefault());
}

function buildCss() {
  return src(path.assets + 'css/tsukikan.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(rename('style.min.css'))
    .pipe(dest('dist/src'))
    .pipe(printDefault());
}

function buildSitemap() {
  return src('dist/**/*.html')
    .pipe(
      sitemap({
        siteUrl: 'https://www.tsukikan.com',
        changefreq: 'yearly',
        priority: 1.0,
      })
    )
    .pipe(dest('dist'))
    .pipe(printDefault());
}

export default series(
  parallel(buildHtml, buildTmdbHtml, buildTmdbJson),
  parallel(buildCss, buildStaticFiles),
  buildSitemap
);
