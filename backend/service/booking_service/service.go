package bookingservice

import (
	"context"
	"math"

	"github.com/ayushanand18/mpgpt-trust/backend/environment"
	"github.com/ayushanand18/mpgpt-trust/backend/model"
)

type service struct{}

func NewBookingService(ctx context.Context) *service {
	return &service{}
}

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

// CreateBooking
// 1. create a booking entry in bookings table
func (s *service) CreateBooking(ctx context.Context, req CreateBookingReq) (resp CreateBookingResp, err error) {
	tx := environment.GetDbConn(ctx).Begin()
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	booking, err := model.CreateBooking(tx, model.CreateBookingReq{
		MemberId:  req.MemberId,
		LibraryId: req.LibraryId,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
	})
	if err != nil {
		return resp, err
	}

	resp.Booking = booking

	// subtract credits accordingly also
	numberOfSlots := math.Ceil(req.EndTime.Sub(req.StartTime).Hours() / 24) // assuming 1 credit per day
	err = model.UpdateCredits(tx, model.UpdateCreditsReq{
		EntityId:    req.MemberId,
		EntityType:  "member",
		ValueChange: -numberOfSlots,
		UserId:      req.MemberId,
		UserType:    "member",
	})
	if err != nil {
		return resp, err
	}

	return resp, nil
}
