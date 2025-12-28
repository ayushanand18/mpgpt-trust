package model

type AdminLibraryMapping struct {
	Id        uint32 `gorm:"id,primaryKey"`
	LibraryId uint32 `gorm:"library_id"`
	MemberId  string `gorm:"member_id"`
}

func (b AdminLibraryMapping) TableName() string {
	return "admin_library_mapping"
}
