package environment

import (
	"context"
	"errors"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var _dbConn *gorm.DB

func InitDB() error {
	writeDSN := os.Getenv("SUPABASE_DB_WRITE_DSN")

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
