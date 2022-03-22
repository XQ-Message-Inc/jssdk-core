export enum UserRole {
  SuperUser = "SuperUser",
  Admin = "Admin",
  User = "User",
  Vendor = "Vendor",
  Customer = "Customer",
}

export enum UserNotificationStatus {
  None = 0,
  WarningsAndAlerts = 2,
  AlertsOnly = 3,
}

export enum UserStatus {
  Invited = "Invited",
  Validated = "Validated",
  Disabled = "Disabled",
}

export type ContactSummary = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  title?: string;
  lastLogin: number;
  moreInfo: string;
  role: UserRole;
  notificationsStatus: UserNotificationStatus;
  status: UserStatus;
  bid: number;
};
