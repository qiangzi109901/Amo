define(['jquery','comjax','select2'],function($,comjax){
    return {
        getOption : function(id,data){
            if(this.isSelect2(id)){
                this.clear(id);
            }
            var opt = {
                placeholder : $(id).attr("placeholder") || '请选择',
                allowClear: false,
                minimumResultsForSearch: 10,
                language: {
                    noResults: function() {
                        return $(id).attr("noresult") || '没有结果';
                    }
                }
            }
            if(data){
                var defaultMsg = $(id).attr("default_msg");
                if(defaultMsg){
                    var defaultValue = $(id).attr('default_val');
                    opt.data = this.getDefault(defaultMsg, data, defaultValue);
                }
                else{
                    opt.data = data;
                }
            }
            return opt;
        },
        render:function(id){
            $(id).select2(this.getOption(id));
        },
        renderData: function(id, data, defaultData){
            $(id).select2(this.getOption(id, data));
            this.setDefault(id, defaultData);
        },
        renderAndBind : function(id,cb,defaultData){
            var select = $(id);
            select.select2(this.getOption(id));
            this.setDefault(id, defaultData);
            select.on('change',function(){
                cb && cb(select[0].value);
            });
        },
        renderDataAndBind : function(id,data,cb,defaultData){
            var select = $(id);
            select.select2(this.getOption(id,data));
            this.setDefault(id, defaultData);
            select.on('change',function(){
                cb && cb(select[0].value);
            });
        },
        ajaxRenderData : function(method,id,defaultData){
            var _this = this;
            comjax[method](function(data){
                _this.renderData(id, data, defaultData);
            });
        },
        ajaxRenderDataAndBind : function(method,id,cb,defaultData){
            var _this = this;
            comjax[method](function(data){
                _this.renderDataAndBind(id, data, cb, defaultData);
            });
        },
        setDefault : function(id, defaultData){
            if(this.isSelect2(id)){
                this.val(id, defaultData || $(id).data('default') || '');
            }
        },
        getDefault : function(msg,data, val){
            if(0 != val && val != ""){
                val = 'all';
            }
            var result = [{'id': val,'text':msg}];
            for(var i in data){
                result.push(data[i]);
            }
            return result;
        },
        clear : function(id,triggerChange){
            $(id).select2("val","");
            this.empty(id);
            if(triggerChange){
                this.triggerChange(id);
            }
        },
        value : function(id,except){
            var v = $(id).val();
            except = except || 'all';
            if(v == except){
                return '';
            }
            return v || '';
        },
        empty : function(id){
            $(id).empty().append("<option></option>")
        },
        triggerChange : function(id){
            $(id).trigger('change');
        },
        isSelect2 : function(id){
            return $(id).hasClass("select2-hidden-accessible");
        },
        val : function(id, value){
            if(this.isSelect2(id)){
                if(typeof value == "undefined"){
                    var v = $(id).val();
                    if(v == 'all'){
                        return '';
                    }
                    return v || '';
                }
                else{
                    $(id).select2('val', value);
                }
            }
        },
        text : function(id){
            return $("#select2-" + id + "-container").text();
        }
    }
});