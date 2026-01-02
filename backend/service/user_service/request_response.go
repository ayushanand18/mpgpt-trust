package userservice

import "github.com/ayushanand18/mpgpt-trust/backend/model"

type GetUserReq struct {
	Id string
}

type GetUserResp struct {
	User           model.User
	ActiveBookings []model.Bookings
	PastBookings   []model.Bookings
}

type GetUsersReq struct {
	UserIds      []string
	MemberIds    []string
	Emails       []string
	PhoneNumbers []string
	Limit        uint32
}

type GetUsersResp struct {
	Users []model.User
}

type UpdateUserReq struct {
	Id          string
	MemberId    *string // fields to update, are optional
	PhoneNumber *string
	Name        *string
	Email       *string
}

type UpdateUserResp struct {
}

type CreateUserReq struct {
	Id          string // optional, uuid if empty
	Name        string
	UserName    string
	MemberId    string
	Email       string
	PhoneNumber string
	Role        string
}

type CreateUserResp struct {
	Id       string
	MemberId string
}

type GetUserCreditsReq struct {
	MemberId string
}

type GetUserCreditsResp struct {
	CurrentCredits float64
	History        []model.CreditsHistory
}
