package model

type Credits struct {
	Id         uint32  `gorm:"id,primaryKey"`
	EntityId   string  `gorm:"entity_id"`   // member_id
	EntityType string  `gorm:"entity_type"` // member
	Value      float64 `gorm:"value"`       // value
}

func (b Credits) TableName() string {
	return "credits"
}
