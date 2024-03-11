import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({
  versionKey: false,
  timestamps: false,
})
export class Example {
  @Prop({ required: true })
  public _id!: mongoose.Types.ObjectId;

  @Prop({ required: true })
  public something!: number;
}

export const ExampleSchema = SchemaFactory.createForClass(Example);
