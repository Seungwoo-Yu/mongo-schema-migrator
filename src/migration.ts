import mongoose, { ClientSession, ObjectId } from 'mongoose';
import { BasicConfig, getBasicConfig } from './config';
import { Enum, FilterType, MigratedDocumentType, ISchemaMigration, SchemaMigrationClasses } from './types';

async function migrateTopic(
  config: BasicConfig,
  migrationTopic: string,
  session: ClientSession,
  migrations: ISchemaMigration[],
) {
  if (migrations.length === 0) {
    return;
  }

  let lastId: ObjectId | undefined = undefined;

  do {
    const filter: FilterType = {
      ...(config.up ? migrations[0].filterToGetPrevDocuments() : migrations[0].filterToGetNextDocuments()),
    };
    if (lastId != null) {
      filter._id = {
        $gt: lastId,
      };
    }

    lastId = await session.withTransaction(async () => {
      const findModel = config.up ? migrations[0].prevModel : migrations[0].nextModel;
      const writeModel = config.up ? migrations[0].nextModel : migrations[0].prevModel;
      const documents = await findModel.find(filter).limit(100000).session(session);
      const migratedDocuments: MigratedDocumentType[] = await Promise.all(
        documents.map(async (document) => {
          //삭제 시 기존 _id 보존을 위해 강제로 수정을 막음
          Object.freeze(document._id);

          return await migrations.reduce(async (previousValue, currentValue) => {
            if (currentValue == null) {
              return previousValue;
            }

            return config.up ? await currentValue.up(previousValue) : await currentValue.down(previousValue);
          }, document);
        }),
      );

      await writeModel.bulkWrite(
        migratedDocuments.map((document, idx) => {
          if (document == null) {
            return {
              deleteOne: {
                filter: {
                  _id: document[idx]._id,
                },
              },
            };
          }

          if (document._id == null) {
            return {
              insertOne: {
                document,
              },
            };
          }

          return {
            updateOne: {
              filter: {
                _id: document._id,
              },
              update: document,
              upsert: false,
            },
          };
        }),
        {
          session,
          strict: false,
        },
      );

      return migratedDocuments.at(-1)?._id;
    });

    if (lastId != null) {
      console.log(`[${migrationTopic}] ${lastId.toString()}까지 작업 완료됨`);
    }
  } while (lastId != null);
}

export async function migrate<T extends readonly string[]>(migrationEntries: [Enum<T>, SchemaMigrationClasses][]) {
  const migrationTopics = migrationEntries.map(([topic]) => topic);
  const config = getBasicConfig(migrationTopics);
  const entries =
    config.kinds == null || config.kinds.length === 0
      ? migrationEntries
      : migrationEntries.filter(([kind]) => config.kinds!.includes(kind));

  await Promise.all(
    entries.map(async ([topic, migrationClasses]) => {
      const connection = mongoose.createConnection(config.mongoUri, {
        dbName: config.mongoDbname,
        autoIndex: false,
        autoCreate: false,
      });
      let migrations = migrationClasses
        .map((klass) => new klass(connection))
        .sort((a, b) => a.migrationVersion - b.migrationVersion);

      if (config.fromVersion != null || config.toVersion != null) {
        migrations = migrations.filter((migration) => {
          if (config.fromVersion != null && migration.migrationVersion < config.fromVersion) {
            return false;
          }

          return config.toVersion == null || migration.migrationVersion <= config.toVersion;
        });
      }

      if (migrations.length === 0) {
        return;
      }

      let currentSchema = migrations[0].nextModel.schema;
      migrations.forEach((migration, idx) => {
        if (idx === 0) {
          return;
        }

        if (currentSchema !== migration.prevModel.schema) {
          connection.destroy().then().catch();
          throw new Error(
            `[${topic}] 마이그레이션 버전 ${idx - 1}의 nextModel과 마이그레이션 버전 ${idx - 1}의 prevModel이 다릅니다.`,
          );
        }
        currentSchema = migration.nextModel.schema;
      });

      if (config.down) {
        migrations.reverse();
      }

      try {
        const session = await connection.startSession();
        await migrateTopic(config, topic, session, migrations);
        await session.endSession();
        connection.destroy().then().catch();

        console.info(`[${topic}]: 모든 작업 완료됨`);
      } catch (e) {
        connection.destroy().then().catch().finally(() => {
          throw e;
        });
      }
    }),
  );
}
