/**
 * Super Admin (HQ) API DTOs — camelCase JSON from the .NET API.
 */

export type DashboardGranularity = "Day" | "Week" | "Month";

export type DashboardSummary = {
  orders: number;
  grossCents: number;
  refundedCents: number;
  netCents: number;
  averageOrderCents: number;
  statusCounts: Record<string, number>;
  refundFailedCount: number;
  timeZone: string;
  from: string; // DateOnly yyyy-MM-dd
  to: string;
};

export type TimeseriesPoint = {
  periodStart: string;
  orders: number;
  grossCents: number;
  refundedCents: number;
  netCents: number;
  averageOrderCents: number;
};

export type PharmacyListItem = {
  id: string;
  name: string;
  alertRecipients: string[];
  entraGroupId: string;
  isActive: boolean;
  orders: number;
  grossCents: number;
  newRequests: number;
};

export type PharmacyCommand = {
  name: string;
  alertRecipients: string[];
  entraGroupId: string;
  isActive: boolean;
};

export type ClinicAdminItem = {
  id: string;
  slug: string;
  name: string;
  pharmacyId: string;
  pharmacyName: string;
  pricingItemId: string;
  logoUrl: string | null;
  brandColour: string;
  isActive: boolean;
};

export type ClinicCommand = {
  slug: string;
  name: string;
  pharmacyId: string;
  pricingItemId: string;
  logoUrl: string | null;
  brandColour: string | null;
  isActive: boolean;
};

export type PricingItem = {
  id: string;
  name: string;
  priceCents: number;
  deliveryFeeCents: number;
  currency: string;
  isActive: boolean;
};

export type PricingItemCommand = {
  name: string;
  priceCents: number;
  deliveryFeeCents: number;
  isActive: boolean;
};

export type DashboardQueryParams = {
  from?: string;
  to?: string;
  pharmacyId?: string;
  granularity?: DashboardGranularity;
};
