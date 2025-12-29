package bookingservice

import "context"

type Service interface {
	GetBookings(context.Context, GetBookingsReq) (GetBookingsResp, error)
	CreateBooking(context.Context, CreateBookingReq) (CreateBookingResp, error)
}
