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
import Last30daysExpenses from '../../components/Home/Last30daysExpenses';
import IncomeLast60Days from '../../components/Home/IncomeLast60Days';
import IncomeList from '../../components/Home/IncomeList';
import { IoMdCard } from 'react-icons/io';
import { addThousandSeparators } from '../../utils/helper';
import { LuHandCoins,LuWalletMinimal } from 'react-icons/lu';

function Home() {
  useUserAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          API_PATHS.DASHBOARD.GET_DATA
        );

        if (response?.data) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Homelayout activeMenu="Home">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance "
            value={addThousandSeparators(dashboardData?.totalBalance || 0)}
             color="bg-blue-600"
          />
          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income "
            value={addThousandSeparators(dashboardData?.totalincome || 0)}
             color="bg-green-500"
          />
          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expense "
            value={addThousandSeparators(dashboardData?.totalexpenses || 0)}
             color="bg-red-500"
          />
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecentTransactions
            transactions={dashboardData?.recentTransactions || []}
          onSeeMore={() => navigate('/expense')}
          />
          <FinanceOverview
          totalBalance={dashboardData?.totalBalance || 0}
          totalIncome={dashboardData?.totalincome || 0}
          totalExpense={dashboardData?.totalexpenses || 0}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <ExpensesList
            expenses={dashboardData?.totalExpensesLast60Days?.transactions || []}
            onSeeMore={() => navigate('/expense')}
          />
          <Last30daysExpenses
            expenses={dashboardData?.totalExpensesLast60Days?.transactions || []}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <IncomeList
            income={dashboardData?.totalIncomeLast60Days}
            onSeeMore={() => navigate('/income')}
          />
          <IncomeLast60Days income={dashboardData?.totalIncomeLast60Days} />
        </div>
      </div>
    </Homelayout>
  );
}

export default Home;