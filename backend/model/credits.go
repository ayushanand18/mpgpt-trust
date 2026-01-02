package model

import (
	"time"

	"github.com/ayushanand18/mpgpt-trust/backend/utils"
	"gorm.io/gorm"
)

type Credits struct {
	Id            uint32    `gorm:"column:id;primaryKey"`
	EntityId      string    `gorm:"column:entity_id"`   // member_id
	EntityType    string    `gorm:"column:entity_type"` // member
	Value         float64   `gorm:"column:value"`       // value
	UpdatedAt     time.Time `gorm:"column:updated_at"`
	UpdatedBy     string    `gorm:"column:updated_by"`
	UpdatedByType string    `gorm:"column:updated_by_type"`
	CreatedAt     time.Time `gorm:"column:created_at"`
	CreatedBy     string    `gorm:"column:created_by"`
	CreatedByType string    `gorm:"column:created_by_type"`
}

func (b Credits) TableName() string {
	return "lms.credits"
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

type GetCreditsReq struct {
	EntityId   string
	EntityType string
}

func GetCredits(tx *gorm.DB, req GetCreditsReq) (Credits, error) {
	var credits Credits
	query := tx.Table(Credits{}.TableName()).
		Where("entity_id = ? AND entity_type = ?", req.EntityId, req.EntityType)

	if err := query.First(&credits).Error; err != nil && err != gorm.ErrRecordNotFound {
		return Credits{}, err
	}

	return credits, nil
}

func CreateCredits(tx *gorm.DB, req Credits) error {
	if err := tx.Table(Credits{}.TableName()).Create(&req).Error; err != nil {
		return err
	}
	return nil
}