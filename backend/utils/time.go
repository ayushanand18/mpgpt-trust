package utils

import "time"

func GetCurrentDateStartTime() time.Time {
	// fetch time in IST, get the start of day
	loc, _ := time.LoadLocation("Asia/Kolkata")
	now := time.Now().In(loc)
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc)
	return startOfDay
}

func GetFutureTime() time.Time {
	// fetch time in IST, get time after 1 year
	loc, _ := time.LoadLocation("Asia/Kolkata")
	now := time.Now().In(loc)
	futureTime := now.AddDate(1, 0, 0)
	return futureTime
}

func GetPastTime() time.Time {
	// fetch time in IST, get time before 1 year
	loc, _ := time.LoadLocation("Asia/Kolkata")
	now := time.Now().In(loc)
	pastTime := now.AddDate(-1, 0, 0)
	return pastTime
}

func GetCurrentTimeInIst() time.Time {
	loc, _ := time.LoadLocation("Asia/Kolkata")
	return time.Now().In(loc)
}
