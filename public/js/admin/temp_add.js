require(['message']);

define('Template',['jquery','util','casecade','editor','mselect2','data/demo','dbtemplate'],function($,util,casecade,editor,mselect2,data, mtemplate){

    var config = {
        model : 'template',
        insertUrl : '/data/template/insert'
    }

    var Template = {

        init : function(){
            this.initSelect();
            editor.init("contentEditor");
            editor.setValue(window.localStorage.getItem("code") || '');
            this.bindAddEvent();
            this.bindRenderEvent();
        },
        initSelect : function(){
            casecade.init({
                ids: ['#aCatalog1', "#aCatalog2"],
                urls: ['/data/temp_catalog/listByPid?val=0', '/data/temp_catalog/listByPid'],
                length: 2,
                defaultMsgs: ['',''],
                cb: null
            });
            mselect2.renderAndBind("#aLang",function(val){
                editor.setMode(val);
            });

            mselect2.renderAndBind("#aTheme", function(val){
                editor.setTheme(val);
            });
        },
        bindAddEvent: function () {
            $("#aSubmit").click(function(){
                var param = util.form2param("#aForm");
                param.content = editor.getValue();
                console.log(param);
                util.post(config.insertUrl,param,function(){
                    $.success("添加成功");
                    editor.reinit();
                    parent.okAdd && parent.okAdd();
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
                console.log(result);
                $("#previewArea").val(result);
            });

            $("#btnSave").click(function(){
                window.localStorage.setItem("code", editor.getValue());
            });
        }
    }
    return Template;
});


require(['Template'],function(Template){
    Template.init();
});