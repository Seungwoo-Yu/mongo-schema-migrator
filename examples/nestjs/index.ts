import { SchemaMigrationClasses } from '../../src';
import { Enum } from '../../src/types';
import { ExampleMigration } from './migrations/topic';

export const MigrationTopics = ['topic'] as const;

const migrationMap: { [key in Enum<typeof MigrationTopics>]: SchemaMigrationClasses } = {
  topic: [ExampleMigration],
};

// noinspection JSUnusedGlobalSymbols
export const migrationEntries =
  Object.entries(migrationMap) as [Enum<typeof MigrationTopics>, SchemaMigrationClasses][];
