package queryparams

import (
	"ecommerce-api-go/internal/validation"
	"fmt"
	"net/url"
	"strconv"
	"strings"
)

type Params struct {
	IDs   []string
	Page  int
	Size  int
	Field string
	Query string
}

func Parse(values url.Values) (Params, error) {
	params := Params{
		Page:  1,
		Size:  20,
		Field: "all",
		Query: values.Get("queryparam"),
	}
	if raw := values.Get("ids"); raw != "" {
		if len(raw) > 1850 {
			return Params{}, fmt.Errorf("at most 50 product IDs")
		}
		ids := strings.Split(raw, ",")
		if len(ids) > 50 {
			return Params{}, fmt.Errorf("at most 50 product IDs")
		}
		for _, id := range ids {
			if !validation.UUID(id) {
				return Params{}, fmt.Errorf("invalid product ID")
			}
		}
		params.IDs = ids
		params.Size = 50
	}

	if value := values.Get("page"); value != "" {
		page, err := strconv.Atoi(value)
		if err != nil || page < 1 || page > 10000 {
			return Params{}, fmt.Errorf("page must be a positive integer")
		}
		params.Page = page
	}
	if len(params.Query) > 120 {
		return Params{}, fmt.Errorf("queryparam must have at most 120 bytes")
	}
	if !validation.PlainText(params.Query) {
		return Params{}, fmt.Errorf("queryparam must be valid text without control characters")
	}
	if value := values.Get("size"); value != "" {
		size, err := strconv.Atoi(value)
		if err != nil || size < 1 || size > 100 {
			return Params{}, fmt.Errorf("size must be between 1 and 100")
		}
		params.Size = size
	}
	if value := values.Get("field"); value != "" {
		params.Field = value
	}
	switch params.Field {
	case "all", "name", "description", "sku":
	default:
		return Params{}, fmt.Errorf("invalid search field")
	}

	return params, nil
}

func (p Params) Offset() int {
	return (p.Page - 1) * p.Size
}
