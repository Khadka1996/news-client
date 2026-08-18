export type UserRole = "admin" | "moderator" | "user";

export type MockUser = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  active?: boolean;
  designation?: string;
  avatarColor?: string;
  lastLogin?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export const DEFAULT_AVATAR_COLOR = "#D97932";

export function getDisplayName(
  user: Partial<MockUser> & { name?: string; firstName?: string; lastName?: string; username?: string }
): string {
  const firstName = user.firstName?.trim();
  const lastName = user.lastName?.trim();
  const legacyName = user.name?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  if (fullName) return fullName;
  if (legacyName) return legacyName;
  if (user.username) return user.username;
  return "User";
}

export function getUserDesignation(user: Pick<MockUser, "role" | "designation">): string {
  if (user.designation) return user.designation;
  if (user.role === "admin") return "Administrator";
  if (user.role === "moderator") return "Moderator";
  return "Reader";
}

export function getAvatarColor(user: Pick<MockUser, "avatarColor">): string {
  return user.avatarColor ?? DEFAULT_AVATAR_COLOR;
}

export const mockUsers: MockUser[] = [
  {
    id: "u_admin_1",
    username: "manish.khadka",
    email: "admin@shikkanepal.com",
    password: "admin123",
    role: "admin",
    firstName: "Manish",
    lastName: "Khadka",
    avatar: null,
    active: true,
    designation: "Editor-in-Chief",
    avatarColor: "#D97932",
  },
  {
    id: "u_admin_2",
    username: "sujata.basnet",
    email: "sujata@shikkanepal.com",
    password: "admin123",
    role: "admin",
    firstName: "Sujata",
    lastName: "Basnet",
    avatar: null,
    active: true,
    designation: "Managing Editor",
    avatarColor: "#D97932",
  },
  {
    id: "u_mod_1",
    username: "laxmi.sherpa",
    email: "moderator@shikkanepal.com",
    password: "mod123",
    role: "moderator",
    firstName: "Laxmi",
    lastName: "Sherpa",
    avatar: null,
    active: true,
    designation: "Content Moderator",
    avatarColor: "#D97932",
  },
  {
    id: "u_mod_2",
    username: "bishal.tamang",
    email: "bishal@shikkanepal.com",
    password: "mod123",
    role: "moderator",
    firstName: "Bishal",
    lastName: "Tamang",
    avatar: null,
    active: true,
    designation: "Content Moderator",
    avatarColor: "#D97932",
  },
  {
    id: "u_user_1",
    username: "nabin.bhandari",
    email: "user@shikkanepal.com",
    password: "user123",
    role: "user",
    firstName: "Nabin",
    lastName: "Bhandari",
    avatar: null,
    active: true,
    designation: "Reader",
    avatarColor: "#D97932",
  },
];
