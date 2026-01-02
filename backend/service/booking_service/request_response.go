package bookingservice

import (
	"time"

	"github.com/ayushanand18/mpgpt-trust/backend/model"
)

type GetBookingsReq struct {
	MemberIds   []string // populated from user -> member mapping if user auth
	LibraryIds  []uint32
	StartTime   time.Time
	EndTime     time.Time
}

type GetBookingsResp struct {
	Bookings []model.Bookings
}

type CreateBookingReq struct {
	UserId    string // to be decoded from request
	MemberId  string // fetched from user -> member mapping
	LibraryId uint32
	StartTime time.Time
	EndTime   time.Time
	Reason    string
}

type CreateBookingResp struct {
	Booking model.Bookings
}
