import apiClient from "@/lib/apiClient";
import type {
  BikeDetail,
  Listing,
  ListingStatus,
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

  const status = pick<ListingStatus>(
    dto,
    ["status", "listingStatus"],
    "PUBLISHED",
  );
  const inspectionResult = pick<InspectionResult | undefined>(
    dto,
    ["inspectionResult", "inspectionStatus", "result"],
    undefined,
  );

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
    status,
    inspectionResult,
  };
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
    const res = await apiClient.get("/bikes");
    const raw = Array.isArray(res.data)
      ? res.data
      : (res.data?.content ?? res.data?.data ?? []);
    return (raw as BikeDto[]).map(toListing);
  },

  async getById(id: string): Promise<BikeDetail> {
    const res = await apiClient.get(`/bikes/${id}`);
    const dto = (res.data?.data ?? res.data) as BikeDto;
    return toDetail(dto);
  },
};
