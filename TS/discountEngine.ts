export type Discount =
  | { type: "fixed"; value: number }
  | { type: "percentage"; value: number }
  | { type: "conditional"; condition: number; value: number }
  | { type: "tiered"; tiers: Tier[] }
  | { type: "cap"; maxDiscount: number };

export type Tier = {
  min: number;
  max: number;
  value: number;
};

export type AppliedDiscount =
  | { type: "fixed" | "percentage" | "conditional" | "tiered"; amount: number }
  | { type: "cap"; originalDiscountTotal: number; cappedAt: number };

export interface DiscountRequest {
  originalPrice: number;
  discounts: Discount[];
}

export interface DiscountResponse {
  finalPrice: number;
  appliedDiscounts: AppliedDiscount[];
}

export function applyDiscounts(req: DiscountRequest): DiscountResponse {
  let price = req.originalPrice;
  let applied: AppliedDiscount[] = [];
  let totalDiscount = 0;
  let capIdx = -1;
  let capValue = 0;

  req.discounts.forEach((d, i) => {
    switch (d.type) {
      case "fixed": {
        let amount = d.value;
        if (amount > price) amount = price;
        price -= amount;
        totalDiscount += amount;
        applied.push({ type: "fixed", amount });
        break;
      }
      case "percentage": {
        let amount = (price * d.value) / 100;
        price -= amount;
        totalDiscount += amount;
        applied.push({ type: "percentage", amount });
        break;
      }
      case "conditional": {
        if (req.originalPrice > d.condition) {
          let amount = d.value;
          if (amount > price) amount = price;
          price -= amount;
          totalDiscount += amount;
          applied.push({ type: "conditional", amount });
        }
        break;
      }
      case "tiered": {
        let amount = 0;
        for (const tier of d.tiers) {
          if (req.originalPrice >= tier.min && req.originalPrice <= tier.max) {
            amount = tier.value;
            break;
          }
        }
        if (amount > price) amount = price;
        price -= amount;
        totalDiscount += amount;
        applied.push({ type: "tiered", amount });
        break;
      }
      case "cap": {
        capIdx = i;
        capValue = d.maxDiscount;
        break;
      }
    }
  });

  if (capIdx !== -1 && totalDiscount > capValue) {
    const finalPrice = req.originalPrice - capValue;
    applied.push({
      type: "cap",
      originalDiscountTotal: totalDiscount,
      cappedAt: capValue,
    });
    return { finalPrice, appliedDiscounts: applied };
  }

  return { finalPrice: price, appliedDiscounts: applied };
}

if (require.main === module) {
  const req: DiscountRequest = {
    originalPrice: 250,
    discounts: [
      { type: "fixed", value: 20 },
      { type: "percentage", value: 10 },
      { type: "conditional", condition: 200, value: 15 },
      {
        type: "tiered",
        tiers: [
          { min: 0, max: 99, value: 5 },
          { min: 100, max: 199, value: 10 },
          { min: 200, max: 9999, value: 25 },
        ],
      },
      { type: "cap", maxDiscount: 60 },
    ],
  };
  console.log(JSON.stringify(applyDiscounts(req), null, 2));
}
