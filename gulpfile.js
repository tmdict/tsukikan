const { dest, parallel, series, src } = require('gulp');
const changed = require('gulp-changed');
const concat = require('gulp-concat');
const data = require('gulp-data');
const frontmatter = require('front-matter');
const marked = require('marked');
const print = require('gulp-print').default;
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const sitemap = require('gulp-sitemap');
const uglify = require('gulp-uglify');
const wrap = require('gulp-wrap');

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
    .pipe(changed('dist'), { hasChanged: changed.compareSha1Digest })
    .pipe(dest('dist'))
    .pipe(print());
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
    .pipe(changed('dist/tmdb'), { hasChanged: changed.compareSha1Digest })
    .pipe(dest('dist/tmdb'))
    .pipe(print());
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
    .pipe(changed('dist/src'), { hasChanged: changed.compareSha1Digest })
    .pipe(dest('dist/src'))
    .pipe(print());
}

function buildStaticFiles() {
  return src(path.assets + 'static/**/*')
    .pipe(changed('dist'), { hasChanged: changed.compareSha1Digest })
    .pipe(dest('dist'))
    .pipe(print());
}

function buildCss() {
  return src(path.assets + 'css/tsukikan.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(rename('style.min.css'))
    .pipe(changed('dist/src'), { hasChanged: changed.compareSha1Digest })
    .pipe(dest('dist/src'))
    .pipe(print());
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
    .pipe(print());
}

exports.default = series(
  parallel(buildHtml, buildTmdbHtml, buildTmdbJson),
  parallel(buildCss, buildStaticFiles),
  buildSitemap
);
