package model

import "time"

type Bookings struct {
	Id        uint32    `gorm:"id,primaryKey"`
	LibraryId uint32    `gorm:"library_id"`
	StartTime time.Time `gorm:"start_time"`
	EndTime   time.Time `gorm:"end_time"`
	Status    string    `gorm:"status"` // status: [active, cancelled]
}

func (b Bookings) TableName() string {
	return "bookings"
}
