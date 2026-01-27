export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (value, minLength = 8) => {
	if (!value) return false;
	return value.length >= minLength;
}

export const addThousandSeparators = (number) => {
  if (number == null || isNaN(number)) return "";

  const parts = number.toString().split(".");
  const integerPart = parts[0];
  const fractionalPart = parts[1];

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  return fractionalPart ? `${formattedInteger}.${fractionalPart}` : formattedInteger;
};
