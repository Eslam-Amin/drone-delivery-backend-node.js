import { signToken } from "../utils/jwt";
import { AuthTokenDto } from "../dtos/auth.dto";

export class AuthService {
  generateToken(data: AuthTokenDto) {
    // In a real app, we would validate credentials against the DB here.
    // For this assessment, we sign whatever valid name/role is passed .
    return { token: signToken(data) };
  }
}
