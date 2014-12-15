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
function buildDevPages(pages) {
    for (var i = 0, l = pages.length; i < l; i++) {
        var page = pages[i];
        buildDevPage(page);
    }
}
function buildDevPage(page) {
    var basejs = gulp.src(['./src/common/js/*.js'], {read: false});
    var pagejs = gulp.src(['./src/pages/' + page + '/js/*.js'], {read: false});

    var basecss = gulp.src(['./src/common/css/*.css'], {read: false});
    var pagecss = gulp.src(['./src/pages/' + page + '/css/*.css'], {read: false});

    var baseimg = gulp.src(['./src/common/imgs/*.*'], {read: false});
    var pageimg = gulp.src(['./src/pages/' + page + '/imgs/*.*'], {read: false});
    var pageUrl = './build/develop/pages/' + page;
    var fileToMove = ["./src/pages/" + page + "/*", "./src/pages/" + page + "/**/*", "!./src/pages/" + page + "/index.html"];
    gulp.src(fileToMove).pipe(gulp.dest(pageUrl));
    gulp.src('./src/pages/' + page + '/index.html')
    .pipe(inject(basecss, {
        name: 'basecss',
        relative: true,
        addPrefix: staticsource,
        transform: function (filepath, file, i, length) {
            var path=filepath.split(".css")[0];
            return '<link rel="stylesheet" href="'+path+'">';
            //return inject.transform.apply(inject.transform, arguments);
        }
    })).pipe(inject(pagecss, {
        name: 'pagecss',
        relative: true,
        addPrefix: staticsource
    })).pipe(inject(basejs, {
        name: 'basejs',
        relative: true,
        addPrefix: staticsource
    })).pipe(inject(pagejs, {
        name: 'pagejs',
        relative: true,
        addPrefix: staticsource
    })).pipe(gulp.dest('./build/develop/pages/' + page));

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
    var pageUrl = './build/develop/';
    return gulp.src(pageUrl, {read: false}).pipe(clean());

});

gulp.task('build', ['clean'], function () {
    var pageName = argv.name;
    buildDevPage(pageName);
    /*connect.server({
     port: 8888,
     root: 'build/' + buildMode + '/' + pageName,
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

