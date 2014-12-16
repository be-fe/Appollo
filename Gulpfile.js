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
var argv = require("yargs").argv;
var gulpif = require("gulp-if");
var buildMode = config.buildMode;
var previewMode = config.previewMode;
var pages = config.pages;
var path = require('path');
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
function buildDevPages(pages) {
    for (var i = 0, l = pages.length; i < l; i++) {
        var page = pages[i];
        buildPage(page);
    }
}
function getMd5(p) {
    var str = fs.readFileSync(p, 'utf-8');
    var md5um = crypto.createHash('md5');
    md5um.update(str);
    return md5um.digest('hex');
}

function watchPage(page, mode) {
    var baseUrl = mode == "develop" ? "./src/pages/" : "./build/";
    var staticSrc = [baseUrl + page + '/*', baseUrl + page + '/**/*', baseUrl + page + '/**/**/*'];
    gulp.watch(staticSrc, function () {
        reloadPage(page);
    });
}

function reloadPage(page) {
    gulp.src('./src/pages/' + page + '/*.html').pipe(connect.reload());
}
function newPage(pageName) {
    var fileToMove = ["./src/pages/_example/*", "./src/pages/_example/**/*"];
    gulp.src(fileToMove).pipe(gulp.dest('./src/pages/' + pageName));
}
gulp.task('clean', function () {
    var page = argv.name;
    var pageUrl = './build/develop/' + page;
    return gulp.src(pageUrl, {read: false}).pipe(clean());

});
function getURLList(type, page) {
    if (type == 'html') {
        return {
            pagesrc:   "./src/pages/" + page + "/index.html",
            pagebuild: './build/develop/pages/' + page + "/"
        }
    }
    var urls = {
        pagesrc: ["./src/pages/" + page + "/" + type + "/*"],
        pagebuild:   './build/develop/pages/' + page + "/" + type + "/",
        commonsrc: ["./src/common/" + type + "/*"],
        commonbuild: './build/develop/common/' + type + "/"
    }
    return urls;
}

function buildPage(page) {
    var cssurl = getURLList('css', page);
    var jsurl = getURLList('js', page);
    var imgurl = getURLList('imgs', page);
    concatFile('css', cssurl);
    concatFile('js', jsurl);
    concatFile('imgs', imgurl);
    var htmlurl = getURLList('html', page);

    gulp.src(htmlurl.pagebuild + "index.html").pipe(inject(gulp.src([jsurl.pagebuild + "*.js", "!" + jsurl.pagebuild + "*.min.js"]), {
        relative: true,
        name: 'pagejs',
        addPrefix: staticsource,
        transform: function (filepath, file, i, length) {
            var path = filepath.split(".js")[0];
            var mds=md5(file).slice(-6);
            console.log(file);
            console.log(mds,path);
            return '<link rel="stylesheet" href="' + path +'_'+mds+ '.js">';
            //return inject.transform.apply(inject.transform, arguments);
        }
    })).pipe(inject(gulp.src([jsurl.commonbuild + "*.js", "!" + jsurl.commonbuild + "*.min.js"]), {
        relative: true,
        name: 'basejs',
        addPrefix: staticsource
    })).pipe(inject(gulp.src([cssurl.pagebuild + "*.css", "!" + cssurl.pagebuild + "*.min.css"]), {
        relative: true,
        name: 'pagecss',
        addPrefix: staticsource
    })).pipe(inject(gulp.src([cssurl.commonbuild + "*.css", "!" + cssurl.commonbuild + "*.min.css"]), {
        relative: true,
        name: 'basecss',
        addPrefix: staticsource
    })).pipe(gulp.dest(htmlurl.pagebuild));
}

gulp.task('move', ['clean'], function () {
    var page = argv.name;
    var htmlurl = getURLList('html', page);
    return gulp.src(htmlurl.pagesrc).pipe(gulp.dest(htmlurl.pagebuild));
});


function concatFile(type, pageurl) {
    var func = type === 'css' ? cssmin : uglify;
    if (type === "imgs") {
        gulp.src(pageurl.pagesrc).pipe(imagemin()).pipe(gulp.dest(pageurl.pagebuild));
        gulp.src(pageurl.commonsrc).pipe(imagemin()).pipe(gulp.dest(pageurl.commonbuild));
        return;
    }

    gulp.src(pageurl.pagesrc).pipe(concat("main." + type)).pipe(gulp.dest(pageurl.pagebuild)).pipe(func()).pipe(rename({extname: '.min.' + type})).pipe(gulp.dest(pageurl.pagebuild));
    gulp.src(pageurl.commonsrc).pipe(concat("base." + type)).pipe(gulp.dest(pageurl.commonbuild)).pipe(func()).pipe(rename({extname: '.min.' + type})).pipe(gulp.dest(pageurl.commonbuild));

}

gulp.task('build', ['move'], function () {
    var page = argv.name;
    buildPage(page);
    /*connect.server({
     port: 8888,
     root: "",
     livereload: true,
     addRootSlash: false
     });*/

});
gulp.task('new', function () {
    var pageName = argv.name;
    if (!pageName) {
        for (var i = 0, l = pages.length; i < l; i++) {
            pageName = pages[i];
            var fileurl = './src/pages/' + pageName;
            path.exists(fileurl, function (exists) {
                if (!exists) {
                    newPage(pageName);
                }
            });
        }
    } else {
        newPage(pageName);
    }
});
gulp.task('watch', function () {

});

gulp.task('default', ['build']);

