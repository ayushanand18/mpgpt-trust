package model

import (
	"time"

	"gorm.io/gorm"
)

type CreditsHistory struct {
	Id         uint32    `gorm:"column:id;primaryKey"`
	EntityId   string    `gorm:"column:entity_id"`
	EntityType string    `gorm:"column:entity_type"`
	Value      float64   `gorm:"column:value"`
	Comments   string    `gorm:"column:comments"`
	Reason     string    `gorm:"column:reason"` // utr_no/booking_id
	CreatedAt  time.Time `gorm:"column:created_at"`
}

func (b CreditsHistory) TableName() string {
	return "lms.credits_history"
}

func CreateCreditsHistory(tx *gorm.DB, req CreditsHistory) error {
	if err := tx.Table(CreditsHistory{}.TableName()).Create(&req).Error; err != nil {
		return err
	}
	return nil
}

type GetCreditsHistoryReq struct {
	EntityId   string
	EntityType string
}

func GetCreditsHistory(tx *gorm.DB, req GetCreditsHistoryReq) ([]CreditsHistory, error) {
	var history []CreditsHistory
	query := tx.Table(CreditsHistory{}.TableName()).
		Where("entity_id = ? AND entity_type = ?", req.EntityId, req.EntityType)

	if err := query.Find(&history).Error; err != nil {
		return nil, err
	}

	return history, nil
}
