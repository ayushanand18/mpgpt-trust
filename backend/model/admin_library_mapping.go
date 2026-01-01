package model

import (
	"gorm.io/gorm"
)

type AdminLibraryMapping struct {
	Id        uint32 `gorm:"id,primaryKey"`
	LibraryId uint32 `gorm:"library_id"`
	MemberId  string `gorm:"member_id"`
}

func (b AdminLibraryMapping) TableName() string {
	return "admin_library_mapping"
}

type AddAdminLibMappingReq struct {
	MemberId  string
	LibraryId uint32
}

func AddAdminLibMapping(tx *gorm.DB, req AddAdminLibMappingReq) error {
	mapping := AdminLibraryMapping{
		LibraryId: req.LibraryId,
		MemberId:  req.MemberId,
	}

	queryResp := tx.Table(AdminLibraryMapping{}.TableName()).Create(&mapping)
	if queryResp.Error != nil {
		return queryResp.Error
	}

	return nil
}

type GetAdminLibraryMappingsReq struct {
	MemberId string
}

func GetAdminLibraryMappings(tx *gorm.DB, req GetAdminLibraryMappingsReq) ([]uint32, error) {
	var mappings []AdminLibraryMapping
	query := tx.Table(AdminLibraryMapping{}.TableName()).
		Where("member_id = ?", req.MemberId)

	if err := query.Find(&mappings).Error; err != nil {
		return nil, err
	}

	libraryIds := []uint32{}
	for _, mapping := range mappings {
		libraryIds = append(libraryIds, mapping.LibraryId)
	}

	return libraryIds, nil
}
