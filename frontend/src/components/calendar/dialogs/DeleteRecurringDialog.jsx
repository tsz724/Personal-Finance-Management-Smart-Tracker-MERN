import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';

export function DeleteRecurringDialog({
  cal,
  theme,
  isDark,
  open,
  onClose,
  scope,
  onScopeChange,
  onConfirm,
  title = 'Delete recurring event',
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: cal.surfaceElevated,
          color: cal.text,
          border: `1px solid ${cal.border}`,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.15rem', pb: 1 }}>{title}</DialogTitle>
      <DialogContent>
        <RadioGroup value={scope} onChange={(e) => onScopeChange(e.target.value)} sx={{ gap: 0.5 }}>
          <FormControlLabel
            value="this"
            control={
              <Radio
                size="small"
                sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }}
              />
            }
            label={<Typography variant="body2">This event</Typography>}
            sx={{ color: cal.text, alignItems: 'center', m: 0 }}
          />
          <FormControlLabel
            value="following"
            control={
              <Radio
                size="small"
                sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }}
              />
            }
            label={<Typography variant="body2">This and following events</Typography>}
            sx={{ color: cal.text, alignItems: 'center', m: 0 }}
          />
          <FormControlLabel
            value="all"
            control={
              <Radio
                size="small"
                sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }}
              />
            }
            label={<Typography variant="body2">All events</Typography>}
            sx={{ color: cal.text, alignItems: 'center', m: 0 }}
          />
        </RadioGroup>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: cal.muted, textTransform: 'none', fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            borderRadius: 999,
            px: 2.5,
            textTransform: 'none',
            fontWeight: 800,
            backgroundColor: cal.saveBtnBg,
            color: cal.saveBtnColor,
            boxShadow: 'none',
            '&:hover': { backgroundColor: cal.saveBtnHoverBg, boxShadow: 'none' },
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
