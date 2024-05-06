export const validation = {
  rules: {
    required: (v: any) => !!v || 'This field is required',
    email: (v: string) => !v || /.+@.+\..+/.test(v) || 'Email must be valid',
    phoneNumber: (v: string) =>
      !v || /^\+?(\d.*){3,}$/.test(v) || 'Phone number must be valid',
  },
};
