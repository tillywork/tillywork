import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryBuilder, Repository } from "typeorm";
import { User } from "./user.entity";
import { CreateUserDto } from "./dto/create.user.dto";
import { UpdateUserDto } from "./dto/update.user.dto";
import bcrypt from "bcrypt";

export type UserFindAllResult = {
    total: number;
    users: User[];
};

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    async findAll(): Promise<UserFindAllResult> {
        const result = await this.usersRepository.findAndCount({});
        return { users: result[0], total: result[1] };
    }

    async findOne(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: {
                id,
            },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findOneByEmail(email: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: {
                email,
            },
        });
        return user;
    }

    async findOneByEmailWithPassword(email: string): Promise<User> {
        const user = this.usersRepository
            .createQueryBuilder("user")
            .addSelect('user.password')
            .where(`email = :email`, { email })
            .getOne();

        return user;
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.usersRepository.create(createUserDto);
        user.password = await this.hashPassword(createUserDto.password);
        return this.usersRepository.save(user);
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        return hashedPassword;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        this.usersRepository.merge(user, updateUserDto);
        return this.usersRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findOne(id);
        await this.usersRepository.softRemove(user);
    }
}
