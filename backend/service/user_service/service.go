package userservice

import (
	"context"
	"fmt"

	"github.com/ayushanand18/mpgpt-trust/backend/environment"
	"github.com/ayushanand18/mpgpt-trust/backend/model"
	"github.com/ayushanand18/mpgpt-trust/backend/utils"
)

type service struct{}

func NewUserService(ctx context.Context) *service {
	return &service{}
}

// GetUser
// 1. fetch user details based on user id
func (s *service) GetUser(ctx context.Context, req GetUserReq) (resp GetUserResp, err error) {
	resp.User, err = model.GetUserById(environment.GetDbConn(ctx), req.Id)
	if err != nil {
		return resp, err
	}

	resp.ActiveBookings, err = model.GetBookings(environment.GetDbConn(ctx), model.GetBookingsReq{
		MemberIds: []string{resp.User.MemberId},
		// assuming active bookings are those which are in future
		StartTime: utils.GetCurrentDateStartTime(),
		EndTime:   utils.GetFutureTime(),
	})
	if err != nil {
		return resp, err
	}

	resp.PastBookings, err = model.GetBookings(environment.GetDbConn(ctx), model.GetBookingsReq{
		MemberIds: []string{resp.User.MemberId},
		// assuming past bookings are those which are in past
		StartTime: utils.GetPastTime(),
		EndTime:   utils.GetCurrentDateStartTime(),
	})
	return resp, err
}

// GetUsers
// 1. fetch users based on various filters
func (s *service) GetUsers(ctx context.Context, req GetUsersReq) (resp GetUsersResp, err error) {
	resp.Users, err = model.GetUsers(environment.GetDbConn(ctx), model.GetUsersReq{
		UserIds:      req.UserIds,
		MemberIds:    req.MemberIds,
		Emails:       req.Emails,
		PhoneNumbers: req.PhoneNumbers,
		Limit:        req.Limit,
	})
	return resp, nil
}

// UpdateUser
// 1. update user details
func (s *service) UpdateUser(ctx context.Context, req UpdateUserReq) (resp UpdateUserResp, err error) {
	err = model.UpdateUser(environment.GetDbConn(ctx), model.UpdateUserReq{
		Id:       req.Id,
		MemberId: req.MemberId,
	})
	return resp, nil
}

// CreateUser
// 1. create a new user entry in users table
func (s *service) CreateUser(ctx context.Context, req CreateUserReq) (resp CreateUserResp, err error) {
	if req.Id == "" {
		return resp, fmt.Errorf("user id cannot be empty")
	}

	tx := environment.GetDbConn(ctx).Begin()
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	// first get user by id to check if user already exists
	var newUser model.User
	newUser, userErr := model.GetUserById(tx, req.Id)
	if userErr == nil {
		// user already exists
		resp.Id = newUser.Id
		resp.MemberId = newUser.MemberId
		return resp, nil
	}

	counterVal, err := model.IncrementCounterAndGetValue(ctx, tx, model.IncrementCounterAndGetValueReq{
		EntityName: model.StudentMemberId,
	})
	if err != nil {
		return resp, err
	}

	memberId := fmt.Sprintf(model.CounterPrefixStudent, counterVal)
	newUser, err = model.CreateUser(tx, model.CreateUserReq{
		Id:          req.Id,
		Name:        req.Name,
		UserName:    req.UserName,
		MemberId:    memberId,
		Email:       req.Email,
		PhoneNumber: req.PhoneNumber,
		Role:        req.Role,
	})
	resp.Id = newUser.Id
	resp.MemberId = newUser.MemberId
	return resp, err
}
