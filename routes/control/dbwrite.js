var mybatis = require('node-mybatis');
var ajax = require('mjax')
var Promise = require('bluebird')
var ps = require('mprint')
require('mstr')
exports.write = function(req,res){
    var conn = {
        host : req.body.host,
        port : req.body.port,
        user : req.body.username,
        password : req.body.passwd,
        database : req.body.dbname,
        connName : 'conn_db',
        other : {
            'mapper' : 'database/mapper/sys'
        }
    }
    var result = [];
    var isConfig = false;
    //测试连接
    mybatis.connect(conn).then(function(db){
        db.models.sys_db.all({'dbname':req.body.dbname})
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
        return req.models.db_config.insert(req.body);
    }

    //创建表
    function createTables(dbId){
        var promises = [];
        var tables = getTables();
        for(var i in tables){
            if(dbId == -1){
                continue;
            }
            var table = tables[i];
            var insertData = {
                'name' : table['TABLE_NAME'],
                'db_id' : dbId,
                'prefix' : req.body.prefix
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
            var fields = getFields(tbName);
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
                    'table_id' : tbId
                }
                promises.push(req.models.db_field.insert(insertData));
            }
        }
        return Promise.all(promises);
    }


    function getTables(){
        var tables = [];
        for(var i in result){
            push_list(tables, result[i], 'TABLE_NAME');
        }
        return tables;
    }

    function getFields(tableName){
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
}


