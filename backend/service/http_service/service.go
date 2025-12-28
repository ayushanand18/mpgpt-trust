package httpservice

import (
	"context"
	"log"

	crazyhttp "github.com/ayushanand18/crazyhttp/pkg/server"
)

func RegisterServer(ctx context.Context) (err error) {
	server := crazyhttp.NewHttpServer(ctx)
	if err := server.Initialize(ctx); err != nil {
		log.Fatalf("Server failed to Initialize: %v", err)
	}

	server.GET("/health").Serve(func(ctx context.Context, request interface{}) (response interface{}, err error) {
		return "Hello World.", nil
	})

	// UserService
	server.GET("/user/{id}")   // get userinfo <- admin/superuser/user auth
	server.POST("/user")       // will create user <- behind superuser auth
	server.PATCH("/user/{id}") // will update some part of user <- admin/superuser/user auth
	server.GET("/users")       // fetch user information from some params <- admin/superuser auth

	// BookingService
	server.POST("/user/{id}/bookings")   // add a new booking for a user <- admin/superuser/user auth
	server.GET("/library/{id}/bookings") // view bookings on a library

	// AdminService
	server.POST("/user/{id}/credits") // add credits to user <- admin/superuser auth

	server.POST("/library")     // add a new library <- superuser auth
	server.GET("/library/{id}") // get library specific info <- public
	server.GET("/library")      // get all libraries info <- public

	server.POST("/user/{id}/library") // add admin - library mapping <- superuser auth

	if err := server.ListenAndServe(ctx); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
	return nil
}
