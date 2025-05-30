import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(private dataSource: DataSource) { }

  async onModuleInit() {
    console.log('✅ DatabaseService initialized');

    const triggerExists = await this.dataSource.query(`
      SELECT 1 FROM pg_trigger WHERE tgname = 'after_auth_insert';
    `);

    if (triggerExists.length === 0) {
      // Tạo function trước
      await this.dataSource.query(`
        CREATE OR REPLACE FUNCTION insert_into_users()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO "user" (email, fullname, "authId")
          VALUES (NEW.email, NEW.fullname, NEW.id);
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
      

      // Tạo trigger
      await this.dataSource.query(`
        CREATE TRIGGER after_auth_insert
        AFTER INSERT ON auth
        FOR EACH ROW
        EXECUTE FUNCTION insert_into_users();
      `);

      console.log('✅ Trigger and function created.');
    } else {
      console.log('⚠️ Trigger already exists. Skipping creation.');
    }
  }
}