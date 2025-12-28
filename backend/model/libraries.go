package model

type Library struct {
	Id        uint32  `gorm:"id,primaryKey"`
	Name      string  `gorm:"name"`
	Latitude  float64 `gorm:"latitude"`
	Longitude float64 `gorm:"longitude"`
	Address   string  `gorm:"address"`
	Remarks   float64 `gorm:"remarks"`
	Status    string  `gorm:"status"` // status: active, closed
}

func (b Library) TableName() string {
	return "libraries"
}
