import { z } from "zod";
import type { TFunction } from "i18next";

const USERNAME_MIN = 2;
const USERNAME_MAX = 30;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 64;
const EMAIL_MAX = 100;
const PASSWORD_UPPERCASE = /[A-Z]/;
const PASSWORD_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export function loginFormSchema(t: TFunction) {
  return z.object({
    emailOrUsername: z.string().trim().min(1, t("auth.loginMissingEmail")),
    password: z.string().min(1, t("auth.loginMissingPassword")),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof loginFormSchema>>;

export function registerFormSchema(t: TFunction) {
  return z
    .object({
      role: z.enum(["BUYER", "SELLER"]),
      username: z
        .string()
        .trim()
        .min(USERNAME_MIN, t("auth.errUsernameLength", { min: USERNAME_MIN, max: USERNAME_MAX }))
        .max(USERNAME_MAX, t("auth.errUsernameMax", { max: USERNAME_MAX }))
        .regex(USERNAME_PATTERN, t("auth.errUsernamePattern")),
      email: z
        .string()
        .trim()
        .min(1, t("auth.errEmailRequired"))
        .email(t("auth.errEmailInvalid"))
        .max(EMAIL_MAX, t("auth.errEmailMax", { max: EMAIL_MAX })),
      password: z
        .string()
        .min(PASSWORD_MIN, t("auth.errPasswordLength", { min: PASSWORD_MIN, max: PASSWORD_MAX }))
        .max(PASSWORD_MAX, t("auth.errPasswordMax", { max: PASSWORD_MAX })),
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      if (!PASSWORD_UPPERCASE.test(data.password)) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: t("auth.errPasswordUppercase"),
        });
      }
      if (!PASSWORD_SPECIAL.test(data.password)) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: t("auth.errPasswordSpecial"),
        });
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: t("auth.errPasswordsMatch"),
        });
      }
    });
}

export type RegisterFormValues = z.infer<ReturnType<typeof registerFormSchema>>;

export function forgotPasswordFormSchema(t: TFunction) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t("auth.errEmailRequired"))
      .email(t("auth.errEmailInvalid")),
  });
}

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof forgotPasswordFormSchema>
>;

export function resetPasswordFormSchema(t: TFunction) {
  return z
    .object({
      password: z
        .string()
        .min(PASSWORD_MIN, t("auth.errPasswordLength", { min: PASSWORD_MIN, max: PASSWORD_MAX }))
        .max(PASSWORD_MAX, t("auth.errPasswordMax", { max: PASSWORD_MAX })),
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      if (!PASSWORD_UPPERCASE.test(data.password)) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: t("auth.errPasswordUppercase"),
        });
      }
      if (!PASSWORD_SPECIAL.test(data.password)) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: t("auth.errPasswordSpecial"),
        });
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: t("auth.errPasswordsMatch"),
        });
      }
    });
}

export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof resetPasswordFormSchema>
>;
