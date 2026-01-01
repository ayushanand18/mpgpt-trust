package adminservice

import "context"

type Service interface {
	UpdateCredits(context.Context, UpdateCreditsReq) (UpdateCreditsResp, error)
	CreateLibrary(context.Context, CreateLibraryReq) (CreateLibraryResp, error)
	GetLibraries(context.Context, GetLibrariesReq) (GetLibrariesResp, error)
	AddAdminLibMapping(context.Context, AddAdminLibMappingReq) (AddAdminLibMappingResp, error)
}
