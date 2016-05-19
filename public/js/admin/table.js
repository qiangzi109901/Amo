require(['dialog','frame','message']);

define('Table',['admin/common','jquery','util','comjax','mtemplate','mselect2','casecade','pager'],function(common,$,util,comjax,mtemplate,mselect2,casecade){

    var searchParam = {
        page : 1,
        pageSize : 10
    }

    var config = {
        model : 'db_table'
    }

    var Table = {
        init : function(){
            this.initSelect();
            this.initPager();
            this.bindSearchEvent();
        },
        initPager : function(){
            window.pager = new Pager("#mypage",{
                fnJump : function(page){
                    Table.search(page);
                }
            });
        },
        initSelect : function(){
            casecade.init({
                ids: ['#sHost', "#sDb"],
                urls: ['/data/db_config/getHost', '/data/db_config/getDbByHost'],
                length: 2,
                defaultMsgs: ['', '全部数据库'],
                cb: Table.search
            });
        },
        search : function(page){
            searchParam.host = mselect2.value("#sHost");
            searchParam.db_id = mselect2.value("#sDb") ;
            searchParam.keyword = $("#keyword").val();
            searchParam.page = page || 1;
            common.searchPage(Table,config.model,searchParam,true,function(){

            });
        },
        /*******事件绑定区********/
        bindSearchEvent : function(){
            $("#keyword").on('change',function(){
                Table.search();
            });

            $("#sSubmit").click(function(){
                Table.search();
            });
        }
    }
    return Table;
});


require(['Table'],function(Table){
    Table.init();
});