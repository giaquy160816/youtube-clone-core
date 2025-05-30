import { DataSource } from "typeorm";
import configuration from "src/config/configuration";

const MysqlDataSource = new DataSource({
    type: 'mysql',
    host: configuration().database_mysql.host,
    port: parseInt(String(configuration().database_mysql.port)),
    username: configuration().database_mysql.username,
    password: configuration().database_mysql.password,
    database: configuration().database_mysql.database
});


// Don't initialize the DataSource here, let NestJS handle it
MysqlDataSource.initialize()
    .then(() => {
        console.log('Đã kết nối MYSQL');
    })
    .catch((err) => {
        console.error('MYSQL lỗi kết nối', err);
    });

export default MysqlDataSource;