package adminservice

import "github.com/ayushanand18/mpgpt-trust/backend/model"

type UpdateCreditsReq struct {
	MemberId      string
	CreditsAmount float64
	RefNumber     string // UTR Number for addition/bookingId for deduction
	Comment       string
	UserId        string
	UserType      string
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
	MemberId    string
	LibraryId   uint32
	LibraryName string
}

type GetLibrariesResp struct {
	Libararies []model.Library
}

type AddAdminLibMappingReq struct {
	MemberId  string
	LibraryId uint32
}

type AddAdminLibMappingResp struct {
}

type DeleteLibraryReq struct {
	Id uint32
}

type DeleteLibraryResp struct {
}
