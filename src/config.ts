import * as yargs from 'yargs';

export function getBasicConfig(migrationTopics: readonly string[]) {
  return yargs
    .env()
    .options({
      mongoUri: { type: 'string', demandOption: true },
      mongoDbname: { type: 'string', demandOption: true },
    })
    .options({
      up: { type: 'count', demandOption: false },
      down: { type: 'count', demandOption: false },
    })
    .options({
      fromVersion: { type: 'number', demandOption: false },
      toVersion: { type: 'number', demandOption: false },
      kinds: { type: 'array', choices: migrationTopics, demandOption: false },
    })
    .check((argv) => {
      if (argv.up && argv.down) {
        return 'both up and down commands are selected';
      }

      if (!argv.up && !argv.down) {
        return 'either up or down commands must be selected';
      }

      if (argv.fromVersion != null && argv.fromVersion < 0) {
        return 'fromVersion must be more than or equal to 0';
      }

      if (argv.toVersion != null && argv.toVersion < 0) {
        return 'fromVersion must be more than or equal to 0';
      }

      return true;
    })
    .parseSync();
}
export type BasicConfig = ReturnType<typeof getBasicConfig>;

export function getCommandConfig() {
  return yargs
    .env()
    .options({
      migrationPath: { type: 'string', demandOption: true },
    })
    .parseSync();
}
export type CommandConfig = ReturnType<typeof getCommandConfig>;
