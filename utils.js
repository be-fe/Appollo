/**
 * Created by liuhui01 on 2014/12/17.
 */
module.exports = {
    absPath: function (rPath, basePath) {

        rPath = rPath.replace(/^\.\/(.*)/, '$1');
        basePath = basePath.replace(/(.*)\/$/, '$1');
        while (/^\.\./.test(rPath)) {
            basePath = basePath.substring(0, basePath.lastIndexOf('/'));
            rPath = rPath.substring(3);
        }
        return basePath + '/' + rPath;
    },
    realPath: function (path) {
        path = path.replace(/\\/g, '/');
        return path;
    },
    replaceQuotes: function (text) {
        text = text
        .replace(/"/g, '\"')
        .replace(/'/g, '\'')
        .replace(/[\n\r\t]/g, '');
        return text;
    }

};