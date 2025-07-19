export function validateLogin(email, password) {
  const errors = {};
  if (!email) {
    errors.email = 'Email wajib diisi';
  } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email)) {
    errors.email = 'Format email tidak valid';
  }
  if (!password) {
    errors.password = 'Password wajib diisi';
  } else if (password.length < 6) {
    errors.password = 'Password minimal 6 karakter';
  }
  return errors;
}
