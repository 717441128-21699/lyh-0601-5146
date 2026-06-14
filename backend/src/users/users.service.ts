import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(username: string, email: string, password: string): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      nickname: username,
      role: UserRole.USER,
    });

    return this.usersRepository.save(user);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.usersRepository.findAndCount({
      skip,
      take: pageSize,
      order: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'DESC' },
      select: ['id', 'username', 'email', 'nickname', 'avatar', 'role', 'rating', 'contestCount', 'solvedCount', 'submissionCount', 'organization', 'bio', 'isBanned', 'createdAt', 'updatedAt'],
    });

    return { items, total, page, pageSize };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'nickname', 'avatar', 'role', 'rating', 'contestCount', 'solvedCount', 'submissionCount', 'organization', 'bio', 'isBanned', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async updateRating(id: number, ratingChange: number): Promise<User> {
    const user = await this.findOne(id);
    user.rating = Math.max(0, user.rating + ratingChange);
    return this.usersRepository.save(user);
  }

  async incrementContestCount(id: number): Promise<void> {
    await this.usersRepository.increment({ id }, 'contestCount', 1);
  }

  async incrementSolvedCount(id: number): Promise<void> {
    await this.usersRepository.increment({ id }, 'solvedCount', 1);
  }

  async incrementSubmissionCount(id: number): Promise<void> {
    await this.usersRepository.increment({ id }, 'submissionCount', 1);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async banUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.isBanned = true;
    return this.usersRepository.save(user);
  }

  async unbanUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.isBanned = false;
    return this.usersRepository.save(user);
  }

  async getRankings(paginationDto: PaginationDto) {
    const { page, pageSize } = paginationDto;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.usersRepository.findAndCount({
      skip,
      take: pageSize,
      order: { rating: 'DESC', solvedCount: 'DESC' },
      where: { isBanned: false },
      select: ['id', 'username', 'nickname', 'avatar', 'rating', 'solvedCount', 'contestCount'],
    });

    return { items, total, page, pageSize };
  }
}
