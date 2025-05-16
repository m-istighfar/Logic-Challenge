import { applyDiscounts, Tier, DiscountRequest } from "./discountEngine";

describe("Discount Engine", () => {
  it("should apply fixed discount correctly", () => {
    const req: DiscountRequest = {
      originalPrice: 100,
      discounts: [{ type: "fixed", value: 10 }],
    };
    const resp = applyDiscounts(req);
    expect(resp.finalPrice).toBe(90);
    expect(resp.appliedDiscounts).toHaveLength(1);
    expect(resp.appliedDiscounts[0]).toMatchObject({
      type: "fixed",
      amount: 10,
    });
  });

  it("should calculate percentage discount correctly", () => {
    const req: DiscountRequest = {
      originalPrice: 200,
      discounts: [{ type: "percentage", value: 25 }],
    };
    const resp = applyDiscounts(req);
    expect(resp.finalPrice).toBe(150);
    expect(resp.appliedDiscounts[0]).toMatchObject({
      type: "percentage",
      amount: 50,
    });
  });

  it("should apply conditional discount when condition met", () => {
    const req: DiscountRequest = {
      originalPrice: 150,
      discounts: [{ type: "conditional", condition: 100, value: 20 }],
    };
    const resp = applyDiscounts(req);
    expect(resp.finalPrice).toBe(130);
    expect(resp.appliedDiscounts[0]).toMatchObject({
      type: "conditional",
      amount: 20,
    });
  });

  it("should not apply conditional discount when condition not met", () => {
    const req: DiscountRequest = {
      originalPrice: 80,
      discounts: [{ type: "conditional", condition: 100, value: 20 }],
    };
    const resp = applyDiscounts(req);
    expect(resp.finalPrice).toBe(80);
    expect(resp.appliedDiscounts).toHaveLength(0);
  });

  it("should apply correct tier based on price range", () => {
    const tiers: Tier[] = [
      { min: 0, max: 99, value: 5 },
      { min: 100, max: 199, value: 10 },
      { min: 200, max: 9999, value: 25 },
    ];
    const req: DiscountRequest = {
      originalPrice: 150,
      discounts: [{ type: "tiered", tiers }],
    };
    const resp = applyDiscounts(req);
    expect(resp.finalPrice).toBe(140);
    expect(resp.appliedDiscounts[0]).toMatchObject({
      type: "tiered",
      amount: 10,
    });
  });

  it("should cap total discount at specified maximum", () => {
    const req: DiscountRequest = {
      originalPrice: 100,
      discounts: [
        { type: "fixed", value: 30 },
        { type: "percentage", value: 50 },
        { type: "cap", maxDiscount: 40 },
      ],
    };
    const resp = applyDiscounts(req);
    expect(resp.finalPrice).toBe(60);
    expect(resp.appliedDiscounts).toHaveLength(3);
    expect(resp.appliedDiscounts[2]).toMatchObject({
      type: "cap",
      cappedAt: 40,
    });
  });

  it("should combine multiple discount types correctly", () => {
    const tiers: Tier[] = [
      { min: 0, max: 99, value: 5 },
      { min: 100, max: 199, value: 10 },
      { min: 200, max: 9999, value: 25 },
    ];
    const req: DiscountRequest = {
      originalPrice: 250,
      discounts: [
        { type: "fixed", value: 20 },
        { type: "percentage", value: 10 },
        { type: "conditional", condition: 200, value: 15 },
        { type: "tiered", tiers },
        { type: "cap", maxDiscount: 60 },
      ],
    };
    const resp = applyDiscounts(req);
    expect(resp.finalPrice).toBe(190);
    expect(resp.appliedDiscounts).toHaveLength(5);
    expect(resp.appliedDiscounts[4]).toMatchObject({
      type: "cap",
      cappedAt: 60,
    });
  });
});
