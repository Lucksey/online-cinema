import { Injectable } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { UserModel } from "./user.model";

@Injectable()
export class UserService {

  constructor(@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>) {}

  async byId() {
    return { email: "return emaile" };
  }
}
