<link rel="stylesheet" href="http://yandex.st/highlightjs/6.2/styles/googlecode.min.css">
 
<script src="http://code.jquery.com/jquery-1.7.2.min.js"></script>
<script src="http://yandex.st/highlightjs/6.2/highlight.min.js"></script>
 
<script>hljs.initHighlightingOnLoad();</script>
<script type="text/javascript">
 $(document).ready(function(){
      $("h2,h3,h4,h5,h6").each(function(i,item){
        var tag = $(item).get(0).localName;
        $(item).attr("id","wow"+i);
        $("#category").append('<a class="new'+tag+'" href="#wow'+i+'">'+$(this).text()+'</a></br>');
        $(".newh2").css("margin-left",0);
        $(".newh3").css("margin-left",20);
        $(".newh4").css("margin-left",40);
        $(".newh5").css("margin-left",60);
        $(".newh6").css("margin-left",80);
      });
 });
</script>
<div id="category"></div>

============

##Appollo Framework

此框架用于完成项目框架，项目构建，统计监控等,基于gulp实现，目前还在开发中

=========
###已完成的功能
- 脚手架快速创建新项目
- 代码压缩合并
- 为静态文件添加hash值，防止浏览器缓存
- 修改后自动刷新页面

===========



###待开发功能：
- weiner的自动注入，二维码扫描，方便移动端开发
- 组件化支持


==========


###约定目录结构：

<pre>
├── build（编译路径）      
│   └── product
│       ├── index（项目文件）     
│       │   ├── css     
│       │   ├── html     
│       │   ├── imgs     
│       │   └── js     
│       └── static（通用静态文件）    
│           ├── css     
│           ├── imgs     
│           └── js     
├── config（项目配置文件）     
└── src （开发路径）    
    ├── common  （通用js、css、image，跨项目使用）   
    │   ├── css     
    │   ├── imgs     
    │   └── js     
    ├── pages     
    │   ├── _example  （默认项目demo，以次来构建新项目）   
    │   │   ├── css     
    │   │   ├── html  （存放dom结构，为html格式）     
    │   │   ├── imgs     
    │   │   └── js     
    │   └── index  （存放项目的代码）   
    │       ├── css     
    │       ├── html     
    │       ├── imgs     
    │       └── js     
    └── utils     
        └── islider     
</pre>
                                

###使用方法：

	$ gulp

####创建新项目
	$ gulp new --name erp
这样就创建了一个名为erp的新项目,也可以通过config中配置pages，然后通过gulp new进行多项文件夹创建。

####代码合并&压缩&添加hash值
	$ gulp build 

####实时监控
	$ gulp watch
使用gulp watch 可以编译开发环境并进行预览，当前开发项目通过config.json的developPage指定，同时修改时浏览器会自动更新。

======

###通过config.json配置相关参数
