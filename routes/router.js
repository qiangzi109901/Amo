
var Index = require('./control/index');
var Filter = require('./control/filter');
var Api = require('./control/api');
var Dbwrite = require('./control/dbwrite')
module.exports = function(app){

    app.use(Filter.renderFilter);
    app.get('/index',Index.index);


    app.post('/db/write',Dbwrite.write);


    //手动构造
    app.get('/admin/template/update/:id',function(req,res,next){
        var id = req.params.id
        req.models.template.get({'id':id},function(err,data){
            console.log(data);
            if(data == null){
                return res.redirect("/404")
            }
            return res.renderPage("/admin/frame/update_template",data);
        });
    });

    //自动渲染后台页面
    app.get(['/admin/*'],Index.auto);

    //错误页面
    app.get('/404', Index.page404);
    app.get('/500', Index.page500);

    app.post('/data/:model/:operation', Api.data);
}