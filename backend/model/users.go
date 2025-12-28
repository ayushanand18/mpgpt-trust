package model

type User struct {
	Id       string `gorm:"id,primaryKey"`
	Name     string `gorm:"name"`
	UserName string `gorm:"username"`
	Role     string `gorm:"role"`
	MemberId string `gorm:"member_id"`
}

func (b User) TableName() string {
	return "users"
}
