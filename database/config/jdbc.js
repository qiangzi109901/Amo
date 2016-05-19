module.exports = {
    prop : {
        local : {
            host : "127.0.0.1",
            user : "root",
            password : "123456",
            database : "amo",
            dateStrings : "DATETIME"
        }
    },
    debug : true,
    develop : "local",
    connection : function(){
        return (this.prop)[this.develop];
    }
}