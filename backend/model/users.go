package model

import (
	"time"

	"github.com/ayushanand18/mpgpt-trust/backend/utils"
	"gorm.io/gorm"
)

type User struct {
	Id          string    `gorm:"id,primaryKey"`
	Name        string    `gorm:"name"`
	UserName    string    `gorm:"username"`
	Role        string    `gorm:"role"`
	MemberId    string    `gorm:"member_id"`
	Email       string    `gorm:"email"`
	PhoneNumber string    `gorm:"phone_number"`
	UpdatedAt   time.Time `gorm:"updated_at"`
	CreatedAt   time.Time `gorm:"created_at"`
}

func (b User) TableName() string {
	return "users"
}

func GetUserById(tx *gorm.DB, id string) (User, error) {
	var user User
	query := tx.Table(User{}.TableName()).Where("id = ?", id)

	if err := query.First(&user).Error; err != nil {
		return User{}, err
	}

	return user, nil
}

type GetUsersReq struct {
	UserIds      []string
	MemberIds    []string
	Emails       []string
	PhoneNumbers []string
	Limit        uint32
}

func GetUsers(tx *gorm.DB, req GetUsersReq) ([]User, error) {
	var users []User
	query := tx.Table(User{}.TableName())

	if len(req.UserIds) > 0 {
		query = query.Where("id IN (?)", req.UserIds)
	}

	if len(req.MemberIds) > 0 {
		query = query.Where("member_id IN (?)", req.MemberIds)
	}

	if len(req.Emails) > 0 {
		query = query.Where("email IN (?)", req.Emails)
	}

	if len(req.PhoneNumbers) > 0 {
		query = query.Where("phone_number IN (?)", req.PhoneNumbers)
	}

	if req.Limit > 0 {
		query = query.Limit(int(req.Limit))
	}

	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}

type UpdateUserReq struct {
	Id       string
	MemberId *string
}

func UpdateUser(tx *gorm.DB, req UpdateUserReq) error {
	updateMap := make(map[string]interface{})

	if req.MemberId != nil {
		updateMap["member_id"] = req.MemberId
	}

	updateMap["updated_at"] = utils.GetCurrentTimeInIst()

	queryResp := tx.Table(User{}.TableName()).Where("id = ?", req.Id).Updates(updateMap)
	if queryResp.Error != nil {
		return queryResp.Error
	}

	return nil
}

type CreateUserReq struct {
	Id          string
	Name        string
	UserName    string
	MemberId    string
	Email       string
	PhoneNumber string
	Role        string
}

func CreateUser(tx *gorm.DB, req CreateUserReq) (User, error) {
	user := User{
		Id:        req.Id,
		UpdatedAt: utils.GetCurrentTimeInIst(),
	}

	queryResp := tx.Table(User{}.TableName()).Create(&user)
	if queryResp.Error != nil {
		return User{}, queryResp.Error
	}

	return user, nil
}
