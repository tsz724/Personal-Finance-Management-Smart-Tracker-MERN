import React from 'react';
import { useNavigate } from 'react-router-dom';
import Homelayout from '../../components/layout/Homelayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
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
import { LuHandCoins, LuWalletMinimal, LuBriefcase, LuFolderKanban, LuMail, LuBuilding2 } from 'react-icons/lu';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

function Home() {
  useUserAuth();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [scope, setScope] = React.useState('personal');

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const qs =
          user?.role === 'admin' && scope === 'organization' ? '?scope=organization' : '?scope=personal';
        const response = await axiosInstance.get(`${API_PATHS.BUSINESS.DASHBOARD}${qs}`);
        if (response?.data) setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user, scope]);

  if (loading && !dashboardData) {
    return (
      <Homelayout activeMenu="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Homelayout>
    );
  }

  const biz = dashboardData?.business;

  return (
    <Homelayout activeMenu="Dashboard">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          Dashboard
        </Typography>
        {(user?.role || 'employee') === 'admin' && (
          <ToggleButtonGroup
            size="small"
            value={scope}
            exclusive
            onChange={(_, v) => v && setScope(v)}
            aria-label="dashboard scope"
          >
            <ToggleButton value="personal">Personal</ToggleButton>
            <ToggleButton value="organization">Administrator</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>

      {biz && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper sx={{ p: 2, cursor: 'pointer' }} onClick={() => navigate('/jobs')}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LuBriefcase size={28} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    My open jobs
                  </Typography>
                  <Typography variant="h6">{biz.jobs?.myOpen ?? 0}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper sx={{ p: 2, cursor: 'pointer' }} onClick={() => navigate('/projects')}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LuFolderKanban size={28} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    My open work items
                  </Typography>
                  <Typography variant="h6">{biz.workItems?.myOpen ?? 0}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper sx={{ p: 2, cursor: 'pointer' }} onClick={() => navigate('/email')}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LuMail size={28} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Unread inbox
                  </Typography>
                  <Typography variant="h6">{biz.unreadEmail ?? 0}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper sx={{ p: 2, cursor: 'pointer' }} onClick={() => navigate('/workspaces')}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LuBuilding2 size={28} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Workspaces you belong to
                  </Typography>
                  <Typography variant="h6">{biz.workspaces ?? 0}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          {scope === 'organization' && biz.organization && (
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Organization overview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active users: {biz.organization.totalUsers} · Workspaces: {biz.organization.totalWorkspaces}
                </Typography>
                {biz.organization.usersByRole?.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {biz.organization.usersByRole.map((r) => `${r._id}: ${r.count}`).join(' · ')}
                  </Typography>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Finance overview
      </Typography>

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
            onSeeMore={() => navigate('/finance/expense')}
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
            onSeeMore={() => navigate('/finance/income')}
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
            onSeeMore={() => navigate('/finance/expense')}
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
