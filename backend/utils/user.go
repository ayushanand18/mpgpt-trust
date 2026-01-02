package utils

import "context"

const (
	// ContextKeyUserId is the context key used to store the authenticated user's ID.
	ContextKeyUserId = "auth_user_id"

	// ContextKeyUserRole is the context key used to store the authenticated user's role.
	ContextKeyUserRole = "auth_user_role"

	// ContextKeyMemberId is the context key used to store the authenticated user's memberId.
	ContextKeyMemberId = "auth_member_id"
)

func GetUserIdFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	userId, ok := ctx.Value(ContextKeyUserId).(string)
	if !ok {
		return ""
	}
	return userId
}

func GetUserRoleFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	userRole, ok := ctx.Value(ContextKeyUserRole).(string)
	if !ok {
		return ""
	}
	return userRole
}

func GetMemberIdFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	memberId, ok := ctx.Value(ContextKeyMemberId).(string)
	if !ok {
		return ""
	}
	return memberId
}
