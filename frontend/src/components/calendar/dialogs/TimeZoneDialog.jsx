import ImportExportIcon from '@mui/icons-material/ImportExport';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { googleFieldSx } from '../styles/fieldSx';

export function TimeZoneDialog({
  cal,
  theme,
  isDark,
  open,
  onClose,
  tzDraftSeparate,
  setTzDraftSeparate,
  tzDraftStart,
  setTzDraftStart,
  tzDraftEnd,
  setTzDraftEnd,
  timeZoneAutocompleteOptions,
  onConfirm,
  applyCurrent,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.15rem', pb: 1 }}>Event time zone</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={
            <Checkbox
              checked={tzDraftSeparate}
              size="small"
              onChange={(e) => {
                const c = e.target.checked;
                setTzDraftSeparate(c);
                if (!c) setTzDraftEnd(tzDraftStart);
              }}
              sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }}
            />
          }
          label={<Typography variant="body2">Use separate start and end time zones</Typography>}
          sx={{ color: cal.text, mb: 1.5, alignItems: 'center' }}
        />
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Autocomplete
              size="small"
              options={timeZoneAutocompleteOptions}
              getOptionLabel={(o) => o.label}
              isOptionEqualToValue={(a, b) => !!a && !!b && a.value === b.value}
              value={timeZoneAutocompleteOptions.find((o) => o.value === tzDraftStart) ?? null}
              onChange={(_, v) => {
                if (!v) return;
                setTzDraftStart(v.value);
                if (!tzDraftSeparate) setTzDraftEnd(v.value);
              }}
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Event start time zone"
                  InputLabelProps={params.InputLabelProps}
                  sx={googleFieldSx(cal.text, cal.border, theme)}
                />
              )}
              slotProps={{
                paper: {
                  sx: {
                    bgcolor: cal.surfaceElevated,
                    color: cal.text,
                    border: `1px solid ${cal.border}`,
                  },
                },
              }}
            />
            <Autocomplete
              size="small"
              disabled={!tzDraftSeparate}
              options={timeZoneAutocompleteOptions}
              getOptionLabel={(o) => o.label}
              isOptionEqualToValue={(a, b) => !!a && !!b && a.value === b.value}
              value={
                timeZoneAutocompleteOptions.find((o) => o.value === (tzDraftSeparate ? tzDraftEnd : tzDraftStart)) ??
                null
              }
              onChange={(_, v) => v && setTzDraftEnd(v.value)}
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Event end time zone"
                  InputLabelProps={params.InputLabelProps}
                  sx={{
                    ...googleFieldSx(cal.text, cal.border, theme),
                    ...(!tzDraftSeparate && { opacity: 0.55 }),
                  }}
                />
              )}
              slotProps={{
                paper: {
                  sx: {
                    bgcolor: cal.surfaceElevated,
                    color: cal.text,
                    border: `1px solid ${cal.border}`,
                  },
                },
              }}
            />
          </Stack>
          <IconButton
            size="small"
            disabled={!tzDraftSeparate}
            onClick={() => {
              const a = tzDraftStart;
              setTzDraftStart(tzDraftEnd);
              setTzDraftEnd(a);
            }}
            sx={{ color: cal.muted, mt: 3, flexShrink: 0 }}
            aria-label="Swap time zones"
          >
            <ImportExportIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2, pt: 0, flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Button onClick={applyCurrent} sx={{ color: cal.linkColor, textTransform: 'none', fontWeight: 700 }}>
          Use current time zone
        </Button>
        <Box sx={{ flex: 1, minWidth: 8 }} />
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
