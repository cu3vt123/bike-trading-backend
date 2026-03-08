import apiClient from "@/lib/apiClient";
import { API_PATHS } from "@/lib/apiConfig";
import type {
  BikeDetail,
  Listing,
  ListingState,
  InspectionResult,
  BikeCondition,
} from "@/types/shopbike";

type BikeDto = Record<string, any>;

function pick<T = any>(obj: any, keys: string[], fallback?: T): T {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k] as T;
  }
  return fallback as T;
}

function toListing(dto: BikeDto): Listing {
  const id = String(pick(dto, ["id", "bikeId", "listingId"], ""));
  const brand = String(pick(dto, ["brand", "brandName"], ""));
  const model = String(pick(dto, ["model", "modelName", "bikeModel"], ""));
  const title = String(
    pick(dto, ["title", "name", "descriptionTitle"], `${brand} ${model}`),
  ).trim();

  const state = pick<ListingState>(
    dto,
    ["state", "status", "listingStatus"],
    "PUBLISHED",
  );
  const rawResult = pick<string | undefined>(
    dto,
    ["inspectionResult", "inspectionStatus", "result"],
    undefined,
  );
  const inspectionResult: InspectionResult | undefined =
    typeof rawResult === "string"
      ? (() => {
          const u = rawResult.toUpperCase();
          return ["APPROVE", "REJECT", "NEED_UPDATE"].includes(u) ? (u as InspectionResult) : undefined;
        })()
      : undefined;

  const rawReport = dto.inspectionReport ?? dto.inspection_report ?? dto.inspection;
  const inspectionReport =
    rawReport &&
    typeof rawReport === "object" &&
    rawReport.frameIntegrity &&
    rawReport.drivetrainHealth &&
    rawReport.brakingSystem
      ? {
          frameIntegrity: {
            score: Number(rawReport.frameIntegrity?.score ?? rawReport.frame_integrity?.score ?? 0),
            label: String(rawReport.frameIntegrity?.label ?? rawReport.frame_integrity?.label ?? ""),
          },
          drivetrainHealth: {
            score: Number(rawReport.drivetrainHealth?.score ?? rawReport.drivetrain_health?.score ?? 0),
            label: String(rawReport.drivetrainHealth?.label ?? rawReport.drivetrain_health?.label ?? ""),
          },
          brakingSystem: {
            score: Number(rawReport.brakingSystem?.score ?? rawReport.braking_system?.score ?? 0),
            label: String(rawReport.brakingSystem?.label ?? rawReport.braking_system?.label ?? ""),
          },
        }
      : undefined;

  const inspectionScore =
    typeof dto.inspectionScore === "number"
      ? dto.inspectionScore
      : typeof dto.inspection_score === "number"
        ? dto.inspection_score
        : undefined;

  return {
    id,
    title,
    brand,
    model,
    price: Number(pick(dto, ["price", "sellingPrice"], 0)),
    msrp: dto.msrp ? Number(dto.msrp) : undefined,
    currency: pick(dto, ["currency"], "VND"),
    location: pick<string | undefined>(dto, ["location", "city"], undefined),
    year: dto.year ? Number(dto.year) : undefined,
    frameSize: pick<string | undefined>(dto, ["frameSize", "size"], undefined),
    condition: pick<BikeCondition | undefined>(dto, ["condition"], undefined),
    thumbnailUrl: pick<string | undefined>(
      dto,
      ["thumbnailUrl", "thumbnail", "thumbUrl"],
      undefined,
    ),
    imageUrls: pick<string[] | undefined>(
      dto,
      ["imageUrls", "images"],
      undefined,
    ),
    state,
    inspectionResult,
    inspectionScore: inspectionScore ?? (inspectionReport ? averageReportScore(inspectionReport) : undefined),
    inspectionReport,
  };
}

function averageReportScore(report: {
  frameIntegrity: { score: number };
  drivetrainHealth: { score: number };
  brakingSystem: { score: number };
}): number {
  const a = report.frameIntegrity?.score ?? 0;
  const b = report.drivetrainHealth?.score ?? 0;
  const c = report.brakingSystem?.score ?? 0;
  return (a + b + c) / 3;
}

function toDetail(dto: BikeDto): BikeDetail {
  const base = toListing(dto);
  return {
    ...base,
    description: pick<string | undefined>(
      dto,
      ["description", "details"],
      undefined,
    ),
    specs: pick<Record<string, string> | undefined>(
      dto,
      ["specs", "specifications"],
      undefined,
    ),
    inspectionSummary: pick(
      dto,
      ["inspectionSummary", "inspection"],
      undefined,
    ),
    seller: pick(dto, ["seller"], undefined),
  };
}

export const bikeApi = {
  async getAll(): Promise<Listing[]> {
    const res = await apiClient.get(API_PATHS.BIKES.LIST);
    const raw = Array.isArray(res.data)
      ? res.data
      : (res.data?.content ?? res.data?.data ?? []);
    return (raw as BikeDto[]).map(toListing);
  },

  async getById(id: string): Promise<BikeDetail> {
    const res = await apiClient.get(API_PATHS.BIKES.BY_ID(id));
    const dto = (res.data?.data ?? res.data) as BikeDto;
    return toDetail(dto);
  },
};
