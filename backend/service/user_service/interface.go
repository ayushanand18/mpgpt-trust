package userservice

import "context"

type Service interface {
	GetUser(context.Context, GetUserReq) (GetUserResp, error)
	GetUsers(context.Context, GetUsersReq) (GetUsersResp, error)
	UpdateUser(context.Context, UpdateUserReq) (UpdateUserResp, error)
	CreateUser(context.Context, CreateUserReq) (CreateUserResp, error)
}
