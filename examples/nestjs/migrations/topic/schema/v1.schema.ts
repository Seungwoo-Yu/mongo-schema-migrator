import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({
  versionKey: '__v',
  timestamps: false,
})
export class Example {
  @Prop({ required: true })
  public _id!: mongoose.Types.ObjectId;

  @Prop({ required: true, default: 1 })
  public __v!: number;

  @Prop({ required: true })
  public something!: number;
}

export const ExampleSchema = SchemaFactory.createForClass(Example);
