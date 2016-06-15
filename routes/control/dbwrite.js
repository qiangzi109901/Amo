var mybatis = require('node-mybatis');
var ajax = require('mjax')
var Promise = require('bluebird')
var ps = require('mprint')
require('mstr')
exports.write = function(req,res){
    write(req,req.body,res);
}

function write(req,param,res){
    var conn = {
        host : param.host,
        port : param.port,
        user : param.username,
        password : param.passwd,
        database : param.dbname,
        connName : 'conn_db',
        other : {
            'mapper' : 'database/mapper/sys'
        }
    }
    var result = [];
    var db_id = 0;
    var isConfig = false;
    //测试连接
    mybatis.connect(conn).then(function(db){
        db.models.sys_db.all({'dbname':param.dbname})
            .then(init)
            .then(createDb)
            .then(createTables,setIsConfig)
            .then(createFields)
            .then(function(){
                if(isConfig){
                    return ajax.failure(res,'该数据库已经配置了');
                }
                return ajax.success(res,'配置成功');
            })
    },function(err){
        return ajax.failure(res,err);
    });

    function init(data){
        result = data;
    }

    function setIsConfig(){
        isConfig = true;
    }

    //创建库
    function createDb(){
        return req.models.db_config.insert(param);
    }


    //创建表
    function createTables(dbId){
        db_id = dbId;
        var promises = [];
        var tables = getTables(result);
        for(var i in tables){
            if(dbId == -1){
                continue;
            }
            var table = tables[i];
            var insertData = {
                'name' : table['TABLE_NAME'],
                'db_id' : dbId,
                'prefix' : param.prefix
            }
            promises.push((function(tbName){
                return new Promise(function(resolve){
                    req.models.db_table.insert(insertData).then(function(tbId){
                        resolve({'id':tbId,'name':tbName});
                    });
                });
            })(table['TABLE_NAME']));
        }
        return Promise.all(promises);
    }


    //创建字段
    function  createFields(tbs){
        if(isConfig){
            return Promise.resolve();
        }
        var promises = [];
        for(var i in tbs){
            var tbId = tbs[i]['id'];
            var tbName = tbs[i]['name'];
            var fields = getFields(result, tbName);
            for(var i in fields){
                var field = fields[i];
                var name = field['COLUMN_NAME'].camelString();
                var insertData = {
                    'column_name' : field['COLUMN_NAME'],
                    'column_type' : field['DATA_TYPE'],
                    'column_type_value' : field['COLUMN_TYPE'],
                    'name' : name,
                    'type' : getJavaType(field['DATA_TYPE']),
                    'set_method' : 'set' + name.capitalString(),
                    'get_method' : 'get' + name.capitalString(),
                    'is_auto' : field['EXTRA'] == 'auto_increment',
                    'ordinal' : field['ORDINAL_POSITION'],
                    'is_null' : field['IS_NULLABLE'],
                    'length' : getLength(field['COLUMN_TYPE']),
                    'comment' : field['COLUMN_COMMENT'],
                    'table_id' : tbId,
                    'db_id' : db_id
                }
                promises.push(req.models.db_field.insert(insertData));
            }
        }
        return Promise.all(promises);
    }


}

function getTables(result){
    var tables = [];
    for(var i in result){
        push_list(tables, result[i], 'TABLE_NAME');
    }
    return tables;
}

function getFields(result, tableName){
    var fields = [];
    for(var i in result){
        if(result[i]['TABLE_NAME'] != tableName){
            continue
        }
        push_list(fields, result[i], 'COLUMN_NAME');
    }
    return fields;
}

function getLength(type){
    var i = type.indexOf("(");
    if(i>=0){
        return type.slice(i+1,-1);
    }
}

function push_list(lists, item, key){
    if(!in_arr(lists,key, item[key])){
        lists.push(item);
    }
}

function in_arr(lists, key, val){
    var flag = false;
    for(var i in lists){
        var item = lists[i];
        if(item && (item[key] == val)){
            flag = true;
        }
    }
    return flag;
}

function getJavaType(type){
    switch(type){
        case "varchar":
        case "char":
        case "text":
            return 'String';
        case 'bigint':
            return 'Long';
        case 'int':
        case 'tinyint':
            return 'Integer';
        case 'float':
        case 'double':
            return 'Double';
        case 'date':
        case 'datetime':
        case 'timestamp':
            return 'Date';
        default:
            return type;
    }
}


function refresh(req,res){
    var param = null,
        dbId = req.body.dbId,
        result = [],
        isErrorConn = false,
        isDb = false;

    req.models.db_config.getById({'id': dbId})
        .then(checkDb)
        .then(getAll)

    function checkDb(data){
        if(data != null){
            isDb = true;
            param = data;
            param.prefix = req.body.prefix;
            var conn = {
                host : param.host,
                port : param.port,
                user : param.username,
                password : param.passwd,
                database : param.dbname,
                connName : 'conn_db_' + param.dbname,
                other : {
                    'mapper' : 'database/mapper/sys'
                }
            };
            return new Promise(function(resolve,reject){
                mybatis.connect(conn).then(function(db){
                    resolve(db);
                },function(){
                    isErrorConn = true;
                    resolve();
                });
            });
        }
        return Promise.resolve();
    }

    function getAll(db){
        if(!isDb){
            return ajax.failure(res, "该数据库不存在,创建一个吧");
        }
        if(isErrorConn){
            return ajax.failure(res, "数据库连接失败");
        }
        db.models.sys_db.all({'dbname':param.dbname})
            .then(init)
            .then(deleteOldInfo)
            .then(createTables)
            .then(createFields)
            .then(function(){
                return ajax.success(res,'刷新成功');
            })
    }

    function init(data){
        result = data;
    }

    function deleteOldInfo(){
        req.models.db_table.deleteByDb({'db_id':param.id});
        req.models.db_field.deleteByDb({'db_id':param.id});
        return Promise.resolve();
    }

    //创建表
    function createTables(){
        var promises = [];
        var tables = getTables(result);
        for(var i in tables){
            var table = tables[i];
            var insertData = {
                'name' : table['TABLE_NAME'],
                'db_id' : param.id,
                'prefix' : param.prefix
            }
            promises.push((function(tbName){
                return new Promise(function(resolve){
                    req.models.db_table.insert(insertData).then(function(tbId){
                        resolve({'id':tbId,'name':tbName});
                    });
                });
            })(table['TABLE_NAME']));
        }
        return Promise.all(promises);
    }


    //创建字段
    function  createFields(tbs){
        var promises = [];
        for(var i in tbs){
            var tbId = tbs[i]['id'];
            var tbName = tbs[i]['name'];
            var fields = getFields(result, tbName);
            for(var i in fields){
                var field = fields[i];
                var name = field['COLUMN_NAME'].camelString();
                var insertData = {
                    'column_name' : field['COLUMN_NAME'],
                    'column_type' : field['DATA_TYPE'],
                    'column_type_value' : field['COLUMN_TYPE'],
                    'name' : name,
                    'type' : getJavaType(field['DATA_TYPE']),
                    'set_method' : 'set' + name.capitalString(),
                    'get_method' : 'get' + name.capitalString(),
                    'is_auto' : field['EXTRA'] == 'auto_increment',
                    'ordinal' : field['ORDINAL_POSITION'],
                    'is_null' : field['IS_NULLABLE'],
                    'length' : getLength(field['COLUMN_TYPE']),
                    'comment' : field['COLUMN_COMMENT'],
                    'table_id' : tbId,
                    'db_id' : param.id
                }
                promises.push(req.models.db_field.insert(insertData));
            }
        }
        return Promise.all(promises);
    }
}

exports.refresh = function(req,res){
    refresh(req,res);
}

exports.refreshTable = function(req, res){
    refreshTable(req,res);
}

function refreshTable(req,res){
    var param = null,
        result = [],
        isErrorConn = false,
        dbId = req.body.dbId,
        tbId = req.body.tbId,
        tbName = req.body.tbName,
        isDb = false;

    req.models.db_config.getById({'id': dbId})
        .then(checkDb)
        .then(getAll)

    function checkDb(data){
        if(data != null){
            isDb = true;
            param = data;
            param.prefix = req.body.prefix;
            var conn = {
                host : param.host,
                port : param.port,
                user : param.username,
                password : param.passwd,
                database : param.dbname,
                connName : 'conn_db_' + param.dbname,
                other : {
                    'mapper' : 'database/mapper/sys'
                }
            };
            return new Promise(function(resolve,reject){
                mybatis.connect(conn).then(function(db){
                    resolve(db);
                },function(){
                    isErrorConn = true;
                    resolve();
                });
            });
        }
        return Promise.resolve();
    }

    function getAll(db){
        if(!isDb){
            return ajax.failure(res, "该数据库不存在,创建一个吧");
        }
        if(isErrorConn){
            return ajax.failure(res, "数据库连接失败");
        }
        db.models.sys_db.allFields({'dbname':param.dbname,'tbname':tbName})
            .then(init)
            .then(deleteOldInfo)
            .then(createFields)
            .then(function(){
                return ajax.success(res,'刷新成功');
            })
    }

    function init(data){
        result = data;
    }

    function deleteOldInfo(){
        req.models.db_field.deleteByTable({'table_id':req.body.tbId});
        return Promise.resolve();
    }

    //创建字段
    function  createFields(){
        var promises = [];
        console.log(req.body);
        var fields = getFields(result, tbName);
        for(var i in fields){
            var field = fields[i];
            var name = field['COLUMN_NAME'].camelString();
            var insertData = {
                'column_name' : field['COLUMN_NAME'],
                'column_type' : field['DATA_TYPE'],
                'column_type_value' : field['COLUMN_TYPE'],
                'name' : name,
                'type' : getJavaType(field['DATA_TYPE']),
                'set_method' : 'set' + name.capitalString(),
                'get_method' : 'get' + name.capitalString(),
                'is_auto' : field['EXTRA'] == 'auto_increment',
                'ordinal' : field['ORDINAL_POSITION'],
                'is_null' : field['IS_NULLABLE'],
                'length' : getLength(field['COLUMN_TYPE']),
                'comment' : field['COLUMN_COMMENT'],
                'table_id' : tbId,
                'db_id' : dbId
            }
            promises.push(req.models.db_field.insert(insertData));
        }
        return Promise.all(promises);
    }
}