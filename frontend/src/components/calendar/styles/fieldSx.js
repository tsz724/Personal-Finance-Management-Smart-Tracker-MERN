import { alpha } from '@mui/material/styles';

export function googleFieldSx(text, border, theme) {
  return {
    '& .MuiInputBase-input': { color: text },
    '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: border },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.18) : theme.palette.text.secondary,
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
  };
}
