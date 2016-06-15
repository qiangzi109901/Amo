
var Logger = require('../../modules/log');
var fs = require('fs');
var mjax = require('mjax');
require('mstr')

function makeProject(db,id){
	//获取项目信息
	var projectInfo = null;
	var projectId = id;
	var tables = null;
	var isError = false;

	db.project_file.deleteByProject({'id' : id},function(){
		db.project.get({'id' : id})
			.then(initProject)
			.then(initProjectDb)
			.then(makeProject)
	});

	function initProject(data){
		if(data == null){
			isError = true;
			return;
		}
		projectInfo = data;
	}

	function initProjectDb(){
		var dbId = projectInfo.db_id;
		return db.db_table.queryTableAndFieldsByDb({'dbId' : dbId});
	}




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
			return this.getClassName(table) + projectInfo.name_bean || '';
		},
		getDaoName : function(table){
			return this.getClassName(table) + projectInfo.name_dao || 'Dao';
		},
		getServiceName : function(table){
			return this.getClassName(table) + projectInfo.name_service || 'Service';
		},
		getServiceImplName : function(table){
			return this.getClassName(table) + projectInfo.name_service_impl || 'ServiceImpl';
		},
		getDaoTestName : function(table){
			return "Test" + this.getClassName(table) + projectInfo.name_dao || 'Dao';
		},
		getServiceTestName : function(table){
			return "Test" + this.getClassName(table) + projectInfo.name_service || 'Service';
		},
		getMapperName : function(table){
			return this.getClassName(table) + (projectInfo.name_bean || '') + "Mapper.xml";
		},
		getPackageBean : function(){
			return projectInfo.package_bean || 'cn.demo.xx.model';
		},
		getPackageDao : function(){
			return projectInfo.package_dao || 'cn.demo.xx.dao';
		},
		getPackageService : function(){
			return projectInfo.package_service || 'cn.demo.xx.service';
		},
		getPackageServiceImpl : function(){
			return projectInfo.package_service_impl || 'cn.demo.xx.service.impl';
		},
		getPackageDaoTest : function(){
			return projectInfo.package_dao_test || 'cn.demo.xx.test.dao';
		},
		getPackageServiceTest : function(){
			return projectInfo.package_service_test || 'cn.demo.xx.test.service'
		}
	}

	function setBasic(){
		for(var i in tables){
			var item = tables[i];
			item['className']  = javautil.getClassName(item);
			item['beanName']  = javautil.getBeanName(item);
			item['beanObject']  = javautil.getBeanName(item).lowerFirstString();
			item['daoName']  = javautil.getDaoName(item);
			item['daoObject']  = javautil.getDaoName(item).lowerFirstString();
			item['serviceName']  = javautil.getServiceName(item);
			item['serviceObject']  = javautil.getServiceName(item).lowerFirstString();
			item['serviceImplName']  = javautil.getServiceImplName(item);
			item['daoTestName']  = javautil.getDaoTestName(item);
			item['serviceTestName']  = javautil.getServiceTestName(item);
			item['mapperName']  = javautil.getMapperName(item);
			item['packageBean']  = javautil.getPackageBean();
			item['packageDao']  = javautil.getPackageDao();
			item['packageService']  = javautil.getPackageService();
			item['packageServiceImpl']  = javautil.getPackageServiceImpl();
			item['packageDaoTest']  = javautil.getPackageDaoTest();
			item['packageDaoService']  = javautil.getPackageServiceTest();
		}
	}


	var javacoder = {
		makeJavaBean : function(){
			var tempId = 7;
			db.template.get({'id' : tempId}, function(err, data){
				var dbtemplate = require('../../modules/dbtemplate');
				var content = data.content;
				for(var i in tables){
					var item = tables[i];
					var result = dbtemplate.compile(content, item);
					db.project_file.insert({
						'name' : item['beanName'] + ".java",
						'catalog' : 'Bean',
						'ordinal' : 1,
						'content' : result,
						'project_id' : projectId,
						'lang' : 'java'
					});
				}
			});
			
		},
		makeJavaDao : function(){
			var tempId = 39;
			db.template.get({'id' : 20}, function(err, data){
				var dbtemplate = require('../../modules/dbtemplate');
				var basedao = dbtemplate.compile(data.content,tables[0]);
				db.project_file.insert({
					'name' : "BaseDao.java",
					'catalog' : 'Dao',
					'ordinal' : 2,
					'content' : basedao,
					'project_id' : projectId,
					'lang' : 'java'
				});
				db.template.get({'id' : tempId}, function(err, data){
					var content = data.content;
					for(var i in tables){
						var item = tables[i];
						var result = dbtemplate.compile(content, item);
						db.project_file.insert({
							'name' : item['daoName'] + ".java",
							'catalog' : 'Dao',
							'ordinal' : 2,
							'content' : result,
							'project_id' : projectId,
							'lang' : 'java'
						});
					}
				});
			});
			
		},
		makeJavaService : function(){

			var tempId = 40;
			db.template.get({'id' : 45}, function(err, data){
				var dbtemplate = require('../../modules/dbtemplate');
				var baseservice = dbtemplate.compile(data.content,tables[0]);
				db.project_file.insert({
					'name' : "BaseService.java",
					'catalog' : 'Service',
					'ordinal' : 3,
					'content' : baseservice,
					'project_id' : projectId,
					'lang' : 'java'
				});
				db.template.get({'id' : tempId}, function(err, data){
					var content = data.content;
					for(var i in tables){
						var item = tables[i];
						var result = dbtemplate.compile(content, item);
						db.project_file.insert({
							'name' : item['serviceName'] + ".java",
							'catalog' : 'Service',
							'ordinal' : 3,
							'content' : result,
							'project_id' : projectId,
							'lang' : 'java'
						});
					}
				});
			});
		},
		makeJavaServiceImpl : function(){
			var tempId = 41;

			db.template.get({'id' : 46}, function(err, data){
				var dbtemplate = require('../../modules/dbtemplate');
				var baseservice = dbtemplate.compile(data.content,tables[0]);
				db.project_file.insert({
					'name' : "BaseServiceImpl.java",
					'catalog' : 'ServiceImpl',
					'ordinal' : 4,
					'content' : baseservice,
					'project_id' : projectId,
					'lang' : 'java'
				});
				db.template.get({'id' : tempId}, function(err, data){
					var content = data.content;
					for(var i in tables){
						var item = tables[i];
						var result = dbtemplate.compile(content, item);
						db.project_file.insert({
							'name' : item['serviceImplName'] + ".java",
							'catalog' : 'ServiceImpl',
							'ordinal' : 4,
							'content' : result,
							'project_id' : projectId,
							'lang' : 'java'
						});
					}
				});
			});
			
		},
		makeJavaDaoTest : function(){
			var tempId = 42;
			db.template.get({'id' : tempId}, function(err, data){
				var dbtemplate = require('../../modules/dbtemplate');
				var content = data.content;
				Logger.error(content)
				for(var i in tables){
					var item = tables[i];
					var result = dbtemplate.compile(content, item);
					db.project_file.insert({
						'name' : item['daoTestName'] + ".java",
						'catalog' : 'DaoTest',
						'ordinal' : 5,
						'content' : result,
						'project_id' : projectId,
						'lang' : 'java'
					});
				}
			});
		},
		makeJavaMapperXml : function(){
			var dbtemplate = require('../../modules/dbtemplate');
			var tempCatalog = 17;
			db.template.listByCatalog({'val' : tempCatalog}, function(err, data){
				var filecontent = fs.readFileSync('template/java_mapper.xml',"utf-8");
				var content = dbtemplate.backCompile(filecontent, {"temps" : data});
				for(var i in tables){
					var item = tables[i];
					var result = dbtemplate.compile(content, item);
					Logger.warn(result);
					db.project_file.insert({
						'name' : item['className'] + "Mapper.xml",
						'catalog' : 'Mapper',
						'ordinal' : 6,
						'content' : result,
						'project_id' : projectId,
						'lang' : 'sql'
					},function(err,data){
						Logger.error(err);
						Logger.error(data);
					});
				}
			});
		},
		makeMysqlLink : function(database){
			var dbtemplate = require('../../modules/dbtemplate');
			var filecontent = fs.readFileSync('template/dal.properties',"utf-8");
			database['projectName'] = projectInfo.name.toLowerCase();
			var content = dbtemplate.compile(filecontent, database);
			db.project_file.insert({
				'name' : projectInfo.name.toLowerCase() + ".dal.mysql.properties",
				'catalog' : 'Properties',
				'ordinal' : 7,
				'content' : content,
				'project_id' : projectId,
				'lang' : 'none'
			},function(err,data){
				Logger.error(err);
				Logger.error(data);
			});
		}
	}

	function makeProject(_tables){
		tables = _tables;
		Logger.error(_tables);
		switch(projectInfo.type){
			case "JAVA":
				setBasic();
				makeJavaProject();
				break;
			case "NODE":
				makeNodeProject();
				break;
		}
	}

	function makeJavaProject(){
		javacoder.makeJavaBean();
		javacoder.makeJavaDao();
		javacoder.makeJavaService();
		javacoder.makeJavaServiceImpl();
		javacoder.makeJavaMapperXml();
		javacoder.makeJavaDaoTest();
		db.db_config.get({'id' : projectInfo.db_id}).then(javacoder.makeMysqlLink);
	}

	function makeNodeProject(){

	}
}

exports.make = function(req,res){
	makeProject(req.models, req.params.id );

	setTimeout(function(){
		mjax.success(res, "恭喜，系统构建项目代码完毕");
	},100);
}