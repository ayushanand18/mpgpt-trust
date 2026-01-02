package adminservice

import (
	"context"
	"fmt"

	"github.com/ayushanand18/mpgpt-trust/backend/constants"
	"github.com/ayushanand18/mpgpt-trust/backend/environment"
	"github.com/ayushanand18/mpgpt-trust/backend/model"
	"github.com/ayushanand18/mpgpt-trust/backend/utils"
)

type service struct {
}

func NewAdminService(ctx context.Context) *service {
	return &service{}
}

// UpdateCredits
// 1. increment credits value in credits table for the entity
func (s *service) UpdateCredits(ctx context.Context, req UpdateCreditsReq) (resp UpdateCreditsResp, err error) {
	tx := environment.GetDbConn(ctx).Begin()
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	err = model.UpdateCredits(tx, model.UpdateCreditsReq{
		EntityId:    req.MemberId,
		EntityType:  constants.UserTypeMember,
		ValueChange: req.CreditsAmount,
		UserId:      req.UserId,
		UserType:    req.UserType,
	})

	// create credits history
	err = model.CreateCreditsHistory(tx, model.CreditsHistory{
		EntityId:   req.MemberId,
		EntityType: constants.UserTypeMember,
		Value:      req.CreditsAmount,
		Comments:   fmt.Sprintf("Credits Added, Reason: %s", req.Comment),
		Reason:     "Credits addition",
		CreatedAt:  utils.GetCurrentTimeInIst(),
	})
	if err != nil {
		return resp, err
	}

	return resp, err
}

// CreateLibrary
// 1. create a library entry in library table
func (s *service) CreateLibrary(ctx context.Context, req CreateLibraryReq) (resp CreateLibraryResp, err error) {
	tx := environment.GetDbConn(ctx).Begin()
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	// check for existing library with the same name
	existingLibs, err := model.GetLibraries(tx, model.GetLibrariesReq{
		LibraryName: req.Name,
	})
	if err != nil {
		return resp, err
	}
	if len(existingLibs) > 0 {
		// handle the case where a library with the same name already exists
		return resp, fmt.Errorf("Library with name %s already exists", req.Name)
	}

	resp.Library, err = model.CreateLibrary(tx, model.CreateLibraryReq{
		Name:      req.Name,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
		Address:   req.Address,
		Status:    req.Status,
	})

	return resp, err
}

// DeleteLibrary
// 1. delete a library entry in library table
func (s *service) DeleteLibrary(ctx context.Context, req DeleteLibraryReq) (resp DeleteLibraryResp, err error) {
	tx := environment.GetDbConn(ctx).Begin()
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	err = model.DeleteLibrary(tx, model.DeleteLibraryReq{
		Id: req.Id,
	})

	return resp, err
}

// GetLibraries
// 1. fetch libraries from library table
func (s *service) GetLibraries(ctx context.Context, req GetLibrariesReq) (resp GetLibrariesResp, err error) {
	libraryIds := []uint32{}
	if req.LibraryId != 0 {
		libraryIds = append(libraryIds, req.LibraryId)
	} else if req.MemberId != "" {
		// fetch library ids for which the user is an admin
		mappings, err := model.GetAdminLibraryMappings(environment.GetDbConn(ctx), model.GetAdminLibraryMappingsReq{
			MemberId: req.MemberId,
		})
		if err != nil {
			return resp, err
		}

		libraryIds := []uint32{}
		for _, mapping := range mappings {
			libraryIds = append(libraryIds, mapping.LibraryId)
		}
	}
	resp.Libraries, err = model.GetLibraries(environment.GetDbConn(ctx), model.GetLibrariesReq{
		LibraryName: req.LibraryName,
		LibraryIds:  libraryIds,
	})
	if err != nil {
		return resp, err
	}

	if req.FetchAdminMappings {
		libIds := []uint32{}
		for _, lib := range resp.Libraries {
			libIds = append(libIds, lib.Id)
		}

		adminMappings, err := model.GetAdminLibraryMappings(environment.GetDbConn(ctx), model.GetAdminLibraryMappingsReq{
			LibraryIds: libIds,
		})
		if err != nil {
			return resp, err
		}

		adminMappingsMap := make(map[uint32][]string)
		memIds := []string{}
		for _, mapping := range adminMappings {
			adminMappingsMap[mapping.LibraryId] = append(adminMappingsMap[mapping.LibraryId], mapping.MemberId)
			// get all admin memids, pull them at once and display
			memIds = append(memIds, mapping.MemberId)
		}

		users, err := model.GetUsers(environment.GetDbConn(ctx), model.GetUsersReq{
			MemberIds: memIds,
		})
		if err != nil {
			return resp, err
		}

		userMap := make(map[string]model.User)
		for _, user := range users {
			userMap[user.MemberId] = user
		}

		// attach admin user ids to libraries
		for i, lib := range resp.Libraries {
			if adminUserIds, ok := adminMappingsMap[lib.Id]; ok {
				for _, memId := range adminUserIds {
					if user, exists := userMap[memId]; exists {
						resp.Libraries[i].Admins = append(resp.Libraries[i].Admins, user)
					}
				}
			}
		}
	}

	return resp, nil
}

// AddAdminLibMapping
// 1. add mapping between admin user and library
func (s *service) AddAdminLibMapping(ctx context.Context, req AddAdminLibMappingReq) (resp AddAdminLibMappingResp, err error) {
	err = model.AddAdminLibMapping(environment.GetDbConn(ctx), model.AddAdminLibMappingReq{
		MemberId:  req.MemberId,
		LibraryId: req.LibraryId,
	})
	return resp, err
}
