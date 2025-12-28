package model

type Counter struct {
	Id    uint32  `gorm:"id,primaryKey"`
	Name  string  `gorm:"name"`
	Value float64 `gorm:"value"`
}

func (b Counter) TableName() string {
	return "counters"
}
