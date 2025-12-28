package bookingservice

import "context"

type service struct{}

func (s *service) GetBookings(ctx context.Context, req GetBookingsReq) (resp GetBookingsResp, err error) {
	return resp, nil
}
