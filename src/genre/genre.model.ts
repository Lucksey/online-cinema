import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop } from "@typegoose/typegoose";
import { IsString } from "class-validator";

export interface GenreModel extends Base {}

export class GenreModel extends TimeStamps {
  @prop()
  name: string;

  @prop({ unique: true })
  slug: string;

  @prop()
  description: string;

  @prop()
  icon: string;
}