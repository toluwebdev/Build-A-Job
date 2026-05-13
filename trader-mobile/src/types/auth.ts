/** Shared with homeowner mobile — maps server `role` to app routing. */
export type UserType = "HOMEOWNER" | "TRADESPERSON" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
export type OnboardingStep =
  | "WELCOME"
  | "PROFILE"
  | "LOCATION"
  | "PREFERENCES"
  | "COMPLETE";

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  type: UserType;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  onboardingComplete: boolean;
  onboardingStep: OnboardingStep;
  createdAt: string;
  updatedAt: string;
}
