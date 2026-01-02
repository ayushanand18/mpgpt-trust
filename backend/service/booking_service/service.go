package bookingservice

import (
	"context"
	"fmt"
	"math"

	"github.com/ayushanand18/mpgpt-trust/backend/constants"
	"github.com/ayushanand18/mpgpt-trust/backend/environment"
	"github.com/ayushanand18/mpgpt-trust/backend/model"
	"github.com/ayushanand18/mpgpt-trust/backend/utils"
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

	libIds := make([]uint32, 0)
	for _, booking := range resp.Bookings {
		libIds = append(libIds, booking.LibraryId)
	}

	// unique lib ids
	libIds = utils.GetUniqueUint32Slice(libIds)

	// fetch library details
	libraries, err := model.GetLibraries(environment.GetDbConn(ctx), model.GetLibrariesReq{
		LibraryIds: libIds,
	})
	if err != nil {
		return resp, err
	}
	librariesMap := make(map[uint32]model.Library)
	for _, library := range libraries {
		librariesMap[library.Id] = library
	}

	// populate library details in bookings
	for i, booking := range resp.Bookings {
		if library, exists := librariesMap[booking.LibraryId]; exists {
			resp.Bookings[i].LibraryName = library.Name
			resp.Bookings[i].LibraryAddress = library.Address
		}
	}

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

	// subtract credits accordingly also
	numberOfSlots := math.Ceil(req.EndTime.Sub(req.StartTime).Hours() / 24) // assuming 1 credit per day

	// get current credits
	credits, err := model.GetCredits(environment.GetDbConn(ctx), model.GetCreditsReq{
		EntityId:   req.MemberId,
		EntityType: constants.UserTypeMember,
	})
	if err != nil {
		return resp, err
	}

	if credits.Value < numberOfSlots {
		return resp, fmt.Errorf("insufficient credits to create booking")
	}

	booking, err := model.CreateBooking(tx, model.CreateBookingReq{
		MemberId:  req.MemberId,
		LibraryId: req.LibraryId,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		Reason:    req.Reason,
	})
	if err != nil {
		return resp, err
	}

	resp.Booking = booking

	err = model.UpdateCredits(tx, model.UpdateCreditsReq{
		EntityId:    req.MemberId,
		EntityType:  constants.UserTypeMember,
		ValueChange: -numberOfSlots,
		UserId:      req.MemberId,
		UserType:    constants.UserTypeMember,
	})
	if err != nil {
		return resp, err
	}

	// create credits history
	err = model.CreateCreditsHistory(tx, model.CreditsHistory{
		EntityId:   req.MemberId,
		EntityType: constants.UserTypeMember,
		Value:      -numberOfSlots,
		Comments:   fmt.Sprintf("Booking ID: %d, Reason: %s", booking.Id, req.Reason),
		Reason:     "Booking deduction",
	})
	if err != nil {
		return resp, err
	}

	return resp, nil
}
