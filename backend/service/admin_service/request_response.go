package adminservice

import "github.com/ayushanand18/mpgpt-trust/backend/model"

type UpdateCreditsReq struct {
	UserId        string
	CreditsAmount float64
	RefNumber     string // UTR Number for addition/bookingId for deduction
	Comment       string
}

type UpdateCreditsResp struct {
}

type CreateLibraryReq struct {
	Name      string
	Latitude  float64
	Longitude float64
	Address   string
	Status    string
}

type CreateLibraryResp struct {
	Library model.Library
}

type GetLibrariesReq struct {
	UserId    string
	LibraryId uint32
}

type GetLibrariesResp struct {
	Libararies []model.Library
}

type AddAdminLibMappingReq struct {
	UserId    string
	LibraryId uint32
}

type AddAdminLibMappingResp struct {
}

type DeleteLibraryReq struct {
	Id uint32
}

type DeleteLibraryResp struct {
}
