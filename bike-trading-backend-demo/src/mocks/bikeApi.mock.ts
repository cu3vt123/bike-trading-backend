// src/mocks/bikeApi.mock.ts
import { MOCK_LISTINGS, MockListing } from "./listings.mock";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const bikeApiMock = {
  async getListings(): Promise<MockListing[]> {
    await sleep(300);
    // Sprint 1: chỉ show xe đã verified (tương đương APPROVE)
    return MOCK_LISTINGS.filter((x) => x.verified);
  },

  async getListingById(id: string): Promise<MockListing | null> {
    await sleep(250);
    const item = MOCK_LISTINGS.find((x) => x.id === id) ?? null;
    // Business rule: chưa verified -> không cho xem như publish
    if (item && !item.verified) return null;
    return item;
  },
};
