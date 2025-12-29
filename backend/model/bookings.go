package model

import (
	"time"

	"gorm.io/gorm"
)

type Bookings struct {
	Id        uint32    `gorm:"id,primaryKey"`
	LibraryId uint32    `gorm:"library_id"`
	MemberId  string    `gorm:"member_id"`
	StartTime time.Time `gorm:"start_time"`
	EndTime   time.Time `gorm:"end_time"`
	Status    string    `gorm:"status"` // status: [active, cancelled]
}

func (b Bookings) TableName() string {
	return "bookings"
}

type GetBookingsReq struct {
	MemberIds  []string
	LibraryIds []uint32
	StartTime  time.Time
	EndTime    time.Time
	Statuses   []string
}

func GetBookings(tx *gorm.DB, req GetBookingsReq) ([]Bookings, error) {
	var bookings []Bookings
	query := tx.Table(Bookings{}.TableName())

	if len(req.MemberIds) > 0 {
		// Assuming there's a member_id field in bookings table
		query = query.Where("member_id IN (?)", req.MemberIds)
	}

	if len(req.LibraryIds) > 0 {
		query = query.Where("library_id IN (?)", req.LibraryIds)
	}

	if len(req.Statuses) > 0 {
		query = query.Where("status IN (?)", req.Statuses)
	}

	query = query.Where("start_time >= ? AND end_time <= ?", req.StartTime, req.EndTime)

	if err := query.Find(&bookings).Error; err != nil {
		return nil, err
	}

	return bookings, nil
}
