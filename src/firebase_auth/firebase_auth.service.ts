import * as admin from 'firebase-admin';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getAuth, Auth } from 'firebase-admin/auth';
import { FirebaseProvider } from '@alpha018/nestjs-firebase-auth';
import { Roles } from './roles.enum';

@Injectable()
export class FirebaseAuthService {
  private readonly auth: Auth;

  constructor(private readonly firebaseProvider: FirebaseProvider) {
    this.auth = getAuth();
  }

  async createUser(email: string, password: string) {
    const user = await this.auth.createUser({
      email,
      password,
      emailVerified: true,
      disabled: false,
    });

    return {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
    };
  }

  async setRoles(uid: string, roles: Roles[]) {
    await this.firebaseProvider.setClaimsRoleBase<Roles>(uid, roles);

    return {
      status: `Roles assigned to UID: ${uid}`,
      roles,
    };
  }

  async decodeTokenFromRequest(req: any) {
    const authHeader = req.headers?.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const token = authHeader.substring(7);
    return admin.auth().verifyIdToken(token);
  }

  async decodeToken(token: string) {
    return admin.auth().verifyIdToken(token);
  }
}
