package model

import (
	"context"

	"gorm.io/gorm"
)

type Counter struct {
	Id    uint32 `gorm:"column:id;primaryKey"`
	Name  string `gorm:"column:name"`
	Value uint64 `gorm:"column:value"`
}

func (b Counter) TableName() string {
	return "lms.counters"
}

type EntityName string

const (
	StudentMemberId EntityName = "student_mem_id"
	AdminStudentId  EntityName = "admin_mem_id"
)

const (
	CounterPrefixStudent = "S%08d" // S followed by zero-padded 8 digit number
	CounterPrefixAdmin   = "A%08d"
)

type IncrementCounterAndGetValueReq struct {
	EntityName EntityName
}

func IncrementCounterAndGetValue(
	ctx context.Context,
	tx *gorm.DB,
	req IncrementCounterAndGetValueReq,
) (uint64, error) {

	var val uint64

	err := tx.WithContext(ctx).
		Raw(`
			UPDATE "lms"."counters"
			SET value = value + 1
			WHERE name = ?
			RETURNING value
		`, req.EntityName).
		Scan(&val).Error

	if err != nil {
		return 0, err
	}

	return val, nil
}
