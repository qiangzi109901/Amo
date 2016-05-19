require(['dialog','frame','message','prism']);

define('Template',['admin/common','jquery','mselect2','dbtemplate','pager'],function(common,$,mselect2,dbtemplate){

    var searchParam = {
        page : 1,
        pageSize : 10,
        sort : 't2.pid asc,t2.ordinal asc'
    }

    var config = {
        model : 'template',
        updateUrl : '/admin/template/update'
    }


    var Template = {
        init : function(){
            this.initPager();
            this.bindSearchEvent();
            common.bindA(config.model,Template.search);
            this.initSelect();
        },
        initPager : function(){
            window.pager = new Pager("#mypage",{
                fnJump : function(page){
                    Template.search(page);
                }
            });
        },
        initSelect : function(){
            mselect2.ajaxRenderDataAndBind('getLanguages', '#sLang', Template.search);
            mselect2.ajaxRenderDataAndBind('getFirstTempCatalogs', '#sPid', Template.search);
            mselect2.ajaxRenderData('getFirstTempCatalogs', '#aPid');
        },
        search : function(page){
            common.generateSearch(searchParam, page);
            common.searchPage(Template,config.model,searchParam,true,function(){
                // $(".templatePreview").addClass("prettyprint linenums");
                // prettyPrint();
                Prism.highlightAll();
                common.bindU(null, function(id){
                    $("#uFrame").attr('src',config.updateUrl + "/" + id);
                });
                common.bindD(config.model,Template.search);
                Template.bindClickEvent()
            });
        },
        /*******事件绑定区********/
        bindSearchEvent : function(){
            $("#keyword").on('change',function(){
                Template.search();
            });

            $("#sSubmit").click(function(){
                Template.search();
            });
        },
        /**   获取数据 **/
        getById : function(id){
            for(var i in Template.pageData){
                var item = Template.pageData[i];
                if(item.id == id){
                    return item;
                }
            }
            return null;
        },
        bindClickEvent : function(){
            $(".parent-line").each(function(){
                $(this).unbind('click')
                $(this).click(function(){
                    var state = $(this).data('state') || 0;
                    var target = $(this).next('.child-line');
                    if(state == 0){
                        //打开
                        target.slideDown(200);
                        var temp = target.find("code:eq(0)").text();
                        var tarms = dbtemplate.compileWithDemo(temp);
                        target.find("code:eq(1)").text(tarms);
                        Prism.highlightAll();
                    }
                    else{
                        target.slideUp(200);
                    }
                    $(this).data('state',state ? 0 : 1);
                });
            });
        }
    }
    return Template;
});


require(['Template'],function(Template){
    Template.init();
});


function okAdd(){
    $("#aModal").dialog('hide');
    $.success("添加成功");
    require(['Template'],function(Template){
        Template.search();
    });
}


function okUpdate(){
    $("#uModal").dialog('hide');
    $.success("更新成功");
    require(['Template'],function(Template){
        Template.search();
    });
}