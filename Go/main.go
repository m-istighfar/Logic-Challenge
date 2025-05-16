package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type Discount struct {
	Type        string  `json:"type"`
	Value       float64 `json:"value,omitempty"`
	Condition   float64 `json:"condition,omitempty"`
	Tiers       []Tier  `json:"tiers,omitempty"`
	MaxDiscount float64 `json:"maxDiscount,omitempty"`
}

type Tier struct {
	Min   float64 `json:"min"`
	Max   float64 `json:"max"`
	Value float64 `json:"value"`
}

type AppliedDiscount struct {
	Type                  string  `json:"type"`
	Amount                float64 `json:"amount,omitempty"`
	OriginalDiscountTotal float64 `json:"originalDiscountTotal,omitempty"`
	CappedAt              float64 `json:"cappedAt,omitempty"`
}

type Request struct {
	OriginalPrice float64    `json:"originalPrice"`
	Discounts     []Discount `json:"discounts"`
}

type Response struct {
	FinalPrice       float64           `json:"finalPrice"`
	AppliedDiscounts []AppliedDiscount `json:"appliedDiscounts"`
}

func applyDiscounts(req Request) Response {
	price := req.OriginalPrice
	applied := []AppliedDiscount{}
	totalDiscount := 0.0
	capIdx := -1
	var capValue float64

	for i, d := range req.Discounts {
		switch d.Type {
		case "fixed":
			amount := d.Value
			if amount > price {
				amount = price
			}
			price -= amount
			totalDiscount += amount
			applied = append(applied, AppliedDiscount{Type: "fixed", Amount: amount})
		case "percentage":
			amount := price * d.Value / 100
			price -= amount
			totalDiscount += amount
			applied = append(applied, AppliedDiscount{Type: "percentage", Amount: amount})
		case "conditional":
			if req.OriginalPrice > d.Condition {
				amount := d.Value
				if amount > price {
					amount = price
				}
				price -= amount
				totalDiscount += amount
				applied = append(applied, AppliedDiscount{Type: "conditional", Amount: amount})
			}
		case "tiered":
			amount := 0.0
			for _, tier := range d.Tiers {
				if req.OriginalPrice >= tier.Min && req.OriginalPrice <= tier.Max {
					amount = tier.Value
					break
				}
			}
			if amount > price {
				amount = price
			}
			price -= amount
			totalDiscount += amount
			applied = append(applied, AppliedDiscount{Type: "tiered", Amount: amount})
		case "cap":
			capIdx = i
			capValue = d.MaxDiscount
		}
	}

	if capIdx != -1 && totalDiscount > capValue {
		finalPrice := req.OriginalPrice - capValue
		applied = append(applied, AppliedDiscount{
			Type:                  "cap",
			OriginalDiscountTotal: totalDiscount,
			CappedAt:              capValue,
		})
		return Response{FinalPrice: finalPrice, AppliedDiscounts: applied}
	}

	finalPrice := price
	return Response{FinalPrice: finalPrice, AppliedDiscounts: applied}
}

func main() {
	input := `{
		"originalPrice": 250,
		"discounts": [
			{ "type": "fixed", "value": 20 },
			{ "type": "percentage", "value": 10 },
			{ "type": "conditional", "condition": 200, "value": 15 },
			{
				"type": "tiered",
				"tiers": [
					{ "min": 0, "max": 99, "value": 5 },
					{ "min": 100, "max": 199, "value": 10 },
					{ "min": 200, "max": 9999, "value": 25 }
				]
			},
			{ "type": "cap", "maxDiscount": 60 }
		]
	}`

	var req Request
	if err := json.Unmarshal([]byte(input), &req); err != nil {
		fmt.Println("Error parsing input:", err)
		os.Exit(1)
	}
	resp := applyDiscounts(req)
	out, _ := json.MarshalIndent(resp, "", "  ")
	fmt.Println(string(out))
}
