import React from 'react';
import { useNavigate } from 'react-router-dom';
import Homelayout from '../../components/layout/Homelayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import InfoCard from '../../components/Card/InfoCard';
import RecentTransactions from '../../components/Home/RecentTransactions';
import FinanceOverview from '../../components/Home/FinanceOverview';
import ExpensesList from '../../components/Home/ExpensesList';
import ExpensesLast60days from '../../components/Home/ExpensesLast60days';
import IncomeLast60Days from '../../components/Home/IncomeLast60Days';
import IncomeList from '../../components/Home/IncomeList';
import { IoMdCard } from 'react-icons/io';
import { addThousandSeparators } from '../../utils/helper';
import { LuHandCoins, LuWalletMinimal } from 'react-icons/lu';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

function Home() {
  useUserAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(API_PATHS.MODULES.FINANCE.DASHBOARD);
        if (response?.data) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading && !dashboardData) {
    return (
      <Homelayout activeMenu="Home">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Homelayout>
    );
  }

  return (
    <Homelayout activeMenu="Home">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <InfoCard
            icon={<IoMdCard />}
            label="Total balance"
            value={addThousandSeparators(dashboardData?.totalBalance || 0)}
           color="#2563eb"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total income"
            value={addThousandSeparators(dashboardData?.totalincome || 0)}
            color="#059669"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <InfoCard
            icon={<LuHandCoins />}
            label="Total expense"
            value={addThousandSeparators(dashboardData?.totalexpenses || 0)}
            color="#dc2626"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <RecentTransactions
            transactions={dashboardData?.recentTransactions || []}
            onSeeMore={() => navigate('/expense')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FinanceOverview
            totalBalance={dashboardData?.totalBalance || 0}
            totalIncome={dashboardData?.totalincome || 0}
            totalExpense={dashboardData?.totalexpenses || 0}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <IncomeList
            income={dashboardData?.totalIncomeLast60Days?.transactions || []}
            onSeeMore={() => navigate('/income')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <IncomeLast60Days
            income={dashboardData?.totalIncomeLast60Days?.transactions || []}
            totalincome={dashboardData?.totalIncomeLast60Days?.total || 0}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ExpensesList
            expenses={dashboardData?.totalExpensesLast60Days?.transactions || []}
            onSeeMore={() => navigate('/expense')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExpensesLast60days data={dashboardData?.totalExpensesLast60Days?.transactions || []} />
        </Grid>
      </Grid>
    </Homelayout>
  );
}

export default Home;
