import { prisma } from "../config/database";
import { GetUsersQueryDto } from "../dtos/user.dto";

class UserService {
  async createOne(user: any) {
    return prisma.user.create({ data: user });
  }

  async getOneById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  async getAll(query: GetUsersQueryDto) {
    const filter = query.role ? { role: query.role } : {};
    return prisma.user.findMany({ where: filter });
  }
}

export default new UserService();
