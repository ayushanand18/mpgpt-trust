package model

import (
	"gorm.io/gorm"
)

type AdminLibraryMapping struct {
	Id        uint32 `gorm:"column:id;primaryKey"`
	LibraryId uint32 `gorm:"column:library_id"`
	MemberId  string `gorm:"column:member_id"`
}

func (b AdminLibraryMapping) TableName() string {
	return "lms.admin_library_mapping"
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
	MemberId   string
	LibraryIds []uint32
}

func GetAdminLibraryMappings(tx *gorm.DB, req GetAdminLibraryMappingsReq) ([]AdminLibraryMapping, error) {
	var mappings []AdminLibraryMapping
	query := tx.Table(AdminLibraryMapping{}.TableName())
	if req.MemberId != "" {
		query = query.Where("member_id = ?", req.MemberId)
	}

	if len(req.LibraryIds) > 0 {
		query = query.Where("library_id IN ?", req.LibraryIds)
	}

	if err := query.Find(&mappings).Error; err != nil {
		return nil, err
	}

	return mappings, nil
}
