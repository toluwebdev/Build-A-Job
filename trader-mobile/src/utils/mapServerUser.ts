import type { User, UserStatus, UserType } from "../types/auth";

/** Shape returned by GET /api/auth/user (Mongoose JSON). */
export type ServerUserJson = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status?: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function mapRole(role: string | undefined): UserType {
  return role === "trader" ? "TRADESPERSON" : "HOMEOWNER";
}

function mapStatus(status: string | undefined): UserStatus {
  if (status === "inactive") return "INACTIVE";
  if (status === "active") return "ACTIVE";
  return "ACTIVE";
}

export function mapServerUserToAppUser(u: ServerUserJson): User {
  const verified = u.isVerified === true;
  const createdAt =
    typeof u.createdAt === "string"
      ? u.createdAt
      : new Date().toISOString();
  const updatedAt =
    typeof u.updatedAt === "string"
      ? u.updatedAt
      : new Date().toISOString();

  return {
    id: String(u._id),
    email: u.email,
    firstName: u.firstName ?? "",
    lastName: u.lastName ?? "",
    type: mapRole(u.role),
    status: mapStatus(u.status),
    emailVerified: verified,
    phoneVerified: false,
    onboardingComplete: verified,
    onboardingStep: verified ? "COMPLETE" : "WELCOME",
    phone: undefined,
    avatar: undefined,
    createdAt,
    updatedAt,
  };
}
