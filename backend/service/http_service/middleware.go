package httpservice

import (
	"context"
	"errors"
	"net/http"
	"strings"

	httptypes "github.com/ayushanand18/crazyhttp/pkg/types"
	"github.com/ayushanand18/mpgpt-trust/backend/environment"
	"github.com/ayushanand18/mpgpt-trust/backend/model"
	"github.com/ayushanand18/mpgpt-trust/backend/utils"
	"github.com/golang-jwt/jwt"
)

func populateUserIdAndRoleFromHttpRequest(
	ctx context.Context,
	r *http.Request,
) context.Context {

	authStr := r.Header.Get("Authorization")
	if authStr == "" || !strings.HasPrefix(authStr, "Bearer ") {
		return ctx
	}

	token := strings.TrimPrefix(authStr, "Bearer ")

	userID, err := extractUserIDFromJWT(token)
	if err != nil {
		return ctx
	}

	user, err := model.GetUserById(environment.GetDbConn(ctx), userID)
	if err != nil {
		return ctx
	}

	ctx = context.WithValue(ctx, utils.ContextKeyUserId, user.Id)
	ctx = context.WithValue(ctx, utils.ContextKeyUserRole, user.Role)

	return ctx
}

func extractUserIDFromJWT(tokenStr string) (string, error) {
	token, _, err := new(jwt.Parser).ParseUnverified(tokenStr, jwt.MapClaims{})
	if err != nil {
		return "", err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid jwt claims")
	}

	sub, ok := claims["sub"].(string)
	if !ok || sub == "" {
		return "", errors.New("sub not found in token")
	}

	return sub, nil
}

func AuthMiddleware() httptypes.HttpRequestMiddleware {
	return func(ctx context.Context, req interface{}) (context.Context, interface{}, error) {
		// perform auth checks here
		// e.g., validate tokens, check user roles, etc.
		return ctx, req, nil
	}
}
