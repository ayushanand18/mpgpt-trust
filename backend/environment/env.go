package environment

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var _dbConn *gorm.DB

// DSN string is of the form
//
// "host=localhost user=app_user password=secret123 dbname=mydb port=5432 sslmode=disable TimeZone=Asia/Kolkata"
func getDSNString() string {
	host := os.Getenv("SUPABASE_DB_HOST")
	port := os.Getenv("SUPABASE_DB_PORT")
	user := os.Getenv("SUPABASE_DB_USER")
	password := os.Getenv("SUPABASE_DB_PASSWORD")
	dbname := os.Getenv("SUPABASE_DB_NAME")
	sslmode := os.Getenv("SUPABASE_DB_SSLMODE")
	if len(sslmode) == 0 {
		sslmode = "enable"
	}

	timezone := os.Getenv("SUPABASE_DB_TIMEZONE")
	if len(timezone) == 0 {
		timezone = "Asia/Kolkata"
	}

	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s", host, user, password, dbname, port, sslmode, timezone)
}

func InitDB() error {
	writeDSN := getDSNString()

	if writeDSN == "" {
		return errors.New("database DSNs not set")
	}

	var err error

	_dbConn, err = newDBConnection(writeDSN)
	if err != nil {
		return err
	}

	return nil
}

func newDBConnection(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return db, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return db, err
	}

	// Pool configuration
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	return db, nil
}

func GetDbConn(ctx context.Context) *gorm.DB {
	return _dbConn
}
