require(['dialog','frame','message']);

define('TempCatalog',['admin/common','jquery','mselect2','util','pager'],function(common,$,mselect2,util){

    var searchParam = {
        page : 1,
        pageSize : 10,
        sort : 't1.pid asc,t1.ordinal asc'
    }

    var config = {
        model : 'temp_catalog',
        insertUrl : '/data/temp_catalog/insert',
        updateUrl : '/data/temp_catalog/update',
        moveUrl : '/data/ordinal/move'
    }


    var TempCatalog = {
        init : function(){
            this.initPager();
            this.bindSearchEvent();
            common.bindA(config.model,TempCatalog.search);
            this.initSelect();
        },
        initPager : function(){
            window.pager = new Pager("#mypage",{
                fnJump : function(page){
                    TempCatalog.search(page);
                }
            });
        },
        initSelect : function(){
            mselect2.ajaxRenderDataAndBind('getLanguages', '#sLang', TempCatalog.search);
            mselect2.ajaxRenderDataAndBind('getFirstTempCatalogs', '#sPid', TempCatalog.search);
            mselect2.ajaxRenderData('getFirstTempCatalogs', '#aPid,#uPid');
        },
        search : function(page){
            common.generateSearch(searchParam, page);
            common.searchPage(TempCatalog,config.model,searchParam,true,function(){
                common.bindU(config.model,function(id){
                    common.renderU(TempCatalog, id)
                },function(){
                    TempCatalog.search();
                });
                common.bindD(config.model,TempCatalog.search);
                TempCatalog.bindMoveEvent();
            });
        },
        /*******事件绑定区********/
        bindSearchEvent : function(){
            $("#keyword").on('change',function(){
                TempCatalog.search();
            });

            $("#sSubmit").click(function(){
                TempCatalog.search();
            });
        },
        bindMoveEvent : function(){
            $(".item_move").each(function(){
                $(this).unbind("click");
                $(this).click(function(){
                    util.post(config.moveUrl, {
                        'model' : 'temp_catalog',
                        'sort_field' : 'ordinal',
                        'id' : $(this).data('id'),
                        'move_type' : $(this).data('type'),
                        'pid' : 1,
                        'pid_field' : 'pid'
                    },function(e){
                        console.log(e);
                        TempCatalog.search();
                    })
                });
            });

        }
    }
    return TempCatalog;
});


require(['TempCatalog'],function(TempCatalog){
    TempCatalog.init();
});