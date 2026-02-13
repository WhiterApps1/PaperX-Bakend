import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  private buildKey(action: string, resource: string): string {
    return `${action}:${resource}`;
  }

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const exists = await this.permissionRepo.findOne({
      where: { action: dto.action, resource: dto.resource },
    });

    if (exists) {
      throw new BadRequestException('Permission already exists');
    }

    const permission = this.permissionRepo.create({
      action: dto.action,
      resource: dto.resource,
      key: this.buildKey(dto.action, dto.resource),
    });

    return this.permissionRepo.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepo.find();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepo.findOne({ where: { id } });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    if (dto.action || dto.resource) {
      permission.action = dto.action ?? permission.action;
      permission.resource = dto.resource ?? permission.resource;
      permission.key = this.buildKey(permission.action, permission.resource);
    }

    return this.permissionRepo.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.permissionRepo.findOne({
      where: { id },
      relations: ['profiles'],
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (permission.profiles.length > 0) {
      throw new BadRequestException('Permission is in use');
    }

    await this.permissionRepo.remove(permission);
  }
}
