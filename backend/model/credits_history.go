package model

type CreditsHistory struct {
	Id         uint32  `gorm:"column:id;primaryKey"`
	EntityId   string  `gorm:"column:entity_id"`
	EntityType string  `gorm:"column:entity_type"`
	Value      float64 `gorm:"column:value"`
	Comments   string  `gorm:"column:comments"`
	Reason     string  `gorm:"column:reason"` // utr_no/booking_id
}

func (b CreditsHistory) TableName() string {
	return "lms.credits_history"
}
