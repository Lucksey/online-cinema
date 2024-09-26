import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop, Ref } from "@typegoose/typegoose";
import { MovieModel } from "../movie/movie.model";
import { UserModel } from "../user/user.model";

export interface RatingModel extends Base {}

export class RatingModel extends TimeStamps {

  @prop({ref: () => UserModel })
  userId: Ref<UserModel>[];

  @prop({ref: () => UserModel })
  movieId: Ref<MovieModel>[];

  @prop()
  value: number;
}