
define('Project', ['jquery','common','casecade','mselect2','util','mtemplate','mclip','toputil','prism'],function($,common,casecade,mselect2,util,mtemplate,mclip,toputil){
    var config = {
        addUrl : '/data/project/insert',
        getProjectInfoUrl : '/data/project/get',
        makeProjectUrl : '/project/make/',
        getProjectFileUrl : '/data/project_file/listByProject'
    };

    var Project = {
        init : function(){
            this.initSelect();
            this.bindEvent();
        },
        initSelect : function(){
            casecade.init({
                length : 2,
                ids : ['#aHost', '#aDb'],
                urls : ['/data/db_config/getHost','/data/db_config/getDbByHost']
            });

            mselect2.renderAndBind('#aType', function(val){
                if(val == 'NODE'){
                    $("#java_form").fadeOut();
                }
                else{
                    $("#java_form").fadeIn();
                }
            });
        },
        bindEvent : function(){
            $("#aSubmit").click(function(){
                console.log(util.form2param('#aForm'))
                $("#aSubmit").unbind("click");
                util.post(config.addUrl, util.form2param('#aForm'),function(data){
                    util.post('/project/make/' + data);
                    setTimeout(function(){
                        location.href = "/project/open";
                    },100);                    
                });

            });
            var oldBasePackage = $("#base_package").val();
            $("#base_package").on("input",function(){
                newBasePackage = $(this).val();
                console.log(oldBasePackage  + "---" + newBasePackage);
                $(".package_input").each(function(){
                    var oldValue = $(this).val();
                    var newValue = oldValue.replace(oldBasePackage, newBasePackage);
                    $(this).val(newValue);
                });
                oldBasePackage = newBasePackage;
            });
        },
        initOpen : function(){
            $(".project_item").each(function(){
                $(this).click(function(){

                    $(".project_item").removeClass("active");
                    $(this).addClass("active");

                    if(!Project.info || Project.info.id != $(this).data('id')){
                        var info = util.postAndGet(config.getProjectInfoUrl,{'id' : $(this).data('id')});
                        Project.info = info;

                        var data = util.postAndGet(config.getProjectFileUrl, {"projectId" : $(this).data('id')});
                        if(data != null){
                            console.log(data);
                            //保存数据
                            var rst = [];
                            for(var i in data){
                                common.pushAll(rst, data[i].files || []);
                            }
                            Project.files = rst;
                            var mhtml = mtemplate.render("temp_menus",{"catalogs" : data});
                            $("#side_catalog_content").html(mhtml);
                            Project.bindCatalogOpenAnimate();
                            Project.bindProjectFileClick();
                        }
                    }

                    if(Project.info.type == "JAVA"){
                        var mhtml = mtemplate.render("temp_info_java",Project.info);
                        $("#info_content").html(mhtml);
                        $("#code_content").hide();
                    }

                    Project.showInfo();
                });
            });

            $(".project_make").each(function(){
                $(this).click(function(){
                    var id = $(this).data('id');
                    util.postAndGet(config.makeProjectUrl + id);

                });
            });
            $("#side_totop").click(function(){
                toputil.totop(300);
            })
            mclip.setClip("#btn_copy");
        },
        bindCatalogOpenAnimate : function(){
            $(".menu_catalog").each(function(){
                $(this).click(function(){
                    var state = $(this).data("state") || 0;
                    if(state == 0){
                        $(this).next("dd").fadeIn();
                        state = 1;
                    }
                    else{
                        $(this).next("dd").fadeOut();
                        state = 0;
                    }
                    $(this).data("state", state);
                });
            })
        },
        bindProjectFileClick : function(){
            $(".menu_file").each(function(){
                $(this).click(function(){
                    Project.showCode();
                    $(".menu_file").removeClass("active");
                    $(this).addClass("active");
                    var id = $(this).data('id');
                    var data = common.getItemByKey(Project.files, "id", id);
                    var target = mtemplate.htmlEscape(data.content);
                    $("#file_code").html(target).attr('class','language-java');
                    Prism.highlightAll();
                    // toputil.totop(200);
                });
            })
        },
        showInfo : function(){
            $("#info_content").show();
            $("#code_content").hide();
        },
        showCode : function(){
            $("#info_content").hide();
            $("#code_content").show();
        }
    }
    return Project;
});


require(['Project'],function(Project){
    var method = $("#page_method").val() || 'init';
    Project[method]();
})