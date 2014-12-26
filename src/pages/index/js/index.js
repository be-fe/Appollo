/**
 * Created by liuhui01 on 2014/12/10.
 */
var main=123;
console.log("index.js--load");
var tpl=__inline("../html/_head.html");
var tpl2=__inline("../html/_content.html");
document.querySelector(".div3").innerHTML=ejs.render(tpl2,{
    title:"this is ejs test"
});
