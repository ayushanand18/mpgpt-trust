package model

import "gorm.io/gorm"

type Library struct {
	Id        uint32  `gorm:"id,primaryKey"`
	Name      string  `gorm:"name"`
	Latitude  float64 `gorm:"latitude"`
	Longitude float64 `gorm:"longitude"`
	Address   string  `gorm:"address"`
	Remarks   float64 `gorm:"remarks"`
	Status    string  `gorm:"status"` // status: active, closed
}

func (b Library) TableName() string {
	return "libraries"
}

type CreateLibraryReq struct {
	Name      string
	Latitude  float64
	Longitude float64
	Address   string
	Status    string
}

func CreateLibrary(tx *gorm.DB, req CreateLibraryReq) (Library, error) {
	library := Library{
		Name:      req.Name,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
		Address:   req.Address,
		Status:    req.Status,
	}

	queryResp := tx.Table(Library{}.TableName()).Create(&library)
	if queryResp.Error != nil {
		return library, queryResp.Error
	}

	return library, nil
}

type GetLibrariesReq struct {
	LibraryName string
	LibraryIds  []uint32
}

func GetLibraries(tx *gorm.DB, req GetLibrariesReq) ([]Library, error) {
	var libraries []Library
	query := tx.Table(Library{}.TableName())

	if req.LibraryName != "" {
		query.Where("name = ?", req.LibraryName)

	}

	if err := query.Find(&libraries).Error; err != nil {
		return nil, err
	}

	return libraries, nil
}

type DeleteLibraryReq struct {
	Id uint32
}

func DeleteLibrary(tx *gorm.DB, req DeleteLibraryReq) error {
	queryResp := tx.Table(Library{}.TableName()).Where("id = ?", req.Id).Delete(&Library{})
	if queryResp.Error != nil {
		return queryResp.Error
	}

	return nil
}
