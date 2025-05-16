package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFixedDiscount_ShouldApplyCorrectDiscount(t *testing.T) {
	req := Request{
		OriginalPrice: 100,
		Discounts:     []Discount{{Type: "fixed", Value: 10}},
	}
	resp := applyDiscounts(req)
	assert.Equal(t, 90.0, resp.FinalPrice)
	assert.Equal(t, 1, len(resp.AppliedDiscounts))
	assert.Equal(t, 10.0, resp.AppliedDiscounts[0].Amount)
}

func TestPercentageDiscount_ShouldCalculateCorrectPercentage(t *testing.T) {
	req := Request{
		OriginalPrice: 200,
		Discounts:     []Discount{{Type: "percentage", Value: 25}},
	}
	resp := applyDiscounts(req)
	assert.Equal(t, 150.0, resp.FinalPrice)
	assert.Equal(t, 50.0, resp.AppliedDiscounts[0].Amount)
}

func TestConditionalDiscount_ShouldApplyWhenConditionMet(t *testing.T) {
	req := Request{
		OriginalPrice: 150,
		Discounts:     []Discount{{Type: "conditional", Condition: 100, Value: 20}},
	}
	resp := applyDiscounts(req)
	assert.Equal(t, 130.0, resp.FinalPrice)
	assert.Equal(t, 20.0, resp.AppliedDiscounts[0].Amount)
}

func TestConditionalDiscount_ShouldNotApplyWhenConditionNotMet(t *testing.T) {
	req := Request{
		OriginalPrice: 80,
		Discounts:     []Discount{{Type: "conditional", Condition: 100, Value: 20}},
	}
	resp := applyDiscounts(req)
	assert.Equal(t, 80.0, resp.FinalPrice)
	assert.Equal(t, 0, len(resp.AppliedDiscounts))
}

func TestTieredDiscount_ShouldApplyCorrectTie(t *testing.T) {
	tiers := []Tier{
		{Min: 0, Max: 99, Value: 5},
		{Min: 100, Max: 199, Value: 10},
		{Min: 200, Max: 9999, Value: 25},
	}
	req := Request{
		OriginalPrice: 150,
		Discounts:     []Discount{{Type: "tiered", Tiers: tiers}},
	}
	resp := applyDiscounts(req)
	assert.Equal(t, 140.0, resp.FinalPrice)
	assert.Equal(t, 10.0, resp.AppliedDiscounts[0].Amount)
}

func TestCapDiscount_ShouldLimitTotalDiscount(t *testing.T) {
	req := Request{
		OriginalPrice: 100,
		Discounts: []Discount{
			{Type: "fixed", Value: 30},
			{Type: "percentage", Value: 50},
			{Type: "cap", MaxDiscount: 40},
		},
	}
	resp := applyDiscounts(req)
	assert.Equal(t, 60.0, resp.FinalPrice)
	assert.Equal(t, 3, len(resp.AppliedDiscounts))
	assert.Equal(t, 40.0, resp.AppliedDiscounts[2].CappedAt)
}

func TestStackedDiscounts_ShouldCombineMultipleDiscountTypes(t *testing.T) {
	tiers := []Tier{
		{Min: 0, Max: 99, Value: 5},
		{Min: 100, Max: 199, Value: 10},
		{Min: 200, Max: 9999, Value: 25},
	}
	req := Request{
		OriginalPrice: 250,
		Discounts: []Discount{
			{Type: "fixed", Value: 20},
			{Type: "percentage", Value: 10},
			{Type: "conditional", Condition: 200, Value: 15},
			{Type: "tiered", Tiers: tiers},
			{Type: "cap", MaxDiscount: 60},
		},
	}
	resp := applyDiscounts(req)
	assert.Equal(t, 190.0, resp.FinalPrice)
	assert.Equal(t, 5, len(resp.AppliedDiscounts))
	assert.Equal(t, 60.0, resp.AppliedDiscounts[4].CappedAt)
}
