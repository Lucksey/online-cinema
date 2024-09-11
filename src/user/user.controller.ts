import { Controller, Get } from "@nestjs/common";
import { UserService } from "./user.service";
import { Auth } from "src/auth/decorators/auth.decorator";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("profile")
  //@Auth('admin')
  async getprofile() {
    return this.userService.byId()
  }
}

