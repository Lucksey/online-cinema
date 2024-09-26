import { IsString } from "class-validator";

export class SlugDto {
  @IsString()
  slug:string
}