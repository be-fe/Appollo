##Mobile Framework
#传统开发方式弊端：

        每次开发都得新建文件夹目录
        
        目录结构组织不够合理
        
        需通过gulp或者grunt代码合并压缩工具
        
        手动引入静态资源，并且未能生成时间戳，上线时可能因为缓存而导致线上bug
        
        修改完后得手动进行浏览器刷新才能看到修改效果
        
        html结构与js代码混在一起，不便于看清结构

#此框架解决以上问题，并构建基本的js框架，以及统计监控等,基于gulp实现，目前还在开发中

#目录结构为：

        config/
                config.json(项目配置文件)
                
        docs/ 可以同jsdoc生成代码说明文档
        
        build/（编译后的路径）
        
                common/（通用代码及图片，跨项目使用）
                
                        css/
                        
                        imgs/
                        
                        js/
                        
                pages/（存放项目的代码，一个page为一个项目
                
                        index/
                        
                                css/
                                
                                imgs/
                                
                                js/
                                
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
                                

#使用方法：

##使用gulp new --name erp
        可以创建一个新项目erp,也可以通过config中配置pages，然后通过gulp new进行多项文件夹创建

##使用gulp watch 可以编译开发环境并进行预览

##通过config.json配置相关参数
