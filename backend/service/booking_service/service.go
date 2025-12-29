package bookingservice

import (
	"context"

	"github.com/ayushanand18/mpgpt-trust/backend/environment"
	"github.com/ayushanand18/mpgpt-trust/backend/model"
)

type service struct{}

// GetBookings
// 1. fetch bookings based on MemberIds and LibraryIds
func (s *service) GetBookings(ctx context.Context, req GetBookingsReq) (resp GetBookingsResp, err error) {
	resp.Bookings, err = model.GetBookings(environment.GetDbConn(ctx), model.GetBookingsReq{
		MemberIds:  req.MemberIds,
		LibraryIds: req.LibraryIds,
		StartTime:  req.StartTime,
		EndTime:    req.EndTime,
	})

	return resp, err
}
