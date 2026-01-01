package model

import (
	"time"

	"github.com/ayushanand18/mpgpt-trust/backend/utils"
	"gorm.io/gorm"
)

type Credits struct {
	Id            uint32    `gorm:"id,primaryKey"`
	EntityId      string    `gorm:"entity_id"`   // member_id
	EntityType    string    `gorm:"entity_type"` // member
	Value         float64   `gorm:"value"`       // value
	UpdatedAt     time.Time `gorm:"updated_at"`
	UpdatedBy     string    `gorm:"updated_by"`
	UpdatedByType string    `gorm:"updated_by_type"`
	CreatedAt     time.Time `gorm:"created_at"`
	CreatedBy     string    `gorm:"created_by"`
	CreatedByType string    `gorm:"created_by_type"`
}

func (b Credits) TableName() string {
	return "credits"
}

type UpdateCreditsReq struct {
	EntityId    string
	EntityType  string
	ValueChange float64
	UserId      string
	UserType    string
}

func UpdateCredits(tx *gorm.DB, req UpdateCreditsReq) error {
	updateMap := make(map[string]interface{})
	updateMap["updated_at"] = utils.GetCurrentTimeInIst()
	updateMap["updated_by"] = req.UserId
	updateMap["updated_by_type"] = req.UserType
	updateMap["value"] = gorm.Expr("value + ?", req.ValueChange)

	queryResp := tx.Table(Credits{}.TableName()).
		Where("entity_id = ? AND entity_type = ?", req.EntityId, req.EntityType).
		Updates(updateMap)

	if queryResp.Error != nil {
		return queryResp.Error
	}

	return nil
}
