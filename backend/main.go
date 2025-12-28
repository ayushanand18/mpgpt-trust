package main

import (
	"context"
	"log"

	"github.com/ayushanand18/mpgpt-trust/backend/environment"
	httpservice "github.com/ayushanand18/mpgpt-trust/backend/service/http_service"
)

func main() {
	ctx := context.Background()
	// perform initial steps
	// setup db connection
	err := environment.InitDB()
	if err != nil {
		log.Printf("[Error] [Main] [Database] Error while initialising database connection, err: %v", err)
		return
	}

	// start http server
	if err := httpservice.RegisterServer(ctx); err != nil {
		log.Printf("[Error] [RegisterServer] Error while registering http server, err: %v", err)
		return
	}
}
