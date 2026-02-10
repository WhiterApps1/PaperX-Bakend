import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Profile } from 'src/profile/entities/profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}

  /* ------------------------------- Create ------------------------------- */

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('Email already registered');
    }

    const profile = await this.profileRepo.findOne({
      where: { id: dto.profileId },
    });

    if (!profile) {
      throw new BadRequestException('Invalid profile ID');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      profile,
    });

    return this.userRepo.save(user);
  }

  /* -------------------------------- Read -------------------------------- */

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      relations: ['profile', 'profile.permissions'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['profile', 'profile.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /* ------------------------------- Update ------------------------------- */

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.email) {
      const exists = await this.userRepo.findOne({
        where: { email: dto.email },
      });

      if (exists && exists.id !== id) {
        throw new BadRequestException('Email already in use');
      }

      user.email = dto.email;
    }

    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName;
    }

    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName;
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (dto.profileId !== undefined) {
      if (dto.profileId === null) {
        user.profile = null;
      } else {
        const profile = await this.profileRepo.findOne({
          where: { id: dto.profileId },
        });

        if (!profile) {
          throw new BadRequestException('Invalid profile ID');
        }

        user.profile = profile;
      }
    }

    return this.userRepo.save(user);
  }

  /* ------------------------------- Delete ------------------------------- */

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }

  /* ---------------------------- Status Update --------------------------- */

  async setActive(id: number, status: boolean): Promise<User> {
    const user = await this.findOne(id);

    user.isActive = status;

    return this.userRepo.save(user);
  }
}
