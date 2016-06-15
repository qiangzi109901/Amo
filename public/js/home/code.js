require(['dialog','frame']);
define('CodeMaker',['jquery','dbtemplate','casecade','util','mselect2','home/codeutil','radio','mclip','tether-tooltip','prism'],function($,dbtemplate,casecade,util,mselect2,codeutil,Radio,mclip,Tooltip){
    var config = {
        getFieldUrl : '/data/db_field/listByTb',
        getTableUrl : '/data/db_table/get',
        getTemplateUrl : '/data/template/getByCatalogId',
        getOneDbUrl : '/data/db_config/getOneByHost',
        getFileNameUrl : '/data/temp_catalog/getFileName',
        downloadUrl : '/download/code'
    }
    Tooltip.init();
    var CodeMaker = {
        init : function(){
            this.initSelect();
            this.bindEvent();
            $("#download").click(function(){
                $("#downloadForm").submit();
            });
        },
        initSelect : function(){
            this.initStorage('host')
            this.initStorage('db')
            this.initStorage('tb')
            this.initStorage('temp_type')
            this.initStorage('temp')

            casecade.init({
                ids : ['#host', '#db', '#tb'],
                urls : ['/data/db_config/getHost','/data/db_config/getDbByHost','/data/db_table/getTableByDb'],
                length : 3,
                cb : CodeMaker.makecode
            });

            casecade.init({
                ids : ['#rHost', '#rDb', '#rTb'],
                urls : ['/data/db_config/getHost','/data/db_config/getDbByHost','/data/db_table/getTableByDb'],
                length : 3,
                defaultMsgs : ['','','刷新库']
            });

            casecade.init({
                ids : ['#temp_type', '#temp'],
                urls : ['/data/temp_catalog/listByPid?val=0','/data/temp_catalog/listByPid'],
                defaultMsgs : ['','全部'],
                cb : CodeMaker.makecode
            })
        },
        makecode : function(ids){
            var tbVal = mselect2.val('#tb');
            if(tbVal == ''){
                return;
            }
            CodeMaker.setStorage('host')
            CodeMaker.setStorage('db')
            CodeMaker.setStorage('tb')
            

            var catalog = mselect2.val('#temp_type');
            if(catalog == ''){
                return;
            }

            CodeMaker.setStorage('temp_type')
            CodeMaker.setStorage('temp')

            CodeMaker.result = CodeMaker.generateTemplateData(tbVal);
            var columns = CodeMaker.result.columns;
            var columnHtml = dbtemplate.render('temp_columns',{columns:columns});
            $("#column_area").html(columnHtml);

            Radio.initCheckBox({
                item : '#column_area .mcheckbox',
                data : columns,
                cb : CodeMaker.columnChanged
            })

            var tpVal = mselect2.val('#temp');

            if(tpVal == ''){
                
                //生成全部模板代码
                var templates = util.postAndGet('/data/template/listByCatalog', {'val' : catalog});
                var rst = "";
                                
                for(var i in templates){
                     var temp = templates[i];
                     CodeMaker.lang = temp.lang;
                     var finalCode = dbtemplate.compile(temp.content,CodeMaker.result);
                     finalCode = dbtemplate.removeBlankLine(finalCode);
                     finalCode += "\n\n";
                     rst += finalCode;
                }

                var m1 = mselect2.text("temp_type").toLowerCase();
                
                if(m1 == "node_mapper"){
                    rst = dbtemplate.render('temp_node_mapper',{"table":CodeMaker.result.table,"content":rst});
                }
                else if(m1 == "java_mapper"){
                    rst = dbtemplate.render('temp_java_mapper',{"className":CodeMaker.result.className,"content":rst});
                }
                var rst = dbtemplate.htmlEscape(rst);
                $("#final_code").html(rst).attr('class', 'language-'+CodeMaker.lang);
                Prism.highlightAll();  

                CodeMaker.bindDownload(CodeMaker.result)

                return;
            }
           

            var temp = CodeMaker.getTemplateInfo(tpVal);
            CodeMaker.template = dbtemplate.htmlEscape(temp.content);
            CodeMaker.lang = temp.lang;

            $("#code_template").html(CodeMaker.template).attr('class', 'language-'+temp.lang);
            var finalCode = dbtemplate.compile(CodeMaker.template,CodeMaker.result);
            finalCode = dbtemplate.removeBlankLine(finalCode);
            $("#final_code").html(finalCode).attr('class', 'language-'+CodeMaker.lang);

            Prism.highlightAll();

            CodeMaker.bindDownload(CodeMaker.result)

            


        },
        bindDownload : function(info){
            var catalogId = mselect2.val("#temp_type");
            var filename = CodeMaker.getFileName(catalogId);
            if(!filename){
                var sk = mselect2.val("#temp");
                if(sk>0){
                    var filename = CodeMaker.getFileName(mselect2.val("#temp"));
                    if(!filename){
                        filename = "untitled.txt";
                    }
                }
                else{
                    filename = "untitled.txt";
                }
            }

            console.log(filename);
            filename = dbtemplate.compile(filename, info);
            content = $("#final_code").text();

            $("#mfilename").val(filename);
            $("#mcontent").val(content);

            
        },
        getFileName : function(tpId){
            return util.postAndGet(config.getFileNameUrl, {'id' : tpId}).filename;
        },
        getDbFields : function(tbId){
            return util.postAndGet(config.getFieldUrl, {'table_id':tbId})
        },
        getTableInfo : function(tbId){
            return util.postAndGet(config.getTableUrl, {'id':tbId});
        },
        getTemplateInfo : function(tempId){
            return util.postAndGet(config.getTemplateUrl, {'catalog_id' : tempId});
        },
        generateTemplateData : function(tbId){
            var tableInfo = CodeMaker.getTableInfo(tbId);
            var columns = CodeMaker.getDbFields(tbId);
            var result = {};
            result['table']  = tableInfo['name'];
            result['prefix']  = tableInfo['prefix'];
            result['columns'] = columns;

            var javautil = {
                getClassName : function(table){
                    var tableName = table.table || 'Demo';
                    var prefix = table.prefix || '';
                    var prex = prefix.split(",");
                    for(var pre in prex){
                        tableName = tableName.slicePrefix(pre);
                    }
                    return tableName.capitalCamelString();
                },
                getBeanName : function(table){
                    return this.getClassName(table) + (tableInfo.name_bean || 'DO');
                },
                getDaoName : function(table){
                    return this.getClassName(table) + (tableInfo.name_dao || 'Dao');
                },
                getServiceName : function(table){
                    return this.getClassName(table) + (tableInfo.name_service || 'Service');
                },
                getServiceImplName : function(table){
                    return this.getClassName(table) + (tableInfo.name_service_impl || 'ServiceImpl');
                },
                getDaoTestName : function(table){
                    return "Test" + this.getClassName(table) + (tableInfo.name_dao || 'Dao');
                },
                getServiceTestName : function(table){
                    return "Test" + this.getClassName(table) + (tableInfo.name_service || 'Service');
                },
                getMapperName : function(table){
                    return this.getClassName(table) + (tableInfo.name_bean || '') + "Mapper.xml";
                },
                getPackageBean : function(){
                    return tableInfo.package_bean || 'cn.demo.xx.model';
                },
                getPackageDao : function(){
                    return tableInfo.package_dao || 'cn.demo.xx.dao';
                },
                getPackageService : function(){
                    return tableInfo.package_service || 'cn.demo.xx.service';
                },
                getPackageServiceImpl : function(){
                    return tableInfo.package_service_impl || 'cn.demo.xx.service.impl';
                },
                getPackageDaoTest : function(){
                    return tableInfo.package_dao_test || 'cn.demo.xx.test.dao';
                },
                getPackageServiceTest : function(){
                    return tableInfo.package_service_test || 'cn.demo.xx.test.service'
                }
            }

            result['className']  = javautil.getClassName(result);
            result['beanName']  = javautil.getBeanName(result);
            result['beanObject']  = javautil.getBeanName(result).lowerFirstString();
            result['daoName']  = javautil.getDaoName(result);
            result['daoObject']  = javautil.getDaoName(result).lowerFirstString();
            result['serviceName']  = javautil.getServiceName(result);
            result['serviceObject']  = javautil.getServiceName(result).lowerFirstString();
            result['serviceImplName']  = javautil.getServiceImplName(result);
            result['daoTestName']  = javautil.getDaoTestName(result);
            result['serviceTestName']  = javautil.getServiceTestName(result);
            result['mapperName']  = javautil.getMapperName(result);
            result['packageBean']  = javautil.getPackageBean();
            result['packageDao']  = javautil.getPackageDao();
            result['packageService']  = javautil.getPackageService();
            result['packageServiceImpl']  = javautil.getPackageServiceImpl();
            result['packageDaoTest']  = javautil.getPackageDaoTest();
            result['packageDaoService']  = javautil.getPackageServiceTest();

            console.log(result);
            return result;
        },
        setStorage : function(id){
            window.localStorage.setItem(id, mselect2.val('#'+id))
        },
        initStorage : function(id){
            var m = window.localStorage.getItem(id);
            if(m){
                $("#" + id).data('default',m);
            }
        },
        columnChanged : function(columns){
            CodeMaker.result.columns = columns;
            var finalCode = dbtemplate.compile(CodeMaker.template,CodeMaker.result);
            $("#final_code").html(finalCode).attr('class', 'language-'+CodeMaker.lang);

            Prism.highlightAll();
        },
        bindEvent : function(){
            this.bindOpenColumnEvent();

            $('[data-modal]').each(function(){
               $(this).click(function(){
                    var modal = $(this).data('modal');
                    $("#" + modal).dialog({
                        width:500,
                        fnSure : function(d){
                            if(d.id == "aModal"){
                                var param = util.form2param("#aForm");
                                var url = "/db/write";
                                util.post(url, param,function(){
                                    d.close();
                                    $.success("添加成功");
                                    CodeMaker.initSelect();
                                });
                            }
                            else if(d.id == "rModal"){
                                var param = util.form2param("#rForm");
                                var url = "db/refresh";
                                if(param.dbId == ""){
                                    return;
                                }
                                if(param.tbId != "" && param.tbId != "all"){
                                    param.tbName = mselect2.text('rTb');
                                    url = 'db/refreshTable'
                                }
                                util.post(url, param,function(){
                                    d.close();
                                    $.success("刷新成功");
                                    // CodeMaker.initSelect();
                                });
                            }
                        }
                    })
               });
            });

            $("#aHost").change(function(){
                var username = $("#aUsername").val();
                var passwd = $("#aPassword").val();
                if(username == '' && passwd == ''){
                    var result = CodeMaker.getDbInfoByHost($(this).val());
                    if(result == null){
                        return;
                    }
                    util.assignForm('#aForm', result, ['dbname','name']);
                }
            });

            mclip.setClip("#copy");

        },
        bindOpenColumnEvent : function(){
            $("#may").click(function(){
                if($("#column_area").data('open')){
                    $("#column_area").fadeOut()
                    $("#column_area").data('open',0);
                }
                else{
                    $("#column_area").fadeIn()
                    $("#column_area").data('open',1);
                }
            });
        },
        getDbInfoByHost : function(host){
            return util.postAndGet(config.getOneDbUrl,{'host':host});
        }
    }

    return CodeMaker;
});
require(['CodeMaker'],function(CodeMaker){
    CodeMaker.init();
})