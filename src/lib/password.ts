export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRule = {
  label: string;
  test: (value: string) => boolean;
};

export const passwordRules: PasswordRule[] = [
  {
    label: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    label: "Ao menos uma letra",
    test: (value) => /[A-Za-z]/.test(value),
  },
  {
    label: "Ao menos um número",
    test: (value) => /[0-9]/.test(value),
  },
];
