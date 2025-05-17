const passwordPolicy =
  import.meta.env.TW_VITE_PASSWORD_VALIDATION_POLICY || 'none';

const getPasswordRule = () => {
  switch (passwordPolicy) {
    case 'very_strict':
      return (v: string) =>
        !v ||
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/.test(v) ||
        'Password must be at least 12 characters, include uppercase, lowercase, number, and special character';
    case 'strict':
      return (v: string) =>
        !v ||
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v) ||
        'Password must be at least 8 characters, include uppercase, lowercase, and number';
    case 'normal':
      return (v: string) =>
        !v ||
        /^.{6,}$/.test(v) ||
        'Password must be at least 6 characters long';
    case 'none':
    default:
      return () => true;
  }
};

const validationUtils = {
  rules: {
    required: (v: any) =>
      (v !== undefined && v !== null && v !== '') || 'This field is required',
    email: (v: string) => !v || /.+@.+\..+/.test(v) || 'Email must be valid',
    phoneNumber: (v: string) =>
      !v || /^\+?(\d.*){3,}$/.test(v) || 'Phone number must be valid',
    array: {
      required: (v: any[]) => (!!v && v.length > 0) || 'This field is required',
    },
    currency: (v: string) =>
      !v || /^\d+(\.\d{1,2})?$/.test(v) || 'Invalid currency format',
    url: (v: string) =>
      !v ||
      /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/i.test(v) ||
      'Invalid URL format',
    password: getPasswordRule(),
  },
};

export default validationUtils;
