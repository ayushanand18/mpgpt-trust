package model

import (
	"time"

	"github.com/ayushanand18/mpgpt-trust/backend/utils"
	"gorm.io/gorm"
)

type Bookings struct {
	Id             uint32    `gorm:"column:id;primaryKey"`
	LibraryId      uint32    `gorm:"column:library_id"`
	MemberId       string    `gorm:"column:member_id"`
	StartTime      time.Time `gorm:"column:start_time"`
	EndTime        time.Time `gorm:"column:end_time"`
	Status         string    `gorm:"column:status"` // status: [active, cancelled]
	CreatedAt      time.Time `gorm:"column:created_at"`
	Purpose        string    `gorm:"column:purpose"`
	LibraryName    string    `gorm:"-"`
	LibraryAddress string    `gorm:"-"`
}

func (b Bookings) TableName() string {
	return "lms.bookings"
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

type CreateBookingReq struct {
	MemberId  string
	LibraryId uint32
	StartTime time.Time
	EndTime   time.Time
	Reason    string
}

func CreateBooking(tx *gorm.DB, req CreateBookingReq) (Bookings, error) {
	booking := Bookings{
		MemberId:  req.MemberId,
		LibraryId: req.LibraryId,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		Status:    "active",
		CreatedAt: utils.GetCurrentTimeInIst(),
		Purpose:   req.Reason,
	}

	if err := tx.Table(Bookings{}.TableName()).Create(&booking).Error; err != nil {
		return Bookings{}, err
	}

	return booking, nil
}
