import { DocumentType, FilterType, MigratedDocumentType, SchemaMigration } from '../../../../src';
import { ExampleSchema as OldExampleSchema } from './schema/v0.schema';
import { ExampleSchema as NewExampleSchema } from './schema/v1.schema';

export class ExampleMigration extends SchemaMigration<typeof OldExampleSchema, typeof NewExampleSchema> {
  public readonly migrationVersion = 1;
  public readonly prevModel = this.connection.model(`${ExampleMigration.name}prev`, OldExampleSchema, 'points');
  public readonly nextModel = this.connection.model(`${ExampleMigration.name}next`, NewExampleSchema, 'points');

  public filterToGetPrevDocuments(): FilterType<typeof this.prevModel> {
    return {
      $or: [{ __v: { $eq: null } }, { __v: { $eq: 0 } }],
    };
  }

  public filterToGetNextDocuments(): FilterType<typeof this.nextModel> {
    return {
      __v: 1,
    };
  }

  public async up(
    oldDocument: DocumentType<typeof this.prevModel>,
  ): Promise<MigratedDocumentType<typeof this.prevModel, typeof this.nextModel>> {
    return {
      _id: oldDocument._id,
      $set: {
        __v: 1,
      },
    };
  }

  public async down(
    newDocument: DocumentType<typeof this.nextModel>,
  ): Promise<MigratedDocumentType<typeof this.prevModel, typeof this.nextModel>> {
    return {
      _id: newDocument._id,
      $unset: {
        __v: 1,
      },
    };
  }
}
