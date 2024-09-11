import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { UserModel } from "../user/user.model";
import { AuthDto } from "./dto/auth.dto";
import { hash, genSalt, compare } from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { RefreshTokenDto } from "./dto/refreshToken.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
    private readonly jwtService: JwtService
  ) {}

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto)

    const tokens = await this.issueTokenPair(String(user._id))

    return {
      user: this.returnUserFieslds(user),
      ...tokens,
    }
  }

  async getNewTokens({refreshToken}: RefreshTokenDto) {
   if(!refreshToken) throw new UnauthorizedException('Please sign in!')

    const result = await this.jwtService.verifyAsync(refreshToken)
    if(!result) throw new UnauthorizedException('Invalid token or expired!')

    const user = await this.UserModel.findById(result._id)

    const tokens = await this.issueTokenPair(String(user._id))

    return {
      user: this.returnUserFieslds(user),
      ...tokens,
    }
  }

  async register(dto: AuthDto) {
    const oldUser = await this.UserModel.findOne({ email: dto.email });
    if (oldUser)
      throw new BadRequestException(
        "User with this email is already in the system"
      );

    const salt = await genSalt(10);

    const newUser = new this.UserModel({
      email: dto.email,
      password: await hash(dto.password, salt)
    });

    const tokens = await this.issueTokenPair(String(newUser._id))
    newUser.save()
    return {
      user: this.returnUserFieslds(newUser),
      ...tokens,
    }
  }

  async validateUser(dto: AuthDto): Promise<UserModel> { // получаем ДТО
    const user = await this.UserModel.findOne({ email: dto.email }); // ищем юзера по емайлу
    if (!user) throw new UnauthorizedException("User not found"); //если юзера нет - вот тебе текст ошибки

    const isValidPassword = await compare(dto.password, user.password); // сравниваем пароли, если тру возвращаем юзера
    if (!isValidPassword) throw new UnauthorizedException("Invalid password"); // если фолс то инвалид пароль

    return user;
  }

  async issueTokenPair(userId:string) {
    const data = {_id: userId}
    
    const refreshToken = await this.jwtService.signAsync(data,{
      expiresIn: '15d'
    })
    const accessToken = await this.jwtService.signAsync(data,{
      expiresIn: '1h'
    })
    return {refreshToken, accessToken }
  }

  returnUserFieslds(user:UserModel){
    return {
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin
    }
  }
}


