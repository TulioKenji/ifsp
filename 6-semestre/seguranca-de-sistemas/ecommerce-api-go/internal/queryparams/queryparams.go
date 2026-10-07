package queryparams

import (
	"fmt"
	"net/url"
	"strconv"
)

type Params struct {
	Page       int
	Size       int
	Field      string
	Query      string
}

func Parse(values url.Values) (Params, error) {
	params := Params{
		Page:  1,
		Size: 20,
		Field: "all",
		Query: values.Get("queryparam"),
	}

	if value := values.Get("page"); value != "" {
		page, err := strconv.Atoi(value)
		if err != nil || page < 1 {
			return Params{}, fmt.Errorf("page must be a positive integer")
		}
		params.Page = page
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

	return params, nil
}

func (p Params) Offset() int {
	return (p.Page - 1) * p.Size
}
