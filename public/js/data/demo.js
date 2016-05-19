define(function(){
    return {
        table : 'user',
        className : 'User',
        columns : [{
            column_name : 'id',
            column_type : 'int',
            name : 'id',
            type : 'Integer',
            set_method : 'setId',
            get_method : 'getId',
            is_auto : true,
            is_null : 'False'
        },{
            column_name : 'name',
            column_type : 'varchar',
            name : 'name',
            type : 'String',
            set_method : 'setName',
            get_method : 'getName',
            is_auto : false,
            is_null : 'False'
        },{
            column_name : 'age',
            column_type : 'int',
            name : 'age',
            type : 'Integer',
            set_method : 'setAge',
            get_method : 'getAge',
            is_auto : false,
            is_null : 'False'
        },{
            column_name : 'group_id',
            column_type : 'int',
            name : 'groupId',
            type : 'Integer',
            set_method : 'setGroupId',
            get_method : 'getGroupId',
            is_auto : false,
            is_null : 'False'
        },{
            column_name : 'role_id',
            column_type : 'int',
            name : 'roleId',
            type : 'Integer',
            set_method : 'setRoleId',
            get_method : 'getRoleId',
            is_auto : false,
            is_null : 'False'
        },{
            column_name : 'birthday',
            column_type : 'datetime',
            name : 'birthday',
            type : 'Date',
            set_method : 'setBirthday',
            get_method : 'getBirthday',
            is_auto : false,
            is_null : 'False'
        }]
    }

});