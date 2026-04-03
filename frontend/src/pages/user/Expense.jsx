import React, { useState, useEffect } from "react";
import Homelayout from "../../components/layout/Homelayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import List from "../../components/Expense/List";
import Modal from "../../components/Modal";
import Deletealert from "../../components/Deletealert";
import AddExpenseform from "../../components/Expense/AddExpenseform";
import ExpenseCategoryManager from "../../components/Expense/ExpenseCategoryManager";
import toast from "react-hot-toast";
import Stack from "@mui/material/Stack";

const Expense = () => {
  useUserAuth();

  const [expenseData, setExpenseData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_PATHS.MODULES.FINANCE.EXPENSE.GET_ALL}`);
      if (response.data) {
        setExpenseData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseDetails = async () => {
    if (loading) return;
    await loadExpenses();
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.MODULES.FINANCE.EXPENSE_CATEGORIES.LIST);
      if (response.data) setCategories(response.data);
    } catch (error) {
      console.log("Failed to load expense categories.", error);
    }
  };

  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon } = expense;

    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount should be a valid number greater than 0.");
      return;
    }

    if (!date) {
      toast.error("Date is required.");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.MODULES.FINANCE.EXPENSE.ADD, {
        category,
        amount,
        date,
        icon,
      });

      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully");
      loadExpenses();
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      toast.error(msg);
      console.error("Error adding expense:", msg);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.MODULES.FINANCE.EXPENSE.DELETE(id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Expense details deleted successfully");
      loadExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error.response?.data?.message || error.message);
    }
  };

  const handleDownloadExpenseDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.MODULES.FINANCE.EXPENSE.DOWNLOAD_EXCEL, {
        responseType: "blob",
      });

      const disposition = response.headers["content-disposition"];
      let fileName = "expense_details.xlsx";

      if (disposition && disposition.includes("filename=")) {
        fileName = disposition.split("filename=")[1].replace(/"/g, "");
      }

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download expense details. Please try again.");
    }
  };

  useEffect(() => {
    fetchExpenseDetails();
    fetchCategories();
    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  return (
    <Homelayout activeMenu="Finance / Expense">
      <Stack spacing={3}>
        <ExpenseOverview
          transactions={expenseData}
          onAddExpense={() => setOpenAddExpenseModal(true)}
          onManageCategories={() => setOpenCategoryModal(true)}
        />
        <List
          transactions={expenseData}
          onDelete={(id) => {
            setOpenDeleteAlert({ show: true, data: id });
          }}
          onDownload={handleDownloadExpenseDetails}
        />

        <Modal isOpen={openAddExpenseModal} onClose={() => setOpenAddExpenseModal(false)} title="Add expense">
          <AddExpenseform categories={categories} onaddexpense={handleAddExpense} />
        </Modal>

        <Modal isOpen={openCategoryModal} onClose={() => setOpenCategoryModal(false)} title="Expense categories">
          <ExpenseCategoryManager
            categories={categories}
            onUpdated={async () => {
              await fetchCategories();
              await loadExpenses();
            }}
          />
        </Modal>

        <Modal isOpen={openDeleteAlert.show} onClose={() => setOpenDeleteAlert({ show: false, data: null })} title="Delete expense">
          <Deletealert content="Are you sure you want to delete this expense?" onDelete={() => deleteExpense(openDeleteAlert.data)} />
        </Modal>
      </Stack>
    </Homelayout>
  );
};

export default Expense;
