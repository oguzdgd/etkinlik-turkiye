import { describe, it, expect } from "vitest";
import { toEvent } from "./eventsService";

// A fully-populated Postgres row, snake_case as it comes from Supabase.
const fullRow = {
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
  ends_at: "2026-06-01T20:00:00.000Z",
  time_tbd: false,
  application_deadline: "2026-05-30T23:59:59.000Z",
  image_url: "https://example.com/x.jpg",
  website_url: "https://example.com",
  status: "approved",
  created_by: "user-1",
  created_at: "2026-05-01T10:00:00.000Z",
  moderated_at: "2026-05-02T10:00:00.000Z",
  rejection_reason: null,
};

describe("toEvent", () => {
  it("maps every snake_case column to its camelCase field", () => {
    expect(toEvent(fullRow)).toEqual({
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
      endsAt: "2026-06-01T20:00:00.000Z",
      timeTbd: false,
      applicationDeadline: "2026-05-30T23:59:59.000Z",
      imageURL: "https://example.com/x.jpg",
      websiteUrl: "https://example.com",
      status: "approved",
      createdBy: "user-1",
      createdAt: "2026-05-01T10:00:00.000Z",
      moderatedAt: "2026-05-02T10:00:00.000Z",
      rejectionReason: null,
    });
  });

  it("never leaks snake_case keys into the output", () => {
    const result = toEvent(fullRow);
    const leaked = Object.keys(result).filter((k) => k.includes("_"));
    expect(leaked).toEqual([]);
  });

  it("applies defaults when optional columns are null/undefined", () => {
    const sparseRow = {
      id: "evt-2",
      title: "Minimal",
      status: "approved",
    };
    const result = toEvent(sparseRow);

    expect(result.lat).toBeNull();
    expect(result.lng).toBeNull();
    expect(result.endsAt).toBeNull();
    expect(result.timeTbd).toBe(false);
    expect(result.applicationDeadline).toBeNull();
    expect(result.websiteUrl).toBeNull();
    expect(result.rejectionReason).toBeNull();
  });

  it("preserves falsy-but-valid values (does not coerce 0 to null)", () => {
    const result = toEvent({ ...fullRow, lat: 0, lng: 0 });
    expect(result.lat).toBe(0);
    expect(result.lng).toBe(0);
  });

  it("keeps an explicit time_tbd: true", () => {
    expect(toEvent({ ...fullRow, time_tbd: true }).timeTbd).toBe(true);
  });
});
