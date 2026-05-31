import { describe, it, expect } from "vitest";
import { mapEvent } from "./favoritesService";

// favorites' mapEvent is a deliberate, smaller projection of the events row
// (it duplicates eventsService.toEvent on purpose — cross-feature service
// imports are banned). This test pins down exactly which fields it returns.
const row = {
  id: "evt-1",
  title: "React İstanbul Meetup",
  description: "Aylık buluşma",
  category: "teknoloji",
  type: "in_person",
  city: "İstanbul",
  location_text: "Kadıköy",
  online_url: null,
  lat: 40.99,
  lng: 29.02,
  starts_at: "2026-06-01T18:00:00.000Z",
  image_url: "https://example.com/x.jpg",
  status: "approved",
  created_by: "user-1",
  created_at: "2026-05-01T10:00:00.000Z",
  moderated_at: "2026-05-02T10:00:00.000Z",
};

describe("mapEvent (favorites)", () => {
  it("maps the favorites projection to camelCase", () => {
    expect(mapEvent(row)).toEqual({
      id: "evt-1",
      title: "React İstanbul Meetup",
      description: "Aylık buluşma",
      category: "teknoloji",
      type: "in_person",
      city: "İstanbul",
      locationText: "Kadıköy",
      onlineUrl: null,
      lat: 40.99,
      lng: 29.02,
      startsAt: "2026-06-01T18:00:00.000Z",
      imageURL: "https://example.com/x.jpg",
      status: "approved",
      createdBy: "user-1",
      createdAt: "2026-05-01T10:00:00.000Z",
      moderatedAt: "2026-05-02T10:00:00.000Z",
    });
  });

  it("never leaks snake_case keys into the output", () => {
    const leaked = Object.keys(mapEvent(row)).filter((k) => k.includes("_"));
    expect(leaked).toEqual([]);
  });

  it("coalesces missing coordinates to null", () => {
    const result = mapEvent({ ...row, lat: null, lng: undefined });
    expect(result.lat).toBeNull();
    expect(result.lng).toBeNull();
  });

  it("preserves falsy-but-valid coordinates (does not coerce 0 to null)", () => {
    const result = mapEvent({ ...row, lat: 0, lng: 0 });
    expect(result.lat).toBe(0);
    expect(result.lng).toBe(0);
  });
});
