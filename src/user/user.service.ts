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
import { FirebaseAuthService } from 'src/firebase_auth/firebase_auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,

    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  /* ------------------------------- Create ------------------------------- */

  async create(dto: CreateUserDto) {
    // Validate Profile
    const profile = await this.profileRepo.findOne({
      where: { id: dto.profileId },
    });

    if (!profile) {
      throw new BadRequestException('Invalid profileId');
    }

    // Check Duplicate
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    let passwordHash: string | null = null;
    let firebaseUser;

    // Create Firebase User
    if (dto.password) {
      firebaseUser = await this.firebaseAuthService.createUser(
        dto.email,
        dto.password,
      );

      // Hash Password
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    // Create DB User
    const user = this.userRepo.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      profile,
    });

    const newUser = await this.userRepo.save(user);

    // Assign Firebase Roles
    if (firebaseUser && newUser.profile?.role?.length) {
      await this.firebaseAuthService.setRoles(
        firebaseUser.uid,
        newUser.profile.role,
      );
    }

    // Send Email
    // const emailHtml = newUserWelcomeEmail({
    //   user: newUser,
    //   profile: newUser.profile,
    //   password: dto.password, // only for welcome email
    // });

    // await this.emailService.sendEmail(
    //   newUser.email,
    //   `Welcome to PaperX, ${newUser.firstName}!`,
    //   emailHtml,
    // );

    return newUser;
  }

  /* -------------------------------- Read -------------------------------- */

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      relations: ['profile', 'profile.permissions'],
    });
  }

  async findOne(id: string): Promise<User> {
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

  async update(id: string, dto: UpdateUserDto): Promise<User> {
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

  async remove(id: string): Promise<{ succss: boolean; message: string }> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);

    return { succss: true, message: 'User removed successfully' };
  }

  /* ---------------------------- Status Update --------------------------- */

  async setActive(id: string, status: boolean): Promise<User> {
    const user = await this.findOne(id);

    user.isActive = status;

    return this.userRepo.save(user);
  }

  /* -------------------------- Hierarchy Management -------------------------- */

  async assignParent(userId: string, parentId: string): Promise<void> {
    if (userId === parentId) {
      throw new BadRequestException('User cannot be parent of themselves');
    }

    const [user, parent] = await Promise.all([
      this.userRepo.findOne({
        where: { id: userId },
        relations: ['parent'],
      }),
      this.userRepo.findOne({
        where: { id: parentId },
        relations: ['parent'],
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!parent) {
      throw new NotFoundException('Parent user not found');
    }

    // Prevent circular hierarchy
    let current: User | null = parent;

    while (current) {
      if (current.id === userId) {
        throw new BadRequestException('Circular hierarchy detected');
      }

      current = await this.userRepo.findOne({
        where: { id: current?.parent?.id ?? '' },
        relations: ['parent'],
      });
    }

    user.parent = parent;

    await this.userRepo.save(user);
  }

  /* -------------------------------------------------------------------------- */

  async removeParent(userId: string): Promise<void> {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.parent = null;

    await this.userRepo.save(user);
  }

  /* -------------------------------------------------------------------------- */

  async getChildren(parentId: string): Promise<User[]> {
    const parent = await this.userRepo.findOneBy({
      id: parentId,
    });

    if (!parent) {
      throw new NotFoundException('Parent user not found');
    }

    const children = await this.userRepo.find({
      where: {
        parent: { id: parentId },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return children;
  }
}
