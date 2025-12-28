package bookingservice

import "github.com/ayushanand18/mpgpt-trust/backend/model"

type GetBookingsReq struct {
	UserIds    []string
	LibraryIds []uint32
}

type GetBookingsResp struct {
	Bookings []model.Bookings
}
