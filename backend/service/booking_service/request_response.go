package bookingservice

import (
	"time"

	"github.com/ayushanand18/mpgpt-trust/backend/model"
)

type GetBookingsReq struct {
	MemberIds  []string
	LibraryIds []uint32
	StartTime  time.Time
	EndTime    time.Time
}

type GetBookingsResp struct {
	Bookings []model.Bookings
}
