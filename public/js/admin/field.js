require(['dialog','frame','message']);

define('Field',['admin/common','jquery','util','mtemplate','mselect2','casecade','pager'],function(common,$,util,mtemplate,mselect2,casecade){

    var searchParam = {
        page : 1,
        pageSize : 10,
        sort : 'ordinal asc'
    }

    var config = {
        model : 'db_field'
    }
    var Field = {
        init : function(){
            this.initPager();
            this.bindSearchEvent();
            this.initSelect();
        },
        initPager : function(){
            window.pager = new Pager("#mypage",{
                fnJump : function(page){
                    Field.search(page);
                }
            });
        },
        initSelect : function(){
            casecade.init({
                ids : ['#sHost',"#sDb",'#sTable'],
                urls : ['/data/db_config/getHost','/data/db_config/getDbByHost','/data/db_table/getTableByDb'],
                length : 3,
                defaultMsgs : ['','全部数据库','全部数据表'],
                cb : Field.search
            });
        },
        search : function(page){
            searchParam.host = mselect2.value('#sHost');
            searchParam.db_id = mselect2.value('#sDb');
            searchParam.table_id = mselect2.value('#sTable');
            searchParam.keyword = $("#keyword").val();
            searchParam.page = page || 1;
            common.searchPage(Field,config.model,searchParam,true,function(){

            });
        },
        /*******事件绑定区********/
        bindSearchEvent : function(){
            $("#keyword").on('change',function(){
                Field.search();
            });

            $("#sSubmit").click(function(){
                Field.search();
            });
        }
    }
    return Field;
});


require(['Field'],function(Field){
    Field.init();
});