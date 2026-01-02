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
	"gorm.io/gorm"
)

func populateUserIdAndRoleFromHttpRequest(
	ctx context.Context,
	r *http.Request,
) (context.Context, error) {
	authStr := r.Header.Get("Authorization")
	if authStr == "" || !strings.HasPrefix(authStr, "Bearer ") {
		return ctx, errors.New("Authorization header not found")
	}

	token := strings.TrimPrefix(authStr, "Bearer ")

	userID, err := extractUserIDFromJWT(token)
	if err != nil {
		return ctx, errors.New("Authorization header not found")
	}

	ctx = context.WithValue(ctx, utils.ContextKeyUserId, userID)

	user, err := model.GetUserById(environment.GetDbConn(ctx), userID)
	if err != nil && err == gorm.ErrRecordNotFound {
		return ctx, nil
	} else if err != nil {
		return ctx, err
	}

	ctx = context.WithValue(ctx, utils.ContextKeyUserRole, user.Role)
	ctx = context.WithValue(ctx, utils.ContextKeyMemberId, user.MemberId)

	return ctx, nil
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
