import { DataSourceOptions } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      console.log(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, false));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('NODE_ENV', false)?.toLowerCase();
    return mode == 'production';
  }

  public isDevelopment() {
    const mode = this.getValue('NODE_ENV', false)?.toLowerCase();
    return mode == 'development' || mode == 'dev' || mode == 'develop';
  }

  public getTypeOrmConfig(): DataSourceOptions {
    const databaseUrl = this.getValue('DATABASE_URL');
    if (databaseUrl) {
      return {
        name: 'default',
        type: 'postgres',
        url: this.getValue('DATABASE_URL'),
        entities: [
          __dirname + '/../**/*.entity{.ts,.js}',
          __dirname + '/../**/*.repository{.ts,.js}',
        ],
        migrationsTableName: 'migration',
        migrations: [__dirname + 'src/migration/*.ts'],
        // autoLoadEntities: true,
        synchronize: true,
        migrationsRun: true,
      };
    } else
      return {
        name: 'default',
        type: 'postgres',
        host: this.getValue('PG_HOST'),
        port: parseInt(this.getValue('PG_PORT')),
        username: this.getValue('PG_USER'),
        password: this.getValue('PG_PASSWORD'),
        database: this.getValue('PG_DATABASE'),
        entities: [
          __dirname + '/../**/*.entity{.ts,.js}',
          __dirname + '/../**/*.repository{.ts,.js}',
        ],
        migrationsTableName: 'migration',
        migrations: [__dirname + 'src/migration/*.ts'],
        // autoLoadEntities: true,
        synchronize: true,
        migrationsRun: true,
      };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'PG_HOST',
  'PG_PORT',
  'PG_USER',
  'PG_PASSWORD',
  'PG_DATABASE',
]);

export { configService };
