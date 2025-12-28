package model

type CreditsHistory struct {
	Id         uint32  `gorm:"id,primaryKey"`
	EntityId   string  `gorm:"entity_id"`
	EntityType string  `gorm:"entity_type"`
	Value      float64 `gorm:"value"`
	Comments   string  `gorm:"comments"`
	Reason     string  `gorm:"reason"` // utr_no/booking_id
}

func (b CreditsHistory) TableName() string {
	return "credits_history"
}
