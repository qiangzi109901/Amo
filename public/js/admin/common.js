//admin通用处理
define(['jquery', 'util', 'mtemplate', 'mselect2','dialog','message','frame'], function($, util, mtemplate,mselect2){
    return {
        generateSearch : function(searchParam, page){
            if(typeof page == 'number'){
                searchParam.page = page;
            }
            else{
                searchParam.page = 1
            }
            var targets = $(".search_section").find("[name]");
            var len = targets.length;
            for(var i=0;i<len;i++){
                var item = targets.eq(i);
                var tag = item.get(0).tagName.toLowerCase();
                if(tag == "select"){
                    searchParam[item.attr('name')] = mselect2.value('#'+item.attr('id'));
                }
                else if(tag == "input"){
                    searchParam[item.attr('name')] = item.val();
                }
            }
            console.log(searchParam)
            return searchParam;
        },
        bindA : function(modelOrUrl,afterCb){
            $("#aBtn").click(function(){
                $("#aModal").dialog({
                    width:$("#aModal").data("width") || 500,
                    height : $("#aModal").data("height") || 300,
                    fnSure : function(d){
                        var param = util.form2param("#aForm");
                        var url = modelOrUrl;
                        if(modelOrUrl.indexOf("/")<0){
                            url = '/data/' + modelOrUrl + '/insert'
                        }
                        util.post(url, param,function(){
                            d.close();
                            $.success("添加成功");
                            afterCb && afterCb();
                        });
                    }
                });
            });
        },
        bindU : function(modelOrUrl,beforeCb,afterCb){
            $(".item_update").each(function(){
                $(this).unbind("click")
                $(this).click(function(){
                    var id = $(this).data('id');
                    //初始化对话框内容
                    beforeCb && beforeCb(id);
                    var oldInfo = $("#uForm").serialize();
                    $("#uModal").dialog({
                        width: $("#uModal").data("width") || 500,
                        fnSure: function(d) {
                            var param = util.form2param("#uForm");
                            if(oldInfo == $("#uForm").serialize()){
                                d.close();
                                return;
                            }
                            param.id = id;
                            var url = modelOrUrl;
                            if(modelOrUrl.indexOf("/")<0){
                                url = '/data/' + modelOrUrl + '/update'
                            }
                            util.post(url ,param, function(){
                                d.close();
                                $.success("更新成功");
                                afterCb && afterCb();
                            });
                        }
                    });
                });
            });
        },
        bindD : function(modelOrUrl,cb){
            $(".item_delete").each(function(){
                $(this).unbind("click");
                $(this).click(function(){
                    var id = $(this).data('id');
                    $.showConfirm("确定要删除该记录吗?",function(){
                        var url = modelOrUrl;
                        if(modelOrUrl.indexOf("/")<0){
                            url = '/data/' + modelOrUrl + '/delete'
                        }
                        util.post(url,{id:id}, function(){
                            $.success("删除成功");
                            cb && cb();
                        });
                    });
                });
            });
        },
        searchPage : function(model,modelName,searchParam,renderDefault,cb){
            renderDefault = renderDefault || 1;
            var _this = this;
            //分页查询
            util.jax({
                'url' : '/data/'+modelName+'/pageQuery',
                'type' : 'post',
                'data' : searchParam,
                'cb' : function(data){
                    var pager = window.pager;
                    if(data.total == 0){
                        model.pageData = [];
                        if(renderDefault){
                            _this.renderPage([]); //自动渲染
                        }
                        else{
                            model['renderPageData']([]); //人工渲染
                        }
                        $("#pagination").show();
                        pager.showNullMsg();
                    }
                    else{
                        var page = data.page;
                        model.pageData = data.data;
                        if(renderDefault){
                            _this.renderPage(data.data,cb); //自动渲染
                        }
                        else{
                            model['renderPageData'](data.data); //人工渲染
                        }
                        pager.setTotal(data.total);
                        pager.setPageSize(data.pageSize);
                        if(pager.getTotalPage() == 1){
                            $("#pagination").hide();
                        }
                        else{
                            $("#pagination").show();
                            pager.goPage(page);
                        }
                    }
                    cb && cb();
                }
            });
        },
        renderPage : function(data,cb){
            if(data == null || data.length == 0){
                $("#table_list").hide();
                return;
            }
            var html =  mtemplate.T("temp_model_list",{"models":data});
            $("#lists").html(html);
            cb && cb();
            $("#table_list").show();
        },
        getById : function(model,id){
            for(var i in model.pageData){
                var item = model.pageData[i];
                if(item.id == id){
                    return item;
                }
            }
            return null;
        },
        renderU : function(model, id){
            var item = this.getById(model, id);
            for(var key in item){
                var target = $('#uForm').find("[name='" + key + "']");
                if(target.length > 0){
                    var tag = target.get(0).tagName.toLowerCase();
                    if(tag == "input"){
                        target.val(item[key]);
                    }
                    else if(tag == "select"){
                        target.select2('val', item[key]);
                    }
                }
            }
        }
    }
});

