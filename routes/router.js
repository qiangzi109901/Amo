
var Index = require('./control/index');
var Filter = require('./control/filter');
var Api = require('./control/api');
var Dbwrite = require('./control/dbwrite');
var Log = require('../modules/log')
var Project = require('./control/project')
var fs = require('fs');
function redirect(app,urls){
    for(var key in urls){
        !function(key,val){
            app.get(key, function(req,res){
                res.redirect(val);
            });
        }(key,urls[key]);
    }
}


module.exports = function(app){

    app.use(Filter.renderFilter);
    app.use(Filter.logFilter);
    app.get('/',Index.index);


    app.post('/download/code', function(req,res){

        var content = req.body.content;
        var filename = req.body.filename;

        var tempfile = 'log/code/' + new Date().getTime() + ".code";
        var writer = fs.createWriteStream(tempfile);
        writer.end(content);

        writer.on('finish', () => {
            Log.info("write ok")
            res.download(tempfile,filename,function(err){
                if(err){
                    Log.error('download failed')
                }
                else{
                    Log.info('download success')
                }
            });
        })
        
    });

    app.post('/db/write',Dbwrite.write);
    app.post('/db/refresh',Dbwrite.refresh);
    app.post('/db/refreshTable',Dbwrite.refreshTable);
    app.all('/project/make/:id', Project.make)

    //手动构造
    app.get('/admin/template/update/:id',function(req,res,next){
        var id = req.params.id
        req.models.template.get({'id':id},function(err,data){
            if(data == null){
                return res.redirect("/404")
            }
            return res.renderPage("/admin/frame/update_template",data);
        });
    });


    //重定向
    redirect(app,{
        '/project/new' : '/project'
    });


    app.get('/project/open', function(req,res){
        req.models.project.all().
            then(function(data){
                res.renderPage("open",{"projects" :  data});
            });
    });

    //错误页面
    app.get('/404', Index.page404);
    app.get('/500', Index.page500);


    //自动渲染前端页面
    app.get('/*', Index.auto)

    app.post('/data/:model/:operation', Api.data);
}