import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { UserModel } from "./user.model";
import { UpdateUserDto } from "./dto/update-user.dto";
import { genSalt, hash } from "bcryptjs";
import { Types } from "mongoose";

@Injectable()
export class UserService {

  constructor(@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>) {
  }

  async byId(_id: string) {
    const user = await this.UserModel.findById(_id);
    if (!user) throw new NotFoundException("User not found");

    return user;
  }

  async updateProfile(_id: string, dto: UpdateUserDto) {
    const user = await this.byId(_id); // получаем нашего Юзера
    const isSameUser = await this.UserModel.findOne({ email: dto.email });
// так как у нас идет обновление в т.ч. емайла, то нужно проверить свободен ли он
    if (isSameUser && String(_id) !== String(isSameUser._id))
      //если занято ИИ при этом АйДи user не равен АйДи isSameUser
      throw new NotFoundException("Email busy");

    if (dto.password) { // если пароль есть
      const salt = await genSalt(10); // шифруем пароль при помощи соли
      user.password = await hash(dto.password, salt); // юзеру записываем пароль
    }

    user.email = dto.email;
    if (dto.isAdmin || dto.isAdmin === false) user.isAdmin = dto.isAdmin;

    await user.save();

    return;
  }

  //сервис для получения КОЛИЧЕСТВА всех юзеров
  async getCount() {
    return this.UserModel.find({}).count().exec(); // тут шляпа find
  }

  //сервис для получения всех ЮЗЕРОВ
  async getAll(searchTerm?: string) {
    let options = {};

    if (searchTerm)
      options = {
        $or: [
          {
            email: new RegExp(searchTerm, "i")
          }
        ]
      };

    return this.UserModel.find(options).select( // тут шляпа find
      "-password, -updateAt, -__V").sort({ createdAt: "desc" }).exec()

  }

  //сервис для УДАЛКНИЯ ЮЗЕРОВ
  async delete(id: string) {
    return this.UserModel.findByIdAndDelete(id).exec();
  }

  async toggleFavorite(movieId: Types.ObjectId, user: UserModel) {
    const {_id, favorites} = user

  await this.UserModel.findByIdAndUpdate(_id, {
    favorites: favorites.includes(movieId)
      ? favorites.filter((id) => String(id) === String(movieId))
      : [...favorites, movieId]
  })
  }

  async getFavoriteMovies(_id: Types.ObjectId) {
    return this.UserModel.findById(_id,"favorites").populate({path: "favorites", populate:{path: "genres"
    } }).exec().then(data => data.favorites)
  }
}
