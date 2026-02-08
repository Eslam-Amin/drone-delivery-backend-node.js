import { signToken } from "../utils/jwt";
import { AuthTokenDto } from "../dtos/auth.dto";
import { Role } from "@prisma/client";
import droneService from "./drone.service";
import { ApiError } from "../utils/ApiError";
import userService from "../services/user.service";

export class AuthService {
  async generateToken(data: AuthTokenDto) {
    const { id, role } = data;
    if (role.toUpperCase() === Role.DRONE) {
      const drone = await droneService.getOneById(id!);
      if (!drone) throw ApiError.NotFound("Drone not found");
    } else {
      const user = await userService.getOneById(id);
      if (!user) throw ApiError.NotFound("User not found");
      else if (user.role !== role) throw ApiError.Unauthorized("role mismatch");
    }
    return { token: signToken(data) };
  }
}
