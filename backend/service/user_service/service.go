package userservice

import "context"

type service struct{}

func (s *service) GetUser(ctx context.Context, req GetUserReq) (resp GetUserResp, err error) {
	return resp, nil
}

func (s *service) GetUsers(ctx context.Context, req GetUsersReq) (resp GetUsersResp, err error) {
	return resp, nil
}

func (s *service) UpdateUser(ctx context.Context, req UpdateUserReq) (resp UpdateUserResp, err error) {
	return resp, nil
}

func (s *service) CreateUser(ctx context.Context, req CreateUserReq) (resp CreateUserResp, err error) {
	return resp, nil
}
