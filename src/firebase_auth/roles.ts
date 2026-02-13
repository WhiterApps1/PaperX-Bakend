export enum Roles {
  ROOT = 'ROOT',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export const ROLE_RANK: Record<Roles, number> = {
  [Roles.ROOT]: 4,
  [Roles.SUPER_ADMIN]: 3,
  [Roles.ADMIN]: 2,
  [Roles.USER]: 1,
};
