import { DataSource } from "typeorm";
import configuration from '../config/configuration';


const PostgresDataSource = new DataSource({
    type: 'postgres',
    host: configuration().database_postgres.host,
    port: parseInt(String(configuration().database_postgres.port)),
    username: configuration().database_postgres.username,
    password: configuration().database_postgres.password,
    database: configuration().database_postgres.database,
});

// Don't initialize the DataSource here, let NestJS handle it
PostgresDataSource.initialize()
    .then(() => {
        console.log('Đã kết nối Postgres');
    })
    .catch((err) => {
        console.error('Postgres lỗi kết nối', err);
    });

export default PostgresDataSource;