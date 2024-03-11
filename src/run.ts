import { getCommandConfig, migrate, SchemaMigrationClasses } from '.';
import path from 'path';

(async () => {
  const commandConfig = getCommandConfig();
  const migrationFile: { migrationEntries: [string, SchemaMigrationClasses][] } | undefined =
    await import(path.resolve(commandConfig.migrationPath));
  if (migrationFile?.migrationEntries == null) {
    throw new Error('migration path is not valid');
  }

  await migrate(migrationFile.migrationEntries);
})().then().catch();
