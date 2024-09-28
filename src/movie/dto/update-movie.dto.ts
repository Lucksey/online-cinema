import { IsArray, IsObject, IsString } from "class-validator";
import { prop } from "@typegoose/typegoose";

export class Parameters {
  @prop()
  year: number;

  @prop()
  duration: number;

  @prop()
  country: string;
}

export class UpdateMovieDto {
  @IsString()
  poster: string;

  @IsString()
  bigPoster: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsObject()
  parameters?: Parameters;

  @IsString()
  videoUrl: string;

  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @IsArray()
  @IsString({ each: true })
  actors: string[];

  isSendTelegram?:boolean
}