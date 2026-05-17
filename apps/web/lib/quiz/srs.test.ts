/**
 * srs.test.ts — Tests Vitest pour l'algorithme SRS.
 *
 * Destination repo : apps/web/lib/quiz/srs.test.ts
 * Run : pnpm --filter web test:unit
 */

import { describe, it, expect } from "vitest";
import {
  initSrs,
  review,
  pickDue,
  countDue,
  DEFAULT_SRS_CONFIG,
  type SrsState,
} from "./srs";

const T0 = new Date("2026-05-17T10:00:00Z");

describe("initSrs", () => {
  it("crée un état initial cohérent", () => {
    const s = initSrs(42, DEFAULT_SRS_CONFIG, T0);
    expect(s.questionId).toBe(42);
    expect(s.intervalDays).toBe(1);
    expect(s.easeFactor).toBe(2.5);
    expect(s.failCount).toBe(1);
    expect(s.successStreak).toBe(0);
    expect(new Date(s.nextReviewAt).getTime()).toBe(
      T0.getTime() + 24 * 60 * 60 * 1000,
    );
  });
});

describe("review — succès", () => {
  it("augmente interval et ease", () => {
    const s = initSrs(1, DEFAULT_SRS_CONFIG, T0);
    const next = review(s, true, DEFAULT_SRS_CONFIG, T0)!;
    expect(next.successStreak).toBe(1);
    expect(next.easeFactor).toBeCloseTo(2.6);
    expect(next.intervalDays).toBe(Math.round(1 * 2.6));
  });

  it("borne ease à maxEase", () => {
    let s: SrsState = { ...initSrs(1, DEFAULT_SRS_CONFIG, T0), easeFactor: 2.75 };
    s = review(s, true)!;
    expect(s.easeFactor).toBeLessThanOrEqual(DEFAULT_SRS_CONFIG.maxEase);
  });

  it("retire de la file après graduation (3 succès consécutifs)", () => {
    let s: SrsState | null = initSrs(1, DEFAULT_SRS_CONFIG, T0);
    s = review(s!, true, DEFAULT_SRS_CONFIG, T0);
    s = review(s!, true, DEFAULT_SRS_CONFIG, T0);
    const final = review(s!, true, DEFAULT_SRS_CONFIG, T0);
    expect(final).toBeNull();
  });
});

describe("review — échec", () => {
  it("reset interval, baisse ease, incrémente failCount, reset streak", () => {
    let s: SrsState = { ...initSrs(1, DEFAULT_SRS_CONFIG, T0), successStreak: 2 };
    s = review(s, false, DEFAULT_SRS_CONFIG, T0)!;
    expect(s.intervalDays).toBe(1);
    expect(s.easeFactor).toBeCloseTo(2.3);
    expect(s.failCount).toBe(2);
    expect(s.successStreak).toBe(0);
  });

  it("borne ease à minEase", () => {
    let s: SrsState = { ...initSrs(1, DEFAULT_SRS_CONFIG, T0), easeFactor: 1.4 };
    s = review(s, false)!;
    expect(s.easeFactor).toBeGreaterThanOrEqual(DEFAULT_SRS_CONFIG.minEase);
  });
});

describe("pickDue", () => {
  it("retourne uniquement les questions dues, triées par date asc puis failCount desc", () => {
    const tNow = new Date("2026-06-01T10:00:00Z");
    const states: SrsState[] = [
      { questionId: 1, nextReviewAt: "2026-06-01T08:00:00Z", intervalDays: 1, easeFactor: 2.5, failCount: 3, successStreak: 0, lastReviewedAt: null },
      { questionId: 2, nextReviewAt: "2026-06-02T10:00:00Z", intervalDays: 2, easeFactor: 2.5, failCount: 1, successStreak: 0, lastReviewedAt: null }, // future
      { questionId: 3, nextReviewAt: "2026-06-01T09:00:00Z", intervalDays: 1, easeFactor: 2.5, failCount: 1, successStreak: 0, lastReviewedAt: null },
      { questionId: 4, nextReviewAt: "2026-06-01T09:00:00Z", intervalDays: 1, easeFactor: 2.5, failCount: 5, successStreak: 0, lastReviewedAt: null },
    ];
    const due = pickDue(states, 10, tNow);
    // 1 (08:00) en premier, puis 4 et 3 (09:00 ex-aequo) triés par failCount desc
    expect(due.map(s => s.questionId)).toEqual([1, 4, 3]);
  });

  it("limite le nombre de résultats", () => {
    const tNow = new Date("2026-06-01T10:00:00Z");
    const states: SrsState[] = Array.from({ length: 20 }, (_, i) => ({
      questionId: i,
      nextReviewAt: "2026-06-01T00:00:00Z",
      intervalDays: 1, easeFactor: 2.5, failCount: 1, successStreak: 0, lastReviewedAt: null,
    }));
    expect(pickDue(states, 5, tNow)).toHaveLength(5);
  });
});

describe("countDue", () => {
  it("compte les questions dues", () => {
    const tNow = new Date("2026-06-01T10:00:00Z");
    const states: SrsState[] = [
      { questionId: 1, nextReviewAt: "2026-05-31T10:00:00Z", intervalDays: 1, easeFactor: 2.5, failCount: 1, successStreak: 0, lastReviewedAt: null },
      { questionId: 2, nextReviewAt: "2026-06-05T10:00:00Z", intervalDays: 5, easeFactor: 2.5, failCount: 1, successStreak: 0, lastReviewedAt: null },
    ];
    expect(countDue(states, tNow)).toBe(1);
  });
});
