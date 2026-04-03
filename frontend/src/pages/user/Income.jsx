import React, { useEffect, useState } from "react";
import Homelayout from "../../components/layout/Homelayout";
import IncomeOverview from "../../components/Income/IncomeOverview";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Modal from "../../components/Modal";
import AddIncomeform from "../../components/Income/AddIncomeform";
import IncomeCategoryManager from "../../components/Income/IncomeCategoryManager";
import toast from "react-hot-toast";
import List from "../../components/Income/List";
import Deletealert from "../../components/Deletealert";
import { useUserAuth } from "../../hooks/useUserAuth";
import Stack from "@mui/material/Stack";

const Income = () => {
  useUserAuth();

  const [incomeData, setIncomeData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  const loadIncomes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_PATHS.MODULES.FINANCE.INCOME.GET_ALL}`);
      if (response.data) {
        setIncomeData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeDetails = async () => {
    if (loading) return;
    await loadIncomes();
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.MODULES.FINANCE.INCOME_CATEGORIES.LIST);
      if (response.data) setCategories(response.data);
    } catch (error) {
      console.log("Failed to load income categories.", error);
    }
  };

  const handleAddIncome = async (income) => {
    const { category, amount, date, icon } = income;

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
      await axiosInstance.post(API_PATHS.MODULES.FINANCE.INCOME.ADD, {
        category,
        amount,
        date,
        icon,
      });

      setOpenAddIncomeModal(false);
      toast.success("Income added successfully");
      loadIncomes();
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      toast.error(msg);
      console.error("Error adding income:", msg);
    }
  };

  const deleteIncome = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.MODULES.FINANCE.INCOME.DELETE(id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Income details deleted successfully");
      loadIncomes();
    } catch (error) {
      console.error("Error deleting income:", error.response?.data?.message || error.message);
    }
  };

  const handleDownloadIncomeDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.MODULES.FINANCE.INCOME.DOWNLOAD_EXCEL, {
        responseType: "blob",
      });

      const disposition = response.headers["content-disposition"];
      let fileName = "income_details.xlsx";

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
      console.error("Error downloading income details:", error);
      toast.error("Failed to download income details. Please try again.");
    }
  };

  useEffect(() => {
    fetchIncomeDetails();
    fetchCategories();
    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  return (
    <Homelayout activeMenu="Finance / Income">
      <Stack spacing={3}>
        <IncomeOverview
          transactions={incomeData}
          onAddIncome={() => setOpenAddIncomeModal(true)}
          onManageCategories={() => setOpenCategoryModal(true)}
        />
        <List
          transactions={incomeData}
          onDelete={(id) => {
            setOpenDeleteAlert({ show: true, data: id });
          }}
          onDownload={handleDownloadIncomeDetails}
        />

        <Modal isOpen={openAddIncomeModal} onClose={() => setOpenAddIncomeModal(false)} title="Add income">
          <AddIncomeform categories={categories} onaddincome={handleAddIncome} />
        </Modal>

        <Modal isOpen={openCategoryModal} onClose={() => setOpenCategoryModal(false)} title="Income categories">
          <IncomeCategoryManager
            categories={categories}
            onUpdated={async () => {
              await fetchCategories();
              await loadIncomes();
            }}
          />
        </Modal>

        <Modal isOpen={openDeleteAlert.show} onClose={() => setOpenDeleteAlert({ show: false, data: null })} title="Delete income">
          <Deletealert
            content="Are you sure you want to delete this income detail?"
            onDelete={() => deleteIncome(openDeleteAlert.data)}
          />
        </Modal>
      </Stack>
    </Homelayout>
  );
};

export default Income;
