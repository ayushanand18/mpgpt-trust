package httpservice

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	httpconstants "github.com/ayushanand18/crazyhttp/pkg/constants"
	crazyhttp "github.com/ayushanand18/crazyhttp/pkg/server"
	httptypes "github.com/ayushanand18/crazyhttp/pkg/types"
	adminservice "github.com/ayushanand18/mpgpt-trust/backend/service/admin_service"
	bookingservice "github.com/ayushanand18/mpgpt-trust/backend/service/booking_service"
	userservice "github.com/ayushanand18/mpgpt-trust/backend/service/user_service"
)

func RegisterServer(ctx context.Context) (err error) {
	server := crazyhttp.NewHttpServer(ctx)
	if err := server.Initialize(ctx); err != nil {
		log.Fatalf("Server failed to Initialize: %v", err)
	}

	server.GET("/health").Serve(func(ctx context.Context, request interface{}) (response interface{}, err error) {
		return "Hello World.", nil
	})

	adminService := adminservice.NewAdminService(ctx)
	userService := userservice.NewUserService(ctx)
	bookingService := bookingservice.NewBookingService(ctx)

	var routes []string

	// UserService
	// get userinfo <- admin/superuser/user auth
	server.GET("/user/{id}").Serve(func(ctx context.Context, req interface{}) (interface{}, error) {
		request := req.(userservice.GetUserReq)
		return userService.GetUser(ctx, request)
	}).WithDecoder(func(ctx context.Context, r *http.Request) (request interface{}, err error) {
		populateUserIdAndRoleFromHttpRequest(ctx, r)

		pathValues := ctx.Value(httpconstants.HttpRequestPathValues).(map[string]string)
		id := pathValues["id"]
		request = userservice.GetUserReq{
			Id: id,
		}
		return request, nil
	}).WithEncoder(GenericEncoder()).
		WithErrorEncoder(ErrorEncoder()).
		WithBeforeServe(AuthMiddleware())

	routes = append(routes, "/user/{id}")

	// will create user <- behind superuser/user auth
	server.POST("/user").Serve(func(ctx context.Context, i interface{}) (interface{}, error) {
		request := i.(userservice.CreateUserReq)
		return userService.CreateUser(ctx, request)
	}).WithDecoder(func(ctx context.Context, r *http.Request) (request interface{}, err error) {
		populateUserIdAndRoleFromHttpRequest(ctx, r)

		var req userservice.CreateUserReq
		err = json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			return nil, err
		}
		return req, nil
	}).WithEncoder(GenericEncoder()).
		WithErrorEncoder(ErrorEncoder()).
		WithBeforeServe(AuthMiddleware())

	routes = append(routes, "/user")

	// will update some part of user <- admin/superuser/user auth
	server.PATCH("/user/{id}").Serve(func(ctx context.Context, i interface{}) (interface{}, error) {
		request := i.(userservice.UpdateUserReq)
		return userService.UpdateUser(ctx, request)
	}).WithDecoder(func(ctx context.Context, r *http.Request) (request interface{}, err error) {
		populateUserIdAndRoleFromHttpRequest(ctx, r)

		paramsMap := ctx.Value(httpconstants.HttpRequestPathValues).(map[string]string)
		var req userservice.UpdateUserReq
		err = json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			return nil, err
		}
		req.Id = paramsMap["id"]
		return req, nil
	}).WithEncoder(GenericEncoder()).
		WithErrorEncoder(ErrorEncoder()).
		WithBeforeServe(AuthMiddleware())

	// fetch user information from some params <- admin/superuser auth
	server.POST("/users").Serve(func(ctx context.Context, i interface{}) (interface{}, error) {
		request := i.(userservice.GetUsersReq)
		return userService.GetUsers(ctx, request)
	}).WithDecoder(func(ctx context.Context, r *http.Request) (request interface{}, err error) {
		populateUserIdAndRoleFromHttpRequest(ctx, r)

		var req userservice.GetUsersReq
		err = json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			return nil, err
		}
		return req, nil
	}).WithEncoder(GenericEncoder()).
		WithErrorEncoder(ErrorEncoder()).
		WithBeforeServe(AuthMiddleware())

	routes = append(routes, "/users")

	// BookingService
	// add a new booking for a user <- admin/superuser/user auth
	server.POST("/booking").Serve(func(ctx context.Context, i interface{}) (interface{}, error) {
		request := i.(bookingservice.CreateBookingReq)
		return bookingService.CreateBooking(ctx, request)
	}).WithDecoder(func(ctx context.Context, r *http.Request) (request interface{}, err error) {
		populateUserIdAndRoleFromHttpRequest(ctx, r)

		var req bookingservice.CreateBookingReq
		err = json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			return nil, err
		}
		return req, nil
	}).WithEncoder(GenericEncoder()).
		WithErrorEncoder(ErrorEncoder()).
		WithBeforeServe(AuthMiddleware())

	routes = append(routes, "/booking")

	// view bookings on a library
	server.POST("/bookings").Serve(func(ctx context.Context, i interface{}) (interface{}, error) {
		request := i.(bookingservice.GetBookingsReq)
		return bookingService.GetBookings(ctx, request)
	}).WithDecoder(func(ctx context.Context, r *http.Request) (request interface{}, err error) {
		var req bookingservice.GetBookingsReq
		err = json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			return nil, err
		}
		return req, nil
	}).WithEncoder(GenericEncoder()).
		WithErrorEncoder(ErrorEncoder()).
		WithBeforeServe(AuthMiddleware())

	routes = append(routes, "/bookings")

	// AdminService
	// add credits to user <- admin/superuser auth
	server.POST("/user/{id}/credits").Serve(func(ctx context.Context, i interface{}) (interface{}, error) {
		request := i.(adminservice.UpdateCreditsReq)
		return adminService.UpdateCredits(ctx, request)
	}).WithDecoder(func(ctx context.Context, r *http.Request) (request interface{}, err error) {
		populateUserIdAndRoleFromHttpRequest(ctx, r)

		var req userservice.CreateUserReq
		err = json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			return nil, err
		}
		paramMap := ctx.Value(httpconstants.HttpRequestPathValues).(map[string]string)
		req.Id = paramMap["id"]
		return req, nil
	}).WithEncoder(GenericEncoder()).
		WithErrorEncoder(ErrorEncoder()).
		WithBeforeServe(AuthMiddleware())

	routes = append(routes, "/user/{id}/credits")

	// add a new library <- superuser auth
	server.POST("/library").Serve(func(ctx context.Context, i interface{}) (interface{}, error) {
		request := i.(adminservice.CreateLibraryReq)
		return adminService.CreateLibrary(ctx, request)
	}).WithDecoder(func(ctx context.Context, r *http.Request) (request interface{}, err error) {
		populateUserIdAndRoleFromHttpRequest(ctx, r)

		var req adminservice.CreateLibraryReq
		err = json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			return nil, err
		}
		return req, nil
	}).WithEncoder(GenericEncoder()).
		WithErrorEncoder(ErrorEncoder()).
		WithBeforeServe(AuthMiddleware())

	routes = append(routes, "/library")

	// get all libraries info <- public
	server.POST("/libraries").Serve(func(ctx context.Context, i interface{}) (interface{}, error) {
		request := i.(adminservice.GetLibrariesReq)
		return adminService.GetLibraries(ctx, request)
	}).WithDecoder(func(ctx context.Context, r *http.Request) (request interface{}, err error) {
		populateUserIdAndRoleFromHttpRequest(ctx, r)

		var req adminservice.GetLibrariesReq
		err = json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			return nil, err
		}
		return req, nil
	}).WithEncoder(GenericEncoder()).
		WithErrorEncoder(ErrorEncoder())

	routes = append(routes, "/libraries")

	// delete a library <- superuser auth
	server.DELETE("/library").Serve(func(ctx context.Context, i interface{}) (interface{}, error) {
		request := i.(adminservice.DeleteLibraryReq)
		return adminService.DeleteLibrary(ctx, request)
	}).WithDecoder(func(ctx context.Context, r *http.Request) (request interface{}, err error) {
		populateUserIdAndRoleFromHttpRequest(ctx, r)

		var req adminservice.DeleteLibraryReq
		err = json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			return nil, err
		}
		return req, nil
	}).WithEncoder(GenericEncoder()).
		WithErrorEncoder(ErrorEncoder()).
		WithBeforeServe(AuthMiddleware())

	routes = append(routes, "/library")

	// add admin - library mapping <- superuser auth
	server.POST("/user/{id}/library").Serve(func(ctx context.Context, i interface{}) (interface{}, error) {
		request := i.(adminservice.AddAdminLibMappingReq)
		return adminService.AddAdminLibMapping(ctx, request)
	}).WithDecoder(func(ctx context.Context, r *http.Request) (request interface{}, err error) {
		populateUserIdAndRoleFromHttpRequest(ctx, r)

		var req userservice.CreateUserReq
		err = json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			return nil, err
		}
		paramMap := ctx.Value(httpconstants.HttpRequestPathValues).(map[string]string)
		req.Id = paramMap["id"]
		return req, nil
	}).WithEncoder(GenericEncoder()).
		WithErrorEncoder(ErrorEncoder()).
		WithBeforeServe(AuthMiddleware())

	routes = append(routes, "/user/{id}/library")

	for _, route := range routes {
		server.OPTIONS(route).Serve(func(ctx context.Context, i interface{}) (resp interface{}, err error) {
			return resp, err
		})
	}

	if err := server.ListenAndServe(ctx); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
	return nil
}

func GenericEncoder() httptypes.HttpEncoder {
	return func(ctx context.Context, response interface{}, reqErr error) (headers map[string][]string, body []byte, err error) {
		respBody := GenericResponse{
			Error: Error{
				Message: "",
			},
			Data: response,
		}
		body, err = json.Marshal(respBody)
		return headers, body, err
	}
}

func ErrorEncoder() httptypes.HttpEncoder {
	return func(ctx context.Context, response interface{}, reqErr error) (headers map[string][]string, body []byte, err error) {
		respBody := GenericResponse{
			Error: Error{
				Message: fmt.Sprintf("%v", reqErr),
			},
			Data: nil,
		}
		body, err = json.Marshal(respBody)
		return headers, body, err
	}
}
