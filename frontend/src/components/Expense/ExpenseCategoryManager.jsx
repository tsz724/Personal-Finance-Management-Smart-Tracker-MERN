import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import EmojiPickerPopup from "../EmojiPickerPopup";
import Modal from "../Modal";
import Deletealert from "../Deletealert";
import toast from "react-hot-toast";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const ExpenseCategoryManager = ({ categories, onUpdated }) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName("");
    setIcon("");
    setEditingId(null);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Category name is required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await axiosInstance.put(API_PATHS.MODULES.FINANCE.EXPENSE_CATEGORIES.UPDATE(editingId), {
          name: trimmed,
          icon: icon || undefined,
        });
        toast.success("Category updated");
      } else {
        await axiosInstance.post(API_PATHS.MODULES.FINANCE.EXPENSE_CATEGORIES.CREATE, {
          name: trimmed,
          icon: icon || undefined,
        });
        toast.success("Category created");
      }
      resetForm();
      await onUpdated?.();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Request failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setIcon(cat.icon || "");
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.MODULES.FINANCE.EXPENSE_CATEGORIES.DELETE(id));
      toast.success("Category deleted");
      setDeleteId(null);
      await onUpdated?.();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Request failed";
      toast.error(msg);
    }
  };

  return (
    <Box sx={{ px: 1, py: 1, pb: 3 }}>
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {editingId ? "Edit category" : "Add a category"}
        </Typography>
        <EmojiPickerPopup icon={icon} onSelect={setIcon} />
        <TextField
          label="Name"
          placeholder="Groceries, rent, transport…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          fullWidth
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          {editingId && (
            <Button variant="outlined" onClick={resetForm}>
              Cancel edit
            </Button>
          )}
          <Button variant="contained" color="primary" disabled={saving} onClick={handleSubmit}>
            {editingId ? "Save changes" : "Add category"}
          </Button>
        </Stack>
      </Paper>

      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Your categories
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: 2, maxHeight: 280, overflow: "auto" }}>
        <List dense disablePadding>
          {categories?.length === 0 && (
            <ListItem>
              <ListItemText primary="No categories yet." secondary="Create one above." />
            </ListItem>
          )}
          {categories?.map((cat, i) => (
            <React.Fragment key={cat._id}>
              {i > 0 && <Divider component="li" />}
              <ListItem
                secondaryAction={
                  <Stack direction="row">
                    <IconButton edge="end" aria-label="edit" onClick={() => startEdit(cat)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => setDeleteId(cat._id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemAvatar sx={{ minWidth: 48 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "action.hover",
                    }}
                  >
                    {cat.icon ? (
                      <Box component="img" src={cat.icon} alt="" sx={{ width: 28, height: 28 }} />
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </Paper>
                </ListItemAvatar>
                <ListItemText primary={cat.name} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete category">
        <Deletealert
          content="Delete this category? You can only delete categories that are not used by any expense entry."
          onDelete={() => handleDelete(deleteId)}
        />
      </Modal>
    </Box>
  );
};

export default ExpenseCategoryManager;
