package adminservice

import "context"

type service struct {
}

func (s *service) UpdateCredits(ctx context.Context, req UpdateCreditsReq) (resp UpdateCreditsResp, err error) {
	return resp, nil
}

func (s *service) CreateLibrary(ctx context.Context, req CreateLibraryReq) (resp CreateLibraryResp, err error) {
	return resp, nil
}

func (s *service) DeleteLibrary(ctx context.Context, req DeleteLibraryReq) (resp DeleteLibraryResp, err error) {
	return resp, nil
}

func (s *service) GetLibraries(ctx context.Context, req GetLibrariesReq) (resp GetLibrariesResp, err error) {
	return resp, nil
}

func (s *service) AddAdminLibMapping(ctx context.Context, req AddAdminLibMappingReq) (resp AddAdminLibMappingResp, err error) {
	return resp, nil
}
