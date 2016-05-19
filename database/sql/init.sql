create table `test` (
  `id` int(11) not null auto_increment,
  `name` varchar(45)  default null,
  `password` varchar(45)  default null,
  `gender` varchar(10)  default null,
  primary key (`id`)
) default charset=utf8 collate=utf8_bin;




create table temp_catalog(
    id int primary key auto_increment,
    name varchar(100) not null,
    nickname varchar(100),
    lang varchar(100) not null,
    pid int default 0
)




CREATE VIEW `view_field` AS
	select
		t1.host,t1.dbname,t1.id tb_id,t2.name tbname,t3.*
	from
		db_config t1
	left join db_table t2 on t1.id = t2.db_id
    left join db_field t3 on t2.id = t3.table_id
