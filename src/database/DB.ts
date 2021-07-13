import { IDBPDatabase, openDB } from 'idb';

class DB {
  private database: string;
  public db: IDBPDatabase<unknown> | undefined;

  constructor(database: string) {
    this.database = database;
  }

  async init(): Promise<IDBPDatabase<unknown>> {
    return this.connectDB(['items', 'levels']).then((conexionDB) => {
      return conexionDB;
    });
  }

  async connectDB(tableNames: string[]): Promise<IDBPDatabase<unknown>> {
    try {
      this.db = await openDB(this.database, 1, {
        upgrade(db: IDBPDatabase) {
          for (const tableName of tableNames) {
            if (db.objectStoreNames.contains(tableName)) {
              continue;
            }
            const key = tableName === 'items' ? 'fullPath' : 'folderId';

            db.createObjectStore(tableName, { autoIncrement: false, keyPath: key });

          }
        },
        blocked() {
          throw new Error('blocked');
        },
        blocking() {
          throw new Error('blocking');
        },
        terminated() {
          throw new Error('terminated');
        }
      });
    } catch (error) {
      throw new Error(error);
    }
    return this.db;
  }

  async getEntryValueForId(tableName: string, id: number) {
    try {
      if (this.db !== undefined) {
        const transaction = this.db.transaction(tableName, 'readonly');
        const storeDB = transaction.objectStore(tableName);
        const result = await storeDB.get(id);

        return result;
      } else {
        return new Error('Database undefined');
      }
    } catch (error) {
      throw new Error(`Error get value ${error} `);
    }
  }

  async getAllEntriesValues(tableName: string) {
    try {
      if (this.db !== undefined) {
        const transaction = this.db.transaction(tableName, 'readonly');
        const storeDB = transaction.objectStore(tableName);
        const result = await storeDB.getAll();

        return result;
      } else {
        return new Error('Database undefined');
      }
    } catch (error) {
      throw new Error(`Error get all values ${error} `);
    }
  }

  async putEntryValue(tableName: string, value: any) {
    console.log('value', value);
    try {
      if (this.db !== undefined) {
        const transaction = this.db.transaction(tableName, 'readwrite');
        const storeDB = transaction.objectStore(tableName);

        await storeDB.put(value);
      } else {
        return new Error('Database undefined');
      }
    } catch (error) {
      throw new Error(`Error put value ${error} `);
    }
  }

  async putBulkEntriesValues(tableName: string, values: any[]) {
    console.log(values);
    try {
      if (this.db !== undefined) {
        const transaction = this.db.transaction(tableName, 'readwrite');
        const storeDB = transaction.objectStore(tableName);

        for (const value of values) {
          await storeDB.put(value);
        }
        return this.getAllEntriesValues(tableName);
      } else {
        return new Error('Database undefined');
      }
    } catch (error) {
      throw new Error(`Error put bulk values ${error} `);
    }
  }

  async deleteEntryValueForId(tableName: string, id: number) {
    try {
      if (this.db !== undefined) {
        const transaction = this.db.transaction(tableName, 'readwrite');
        const storeDB = transaction.objectStore(tableName);
        const result = await storeDB.get(id);

        if (!result) {
          return result;
        }
        await storeDB.delete(id);
      } else {
        return new Error('Database undefined');
      }
    } catch (error) {
      throw new Error(`Error put delete value ${error} `);
    }
  }
}

const db = new DB('drive-inxt');

db.init();

export default db;