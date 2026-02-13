import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { Permission } from 'src/permission/entities/permission.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  /* -------------------------------- Create ------------------------------- */

  async create(dto: CreateProfileDto): Promise<Profile> {
    let permissions: Permission[] = [];

    if (dto.permissionIds?.length) {
      permissions = await this.permissionRepo.find({
        where: { id: In(dto.permissionIds) },
      });

      if (permissions.length !== dto.permissionIds.length) {
        throw new BadRequestException('Invalid permission IDs');
      }
    }

    const profile = this.profileRepo.create({
      name: dto.name,
      role: dto.role,
      permissions,
    });

    return this.profileRepo.save(profile);
  }

  /* -------------------------------- Read -------------------------------- */

  async findAll(): Promise<Profile[]> {
    return this.profileRepo.find({
      relations: ['permissions', 'user'],
    });
  }

  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { id },
      relations: ['permissions', 'user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  /* ------------------------------- Update ------------------------------- */

  async update(id: string, dto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findOne(id);

    if (dto.permissionIds) {
      const permissions = await this.permissionRepo.find({
        where: { id: In(dto.permissionIds) },
      });

      if (permissions.length !== dto.permissionIds.length) {
        throw new BadRequestException('Invalid permission IDs');
      }

      profile.permissions = permissions;
    }

    if (dto.name !== undefined) {
      profile.name = dto.name;
    }

    if (dto.role !== undefined) {
      profile.role = dto.role;
    }

    return this.profileRepo.save(profile);
  }

  /* ------------------------------- Delete ------------------------------- */

  async remove(id: string): Promise<void> {
    const profile = await this.findOne(id);

    if (profile.user?.length > 0) {
      throw new BadRequestException('Profile is assigned to users');
    }

    await this.profileRepo.remove(profile);
  }
}
