"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyDiscounts = applyDiscounts;
function applyDiscounts(req) {
    var price = req.originalPrice;
    var applied = [];
    var totalDiscount = 0;
    var capIdx = -1;
    var capValue = 0;
    req.discounts.forEach(function (d, i) {
        switch (d.type) {
            case "fixed": {
                var amount = d.value;
                if (amount > price)
                    amount = price;
                price -= amount;
                totalDiscount += amount;
                applied.push({ type: "fixed", amount: amount });
                break;
            }
            case "percentage": {
                var amount = (price * d.value) / 100;
                price -= amount;
                totalDiscount += amount;
                applied.push({ type: "percentage", amount: amount });
                break;
            }
            case "conditional": {
                if (req.originalPrice > d.condition) {
                    var amount = d.value;
                    if (amount > price)
                        amount = price;
                    price -= amount;
                    totalDiscount += amount;
                    applied.push({ type: "conditional", amount: amount });
                }
                break;
            }
            case "tiered": {
                var amount = 0;
                for (var _i = 0, _a = d.tiers; _i < _a.length; _i++) {
                    var tier = _a[_i];
                    if (req.originalPrice >= tier.min && req.originalPrice <= tier.max) {
                        amount = tier.value;
                        break;
                    }
                }
                if (amount > price)
                    amount = price;
                price -= amount;
                totalDiscount += amount;
                applied.push({ type: "tiered", amount: amount });
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
        var finalPrice = req.originalPrice - capValue;
        applied.push({
            type: "cap",
            originalDiscountTotal: totalDiscount,
            cappedAt: capValue,
        });
        return { finalPrice: finalPrice, appliedDiscounts: applied };
    }
    return { finalPrice: price, appliedDiscounts: applied };
}
// Contoh penggunaan
if (require.main === module) {
    var req = {
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
