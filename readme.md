##Appollo Framework
此框架用于完成项目框架，项目构建，统计监控等,基于gulp实现，目前还在开发中
###已完成的功能：
- 脚手架快速创建新项目
- 代码压缩合并
- 为静态文件添加hash值，防止浏览器缓存
- 修改后自动刷新页面

###待开发功能：
- weiner的自动注入，二维码扫描，方便移动端开发
- 组件化支持

###自动生成的项目目录结构：

        config/
                config.json(项目配置文件)
                
        docs/ 可以同jsdoc生成代码说明文档
        
        build/（编译后的路径）
        
                static/（静态文件）
                
                        css/
                        
                        imgs/
                        
                        js/
                        
                index/（存放项目的代码，index为一个项目
                        index.html
                                
        src（开发路径）
        
                common/（通用代码及图片，跨项目使用）
                
                        css/
                        
                        imgs/
                        
                        js/
                        
                        _*.html(内部js引入html结构)
                        
                pages/（存放项目的代码，一个page为一个项目）
                
                        index/
                        
                                css/
                                
                                imgs/
                                
                                js/
                                
                                _*.html(内部js引入html结构)
                                
                                index.html
                                

###使用方法：

####创建新项目
        $ gulp new --name erp
这样就创建了一个名为erp的新项目,也可以通过config中配置pages，然后通过gulp new进行多项文件夹创建。

####代码合并&压缩&添加hash值
        $ gulp build 

####实时监控
        $ gulp watch
使用gulp watch 可以编译开发环境并进行预览，当前开发项目通过config.json的developPage指定，同时修改时浏览器会自动更新。

###通过config.json配置相关参数
