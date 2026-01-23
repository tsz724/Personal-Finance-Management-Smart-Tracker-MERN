export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (value, minLength = 8) => {
	if (!value) return false;
	return value.length >= minLength;
}