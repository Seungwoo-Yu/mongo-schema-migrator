import mongoose, {
  AnyKeys,
  AnyObject,
  Connection,
  FilterQuery,
  HydratedDocument,
  InferSchemaType,
  Model,
  ObtainSchemaGeneric,
  Schema,
} from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModelType<TSchema extends Schema = any> = Model<
  InferSchemaType<TSchema>,
  ObtainSchemaGeneric<TSchema, 'TQueryHelpers'>,
  ObtainSchemaGeneric<TSchema, 'TInstanceMethods'>,
  ObtainSchemaGeneric<TSchema, 'TVirtuals'>,
  HydratedDocument<
    InferSchemaType<TSchema>,
    ObtainSchemaGeneric<TSchema, 'TVirtuals'> & ObtainSchemaGeneric<TSchema, 'TInstanceMethods'>,
    ObtainSchemaGeneric<TSchema, 'TQueryHelpers'>
  >,
  TSchema
> &
  ObtainSchemaGeneric<TSchema, 'TStaticMethods'>;
// THydratedDocumentType의 타입 추론 시 모든 이전 Generic들의 추론이 필요하여 _A, _B, _C, _D infer type 선언함
export type DocumentType<TModel extends ModelType = ModelType> = TModel extends Model<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infer _A,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infer _B,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infer _C,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infer _D,
  infer THydratedDocumentType
>
  ? THydratedDocumentType
  : unknown;
export type RawDocumentType<TModel extends ModelType = ModelType> = TModel extends Model<infer RawDocType>
  ? RawDocType
  : unknown;
export type FilterType<TModel extends ModelType = ModelType> = TModel extends Model<infer RawDocType>
  ? FilterQuery<RawDocType>
  : unknown;
// mongoose에서 UpdateQuery 가져옴
type _UpdateQuery<TSchema, AdditionalProperties = AnyObject> = {
  /** @see https://www.mongodb.com/docs/manual/reference/operator/update-field/ */
  $currentDate?: AnyKeys<TSchema> & AdditionalProperties,
  $inc?: AnyKeys<TSchema> & AdditionalProperties,
  $min?: AnyKeys<TSchema> & AdditionalProperties,
  $max?: AnyKeys<TSchema> & AdditionalProperties,
  $mul?: AnyKeys<TSchema> & AdditionalProperties,
  $rename?: Record<string, string>,
  $set?: AnyKeys<TSchema> & AdditionalProperties,
  $setOnInsert?: AnyKeys<TSchema> & AdditionalProperties,
  $unset?: AnyKeys<TSchema> & AdditionalProperties,

  /** @see https://www.mongodb.com/docs/manual/reference/operator/update-array/ */
  $addToSet?: AnyKeys<TSchema> & AdditionalProperties,
  $pop?: AnyKeys<TSchema> & AdditionalProperties,
  $pull?: AnyKeys<TSchema> & AdditionalProperties,
  $push?: AnyKeys<TSchema> & AdditionalProperties,
  $pullAll?: AnyKeys<TSchema> & AdditionalProperties,

  /** @see https://www.mongodb.com/docs/manual/reference/operator/update-bitwise/ */
  $bit?: AnyKeys<TSchema>,
};
// 마이그레이션 후 추가되는 도큐먼트 타입
type InsertDocumentType<TModel extends ModelType = ModelType> = RawDocumentType<TModel> & { _id: null };
// 마이그레이션 후 제거되는 도큐먼트 타입
type DeleteDocumentType = null;
// 마이그레이션 후 변경되는 도큐먼트 타입
type UpdateDocumentType<
  TCurrentModel extends ModelType = ModelType,
  TAppliedModel extends ModelType = ModelType,
> = _UpdateQuery<RawDocumentType<TCurrentModel> & RawDocumentType<TAppliedModel>> & {
  _id: string | mongoose.Types.ObjectId,
};
// 마이그레이션된 도큐먼트의 타입
export type MigratedDocumentType<
  TCurrentModel extends ModelType = ModelType,
  TAppliedModel extends ModelType = ModelType,
> = InsertDocumentType<TAppliedModel> | DeleteDocumentType | UpdateDocumentType<TCurrentModel, TAppliedModel>;

export type Enum<T extends readonly unknown[]> = T extends readonly (infer U)[] ? U : unknown;
export type SchemaMigrationClasses = (new (connection: Connection) => ISchemaMigration)[];

// 일반화된 타입
export interface ISchemaMigration {
  readonly migrationVersion: number,
  readonly prevModel: ModelType,
  readonly nextModel: ModelType,
  filterToGetPrevDocuments(): FilterType,
  filterToGetNextDocuments(): FilterType,
  up(oldDocument: DocumentType): Promise<MigratedDocumentType>,
  down(newDocument: DocumentType): Promise<MigratedDocumentType>,
}

// noinspection JSUnusedGlobalSymbols
export abstract class SchemaMigration<Prev extends Schema = Schema, Next extends Schema = Schema> {
  /**
   * 이 migration의 버전
   */
  public abstract readonly migrationVersion: number;
  /**
   * 이전 버전의 모델
   */
  public abstract readonly prevModel: ModelType<Prev>;
  /**
   * 다음 버전의 모델
   */
  public abstract readonly nextModel: ModelType<Next>;

  constructor(protected connection: Connection) {}

  /**
   * 이전 버전의 도큐먼트를 가져올 때 사용되는 필터
   */
  public abstract filterToGetPrevDocuments(): FilterType<typeof this.prevModel>;
  /**
   * 다음 버전의 도큐먼트를 가져올 때 사용되는 필터
   */
  public abstract filterToGetNextDocuments(): FilterType<typeof this.nextModel>;
  /**
   * 이전 버전의 도큐먼트를 다음 버전으로 변경합니다
   */
  public abstract up(
    oldDocument: DocumentType<typeof this.prevModel>,
  ): Promise<MigratedDocumentType<typeof this.prevModel, typeof this.nextModel>>;
  /**
   * 다음 버전의 도큐먼트를 이전 버전으로 변경합니다
   */
  public abstract down(
    newDocument: DocumentType<typeof this.nextModel>,
  ): Promise<MigratedDocumentType<typeof this.nextModel, typeof this.prevModel>>;
}
