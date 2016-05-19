require(['dialog','frame','message']);

define('TempCatalog',['admin/common','jquery','mselect2','pager'],function(common,$,mselect2){

    var searchParam = {
        page : 1,
        pageSize : 10,
        sort : 'pid asc,ordinal asc'
    }

    var config = {
        model : 'temp_catalog',
        insertUrl : '/data/temp_catalog/insert',
        updateUrl : '/data/temp_catalog/update'
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
            searchParam.lang = mselect2.value('#sLang');
            searchParam.keyword = $("#keyword").val();
            if(typeof page == 'number'){
                searchParam.page = page;
            }
            else{
                searchParam.page = 1
            }
            common.searchPage(TempCatalog,config.model,searchParam,true,function(){
                common.bindU(config.model,function(id){
                    common.renderU(TempCatalog, id)
                },function(){
                    TempCatalog.search();
                });
                common.bindD(config.model,TempCatalog.search);
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
        /**   获取数据 **/
        getById : function(id){
            for(var i in TempCatalog.pageData){
                var item = TempCatalog.pageData[i];
                if(item.id == id){
                    return item;
                }
            }
            return null;
        }
    }
    return TempCatalog;
});


require(['TempCatalog'],function(TempCatalog){
    TempCatalog.init();
});