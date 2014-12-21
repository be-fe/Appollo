var gulp = require('gulp');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var inject = require("gulp-inject");
var staticsource = "";
var merge = require('merge-stream');
var streamqueue = require('streamqueue');
var clean = require('gulp-clean');

var config = require("./config/config.json");
var buildMode = config.buildMode;
var previewMode = config.previewMode;
var pages = config.pages;
var basePath = config.path;
var curPage = config.developPage;

var argv = require("yargs").argv;
var gulpif = require("gulp-if");

var Path = require('path');
var es = require("event-stream");
var uglify = require("gulp-uglify");
var concat = require("gulp-concat");
var md5 = require("MD5");
var fs = require("fs");
var crypto = require('crypto');
var rename = require("gulp-rename");
var md52 = require('gulp-md5-plus');
var cssmin = require('gulp-cssmin');
var imagemin = require('gulp-imagemin');
var Q = require("q");
var bd = {};
function getMd5(str, len) {
    var md5um = crypto.createHash('md5');
    md5um.update(str, 'utf-8');
    return md5um.digest('hex').substring(0, len);
}
function reloadPage(page) {
    gulp.src(basePath.pagebuild + page + '/*.html').pipe(connect.reload());
}
function createMd5() {
    var Stream = require("stream");
    var stream = new Stream.Transform({objectMode: true});

    function parsePath(path) {
        var extname = Path.extname(path);
        return {
            dirname: Path.dirname(path),
            basename: Path.basename(path, extname),
            extname: extname
        };
    }

    stream._transform = function (file, unused, callback) {
        var parsedPath = parsePath(file.relative);
        var path;
        var _md5 = getMd5(file.contents, 6);
        path = parsedPath.basename + "_" + _md5 + parsedPath.extname;
        file.path = Path.join(file.base, path);
        callback(null, file);

    };
    return stream;

}
function getURLList(type, page) {
    if (type == 'html') {
        return {
            pagesrc:   basePath.pagesrc + page + "/index.html",
            pagebuild: basePath.pagebuild + page + "/"
        }
    }
    var urls = {
        pagesrc: [basePath.pagesrc + page + "/" + type + "/*"],
        pagebuild:   basePath.pagebuild + page + "/" + type + "/",
        commonsrc: [basePath.commonsrc + type + "/*"],
        commonbuild: basePath.commonbuild + type + "/"
    }
    return urls;
}
function concatFile(type, pageurl) {
    var func = type === 'css' ? cssmin : uglify;
    var opts = type === 'css' ? {'noAdvanced': true} : {};
    if (type === "imgs") {
        gulp.src(pageurl.pagesrc).pipe(imagemin()).pipe(gulp.dest(pageurl.pagebuild));
        gulp.src(pageurl.commonsrc).pipe(imagemin()).pipe(gulp.dest(pageurl.commonbuild));
        return;
    }
    gulp.src(pageurl.pagesrc).pipe(concat("main." + type)).pipe(func(opts)).pipe(createMd5()).pipe(gulp.dest(pageurl.pagebuild));

    gulp.src(pageurl.commonsrc).pipe(concat("base." + type)).pipe(func(opts)).pipe(createMd5()).pipe(gulp.dest(pageurl.commonbuild));

}
function compile(urls) {
    var cssurl = urls.cssurl;
    var jsurl = urls.jsurl;
    var imgurl = urls.imgurl;
    var htmlurl = urls.htmlurl;
    gulp.src(htmlurl.pagebuild + "index.html").pipe(inject(gulp.src([jsurl.pagebuild + "*.js"]), {
        relative: true,
        name: 'pagejs',
        addPrefix: staticsource
    })).pipe(inject(gulp.src([jsurl.commonbuild + "*.js"]), {
        relative: true,
        name: 'basejs',
        addPrefix: staticsource
    })).pipe(inject(gulp.src([cssurl.pagebuild + "*.css"]), {
        relative: true,
        name: 'pagecss',
        addPrefix: staticsource
    })).pipe(inject(gulp.src([cssurl.commonbuild + "*.css"]), {
        relative: true,
        name: 'basecss',
        addPrefix: staticsource
    })).pipe(gulp.dest(htmlurl.pagebuild));
    return;
}
function buildPage(page) {
    var cssurl = getURLList('css', page);
    var jsurl = getURLList('js', page);
    var imgurl = getURLList('imgs', page);
    var htmlurl = getURLList('html', page);

    concatFile('css', cssurl);
    concatFile('js', jsurl);
    concatFile('imgs', imgurl);
    if (bd.iscompile) clearTimeout(bd.iscompile);
    bd.iscompile = setTimeout(function () {
        compile({
            cssurl: cssurl,
            jsurl: jsurl,
            imgurl: imgurl,
            htmlurl: htmlurl
        });
    }, 2000);

}
gulp.task("clean", function () {
    var page = curPage;
    var pageUrl = basePath.pagebuild + page;
    var stream1 = gulp.src(basePath.commonbuild, {read: false}).pipe(clean());
    var stream2 = gulp.src(pageUrl, {read: false}).pipe(clean());
    return merge(stream1, stream2);
});
gulp.task("move", ["clean"], function () {
    var page = curPage;
    var htmlurl = getURLList('html', page);
    return gulp.src(htmlurl.pagesrc).pipe(gulp.dest(htmlurl.pagebuild));
});
gulp.task("build", ['move'], function () {
    buildPage(curPage);
});
gulp.task("server", function () {
    if (!config.startServer) return;
    connect.server({
        port: 8888,
        root: "",
        livereload: true,
        addRootSlash: false
    });
});
gulp.task("watch", function () {
    gulp.run('server');
    var staticSrc = [basePath.pagesrc + curPage + '/*', basePath.pagesrc + curPage + '/**/*', basePath.pagesrc + curPage + '/**/**/*'];
    gulp.watch(staticSrc, function () {
        gulp.run('build');
        if(bd.isRefresh) clearTimeout(bd.isRefresh);
        bd.isRefresh=setTimeout(function () {
            reloadPage(curPage);
        }, 3000);
    });

});


