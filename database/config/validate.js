module.exports = {
    test : {
        'password' : {
            required : {val:true,message:'密码不能为空'},
            minlen : {val:4,message:'密码至少4位'}
        },
        'gender' : {
            required: {val:true,message:'性别不能为空'}
        },
        delete:'该用户已经被关联',
        unique:'用户名必须唯一'
    },
    template : {
        'catalog_id' : {
            required : {val:true,message:'模板类别不能为空'}
        },
        'content' : {
            required : {val:true,message:'模板内容不能为空'}
        },
        'description' : {
            required : {val:true,message:'描述不能为空'}
        },
        'lang' : {
            required : {val : true,message:'模板语言不能为空'}
        },
        'compress' : {
            required : {val : false,message:'是否去掉空行必须选择'}
        }
    }
}