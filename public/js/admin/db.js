require(['dialog','frame','message']);

define('Db',['admin/common','jquery','util','comjax','mtemplate','mselect2','pager'],function(common,$,util,comjax,mtemplate,mselect2){

    var searchParam = {
        page : 1,
        pageSize : 10
    }

    var config = {
        model : 'db_config',
        addUrl : '/db/write'
    }

    var Db = {
        init : function(){
            this.initPager();
            this.initHostSelect();
            this.bindSearchEvent();
            common.bindA(config.addUrl,Db.search);
        },
        initPager : function(){
            window.pager = new Pager("#mypage",{
                fnJump : function(page){
                    Db.search(page);
                }
            });
        },
        initHostSelect : function(){
            mselect2.ajaxRenderDataAndBind('getHosts', '#sHost', Db.search);
        },
        search : function(page){
            searchParam.keyword = $("#keyword").val();
            searchParam.page = page || 1;
            common.searchPage(Db,config.model,searchParam,true,function(){
            });
        },
        /*******事件绑定区********/
        bindSearchEvent : function(){
            $("#keyword").on('change',function(){
                Db.search();
            });

            $("#sSubmit").click(function(){
                Db.search();
            });
        }
    }
    return Db;
});


require(['Db'],function(Db){
    Db.init();
});