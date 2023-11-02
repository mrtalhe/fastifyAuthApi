import { FastifyRequest, FastifyReply } from "fastify";
import { CreateUserInput, LoginInput } from "./user.schema";
import UserService from "./user.service";
import { FastifyInstance } from "fastify/types/instance";
import container from "../../plugins/di.config";


class UserController {
  private userService: UserService;
  constructor() {
    const userServices =  container.resolve("userService")
    this.userService = userServices
  }

  rigsterUserHandler = async (
    request: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply
  ) => {
    console.log(this.userService);

    // get data from body
    const { name, email, password } = request.body;
    // find user by email
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      return reply.code(400).send({
        message: "The user has already registered",
      });
    }
    // hash user password
    const hashedPassword = await this.userService.hashUserPassword(password);
    // register User
    const newUser = await this.userService.createUser({
      name,
      email,
      password: hashedPassword,
    });
    reply.code(200).send({
      message: "User registered successfully",
      data: newUser,
    });
  };

  loginUserHandler = async(
    request: FastifyRequest<{
      Body: LoginInput;
    }>,
    reply: FastifyReply
  ) => {
    const { email, password } = request.body;

    // check user
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      return reply.code(400).send({
        message: "invalid email or password",
      });
    }
    // check password
    const isValid = await this.userService.comparePassword(
      password,
      user.password
    );
    if (!isValid) {
      return reply.code(400).send({
        message: "invalid email or password",
      });
    }
    // create token and send for user
    const token = await this.userService.createToken(
      user.id,
      process.env.JWT_KEY!
    );
    return reply.code(200).send({
      message: "successfuly logged in",
      accessToken: token,
    });
  }

   getAllUsersHandler = async(request: FastifyRequest, reply: FastifyReply) => {
    const users = await this.userService.getAllUsers();
    return reply.code(200).send({
      message: "all users!",
      data: users,
    });
  }
}

export default UserController;
