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
function buildDevPages(pages) {
    for (var i = 0, l = pages.length; i < l; i++) {
        var page = pages[i];
        buildPage(page);
    }
}
function getMd5(str, len) {
    //var str = fs.readFileSync(p, 'utf-8');
    var md5um = crypto.createHash('md5');
    md5um.update(str, 'utf-8');
    return md5um.digest('hex').substring(0, len);
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

function reloadPage(page) {
    gulp.src(basePath.pagebuild + page + '/*.html').pipe(connect.reload());
}
function newPage(pageName) {
    var fileToMove = [basePath.pagesrc + "_example/*", basePath.pagesrc + "_example/**/*"];
    gulp.src(fileToMove).pipe(gulp.dest(basePath.pagesrc + pageName));
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

function buildPage(page) {
    var cssurl = getURLList('css', page);
    var jsurl = getURLList('js', page);
    var imgurl = getURLList('imgs', page);
    var htmlurl = getURLList('html', page);

    concatFile('css', cssurl);
    concatFile('js', jsurl);
    concatFile('imgs', imgurl);
    setTimeout(function () {
        compile({
            cssurl: cssurl,
            jsurl: jsurl,
            imgurl: imgurl,
            htmlurl: htmlurl
        });
    }, 2000);

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

function concatFile(type, pageurl) {
    var func = type === 'css' ? cssmin : uglify;
    if (type === "imgs") {
        gulp.src(pageurl.pagesrc).pipe(imagemin()).pipe(gulp.dest(pageurl.pagebuild));
        gulp.src(pageurl.commonsrc).pipe(imagemin()).pipe(gulp.dest(pageurl.commonbuild));
        return;
    }
    gulp.src(pageurl.pagesrc).pipe(concat("main." + type)).pipe(func()).pipe(createMd5()).pipe(gulp.dest(pageurl.pagebuild));

    gulp.src(pageurl.commonsrc).pipe(concat("base." + type)).pipe(func()).pipe(createMd5()).pipe(gulp.dest(pageurl.commonbuild));

}
function cleanPage(page) {
    var pageUrl = basePath.pagebuild + page;
    return gulp.src(pageUrl, {read: false}).pipe(clean());
}

gulp.task('new', function () {
    var pageName = argv.name;
    if (!pageName) {
        for (var i = 0, l = pages.length; i < l; i++) {
            pageName = pages[i];
            var fileurl = basePath.pagesrc + pageName;
            Path.exists(fileurl, function (exists) {
                if (!exists) {
                    newPage(pageName);
                }
            });
        }
    } else {
        newPage(pageName);
    }
});
gulp.task('cleanPage', function () {
    var page = argv.name;
    console.log(page);
    return cleanPage(page);

});
gulp.task('cleancommon', function () {
    return gulp.src(basePath.commonbuild, {read: false}).pipe(clean());
});
gulp.task('move', ['cleanPage', 'cleancommon'], function () {
    var page = argv.name;
    var htmlurl = getURLList('html', page);
    return gulp.src(htmlurl.pagesrc).pipe(gulp.dest(htmlurl.pagebuild));
});



gulp.task('start', function () {
    if (!config.startServer) return;
    connect.server({
        port: 8888,
        root: "",
        livereload: true,
        addRootSlash: false
    });
});

gulp.task("watch",['start'], function () {
    var currentPage = argv.name;
    var staticSrc = [basePath.pagesrc + currentPage + '/*', basePath.pagesrc + currentPage + '/**/*', basePath.pagesrc + currentPage + '/**/**/*'];
    gulp.watch(staticSrc,function () {
        gulp.run("move");
        buildPage(currentPage);
    });
    return;
    var buildSrc = [basePath.pagebuild + currentPage + '/*.html'];
    gulp.watch(buildSrc, function () {
        reloadPage(currentPage);
    });

});




