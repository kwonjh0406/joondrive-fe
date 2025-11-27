export const PASSWORD_MESSAGES = {
    INVALID_PASSWORD:
        "비밀번호는 8자 이상이며, 숫자, 영문, 특수문자를 각각 최소 1개 이상 포함해야 합니다.",
} as const;

export const validatePassword = (password: string) => {
    if (password.length < 8) return false;
    return (
        /\d/.test(password) &&
        /[a-zA-Z]/.test(password) &&
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    );
};
