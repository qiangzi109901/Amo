require(['dialog','frame','message']);

define('Project',['admin/common','jquery','util','comjax','mtemplate','mselect2','pager'],function(common,$,util,comjax,mtemplate,mselect2){

    var searchParam = {
        page : 1,
        pageSize : 10
    }

    var config = {
        model : 'project',
        addUrl : '/db/write'
    }

    var Project = {
        init : function(){
            this.initPager();
            this.initHostSelect();
            this.bindSearchEvent();
            common.bindA(config.addUrl,Project.search);
        },
        initPager : function(){
            window.pager = new Pager("#mypage",{
                fnJump : function(page){
                    Project.search(page);
                }
            });
        },
        initHostSelect : function(){
            mselect2.ajaxRenderDataAndBind('getHosts', '#sHost', Project.search);
        },
        search : function(page){
            searchParam.keyword = $("#keyword").val();
            searchParam.page = page || 1;
            common.searchPage(Project,config.model,searchParam,true,function(){
            });
        },
        /*******事件绑定区********/
        bindSearchEvent : function(){
            $("#keyword").on('change',function(){
                Project.search();
            });

            $("#sSubmit").click(function(){
                Project.search();
            });
        }
    }
    return Project;
});


require(['Project'],function(Project){
    Project.init();
});