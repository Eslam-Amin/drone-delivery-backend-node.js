import { prisma } from "../config/database";

class UserService {
  async createOne(user: any) {
    return prisma.user.create({ data: user });
  }

  async getOneById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }
}

export default new UserService();
