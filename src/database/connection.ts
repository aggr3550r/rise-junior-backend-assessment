import { createConnection, getConnection } from 'typeorm';
import { configService } from '../config/config.service';

let connection = {
  async create() {
    const dbConnect = await createConnection(configService.getTypeOrmConfig())
      .then(() => {
        getConnection('default');
        console.log('*** -----  Database connected ----- ***');
      })
      .catch((error) => {
        console.error('!!! Unable to connect to the database !!! \n %o', error);
      });

    return dbConnect;
  },

  async close() {
    await getConnection().close();
  },

  async clear() {
    const connection = getConnection('default');
    const entities = connection.entityMetadatas;

    entities.forEach(async (entity) => {
      const repository = connection.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    });
  },
};
export default connection;
