// Package dbassets inclui os SQLs no executável de preparação, sem caminhos do SO.
package dbassets

import "embed"

//go:embed db.sql products.sql products-images.sql migrations/*.sql
var Files embed.FS
