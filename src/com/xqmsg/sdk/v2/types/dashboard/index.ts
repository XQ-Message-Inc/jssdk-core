export enum UserRole {
  SuperUser = "SuperUser",
  Admin = "Admin",
  User = "User",
  Vendor = "Vendor",
  Customer = "Customer",
}

export interface WorkspaceSummary {
  instance: string;
  business: string;
  bid: number;
  workspace: string;
  tag: string;
  role: UserRole;
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

export type EventType = {
  action: string;
  title: string;
  id: string;
};

export type CurrentBusinessSummary = {
  id: number;
  name: string;
  workspace: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal: string;
  tag: string;
  locked: true;
  isPersonal: true;
  subscription: {
    graceExpires: number;
    overflow: number;
    overflowTime: number;
    plan: number;
    seats: number;
    status: number;
    reason: string;
    renewalDate: number;
  };
  icon: string;
};
