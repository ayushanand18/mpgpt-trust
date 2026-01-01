package httpservice

type GenericResponse struct {
	Error Error
	Data  interface{}
}

type Error struct {
	Message string
}
