require(['message']);

define('Template',['jquery','util','casecade','editor','mselect2','data/demo','dbtemplate'],function($,util,casecade,editor,mselect2,data, mtemplate){

    var config = {
        model : 'template',
        updateUrl : '/data/template/update',
        getUrl : '/data/template/get'
    }

    var Template = {

        init : function(){

            this.initSelect();
            editor.init("contentEditor");
            try{
                editor.setValue($("#contentEditor").data('default') + "" || '');
            }
            catch (e){
                console.log(e)
            }
            this.bindAddEvent();
            this.bindRenderEvent();
        },
        initSelect : function(){
            casecade.init({
                ids: ['#uCatalog1', "#uCatalog2"],
                urls: ['/data/temp_catalog/listByPid?val=0', '/data/temp_catalog/listByPid'],
                length: 2,
                defaultMsgs: ['',''],
                cb: null
            });
            mselect2.renderAndBind("#uLang",function(val){
                editor.setMode(val);
            });
        },
        bindAddEvent: function () {
            $("#uSubmit").click(function(){
                var param = util.form2param("#uForm");
                param.content = editor.getValue();
                util.post(config.updateUrl,param,function(){
                    $.success("更新成功");
                    parent.okUpdate && parent.okUpdate();
                });
            });
        },
        bindRenderEvent : function(){
            $("#btnRender").click(function(){
                var source = editor.getValue();
                var result = mtemplate.compile(source,data);
                $("#previewArea").val(result);
            });

            $("#btnZipRender").click(function(){
                var source = editor.getValue();
                var result = mtemplate.zipCompile(source,data);
                $("#previewArea").val(result);
            });

            $("#btnSave").click(function(){
                window.localStorage.setItem("code", editor.getValue());
            });
        },
        getTemlateInfo : function(id,cb){
            util.post(config.getUrl,{'id':id},cb);
        }
    }
    return Template;
});


require(['Template'],function(Template){
    Template.init();
});