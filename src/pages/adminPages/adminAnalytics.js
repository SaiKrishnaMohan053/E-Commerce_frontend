import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Menu,
  MenuItem,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import DateRangeBox from "../../components/datePickerBox";
import { useSelector } from "react-redux";

const statusColorMap = {
  Pending:     "default",
  Processing:  "default",
  "Order Ready":"success",
  Delivered:   "primary",
  Pickedup:    "primary",
  Cancelled:   "error",
};
const COLORS = [
  "#1976d2", 
  "#388e3c", 
  "#f57c00", 
  "#d32f2f", 
  "#7b1fa2", 
  "#0288d1", 
  "#c2185b", 
  "#ffa000", 
  "#0097a7", 
  "#7cb342"  
];
const API_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function AdminAnalytics() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { user } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    sales: {},
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    topProducts: [],
    activeUsers: [],
    salesByCategory: [],
    orderTrends: [],
    statusBreakdown: [],
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [summaryMenuAnchor, setSummaryMenuAnchor] = useState(null);
  const [dateBox, setDateBox] = useState({ open: false, type: null });

  useEffect(() => {
    (async () => {
      try {
        const headers = { Authorization: `Bearer ${user?.token}` };
        const [sumRes, catRes, prodRes, spendRes, trendRes, statusRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/summary`, { headers }),
          axios.get(`${API_URL}/api/admin/sales-by-category/monthly`, { headers }),
          axios.get(`${API_URL}/api/admin/top-products`, { headers }),
          axios.get(`${API_URL}/api/admin/top-spenders`, { headers }),
          axios.get(`${API_URL}/api/admin/daily-order-trends`, { headers }),
          axios.get(`${API_URL}/api/admin/order-status-breakdown`, { headers }),
        ]);
        setAnalytics({
          sales: sumRes.data.sales || {},
          totalUsers: sumRes.data.totalUsers || 0,
          totalOrders: sumRes.data.totalOrders || 0,
          totalRevenue: sumRes.data.totalRevenue || 0,
          topProducts: prodRes.data || [],
          activeUsers: spendRes.data || [],
          salesByCategory: catRes.data || [],
          orderTrends: [
            { period: "Today", count: trendRes.data.daily || 0 },
            { period: "Weekly", count: trendRes.data.weekly || 0 },
            { period: "Monthly", count: trendRes.data.monthly || 0 },
          ],
          statusBreakdown: statusRes.data || [],
        });
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || err.message);        
        console.error("Analytics load failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if(error) return <div>{error}</div>

  function makeDateRange(period, fromStr, toStr) {
    let fromDate, toDate = new Date();
    if (period === 'custom' && fromStr && toStr) {
      fromDate = new Date(fromStr);
      toDate   = new Date(toStr);
      toDate.setHours(23,59,59,999);
    } else {
      const now = new Date();
      toDate = now;
      switch (period) {
        case 'today':
          fromDate = new Date(now); fromDate.setHours(0,0,0,0);
          break;
        case 'weekly':
          fromDate = new Date(now); fromDate.setDate(now.getDate() - now.getDay());
          fromDate.setHours(0,0,0,0);
          break;
        case 'monthly':
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          fromDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          throw new Error(`Invalid period: ${period}`);
      }
    }
    const fromISO = fromDate.toISOString().slice(0,10);
    const toISO   = toDate.toISOString().slice(0,10);
    return { fromDate, toDate, fromISO, toISO };
  }

  function exportXlsx({ metaRows, dataRows, dataHeaders, sheetName, fileName }) {
    const ws = XLSX.utils.aoa_to_sheet(metaRows);
    if (Array.isArray(dataRows) && dataRows.length) {
      if (typeof dataRows[0] === 'object' && !Array.isArray(dataRows[0])) {
        XLSX.utils.sheet_add_json(ws, dataRows, {
          origin: `A${metaRows.length+1}`,
          header: dataHeaders,
          skipHeader: false
        });
      } else {
        XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: `A${metaRows.length+1}` });
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf]), fileName);
  }

  async function exportSalesSummaryCustom(fromStr, toStr) {
    const { fromISO, toISO } = makeDateRange('custom', fromStr, toStr);
    const { data } = await axios.get(
      `${API_URL}/api/admin/summary/${fromISO}/${toISO}`,
      { headers:{ Authorization:`Bearer ${user?.token}` }}
    );
    exportXlsx({
      metaRows: [
        ['Report','Sales Summary — Custom'],
        ['From', data.from],
        ['To',   data.to],
        []
      ],
      dataRows: [[ 'Total Sales', data.totalSales ]],
      dataHeaders: ['Total Sales'],
      sheetName: 'SalesSummary_Custom',
      fileName: 'SalesSummary_Custom.xlsx'
    });
  }  

  function exportSalesSummary() {
    const rows = Object.entries(analytics.sales).map(([p,r])=>({ period:p, revenue:Number(r.toFixed(2)) }));
    exportXlsx({
      metaRows: [['Report','Sales Summary']],
      dataRows: rows,
      dataHeaders: ['period','revenue'],
      sheetName: 'SalesSummary',
      fileName: 'SalesSummary.xlsx'
    });
  }
  
  
  async function exportCategoryReport(period, fromStr, toStr) {
    const headers = { Authorization: `Bearer ${user?.token}` };
    const { fromISO, toISO } = makeDateRange(period, fromStr, toStr);
    const url = period==='custom'
      ? `${API_URL}/api/admin/sales-by-category/custom/${fromISO}/${toISO}`
      : `${API_URL}/api/admin/sales-by-category/${period}`;
    const { data } = await axios.get(url, { headers });
    if (!data.length) return alert('No data');
    exportXlsx({
      metaRows: [
        ['Report',`Sales by Category — ${period}`],
        ['From',fromISO],
        ['To',toISO],
        []
      ],
      dataRows: data,
      dataHeaders: ['category','totalRevenue'],
      sheetName: `Category_${period}`,
      fileName: `SalesByCategory_${period}.xlsx`
    });
  }  

  if (loading) return (
    <Box>
      <Grid container spacing={3}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Card elevation={3}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="80%" height={48} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} mt={4}>
        {[0, 1].map((_, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Typography variant="h6" gutterBottom>
              <Skeleton variant="text" width="40%" />
            </Typography>
            <Skeleton variant="rectangular" width="100%" height={300} animation="wave" />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} mt={5}>
        {[0, 1].map((_, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Typography variant="h6" gutterBottom>
              <Skeleton variant="text" width="60%" />
            </Typography>
            <Skeleton variant="rectangular" width="100%" height={350} animation="wave" />
          </Grid>
        ))}
      </Grid>
    </Box>
  )

  const salesData = Object.entries(analytics.sales).map(([p,val]) => ({ period: p, revenue: Number(val.toFixed(2)) }));

  return (
    <Box>
      <Grid container spacing={3}>
        {[
          { label: 'Total Users', value: analytics.totalUsers },
          { label: 'Total Orders', value: analytics.totalOrders },
          { label: 'Total Revenue', value: `$${analytics.totalRevenue.toFixed(2)}` }
        ].map((it,i)=>(
          <Grid item xs={12} sm={4} key={i}>
            <Card elevation={3}><CardContent>
              <Typography variant="h6">{it.label}</Typography>
              <Typography variant="h5" fontWeight="bold">{it.value}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} mt={4}>
        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Sales Summary</Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={e => setSummaryMenuAnchor(e.currentTarget)}
            >
              Download
            </Button>
            <Menu
              anchorEl={summaryMenuAnchor}
              open={Boolean(summaryMenuAnchor)}
              onClose={() => setSummaryMenuAnchor(null)}
              disableAutoFocusItem
              disableRestoreFocus
              MenuListProps={{ onMouseDown: e => e.stopPropagation() }}
            >
              <MenuItem onClick={() => { exportSalesSummary(); setSummaryMenuAnchor(null); }}>
                Full Summary
              </MenuItem>
              <MenuItem onClick={() => {
                  setDateBox({ open: true, type: 'summary' });
                  setSummaryMenuAnchor(null);
                }}
              >
                Custom Range
              </MenuItem>
            </Menu>
          </Box>
          {salesData.length>0 ? (
            <Box width="100%">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <XAxis dataKey="period"/>
                  <YAxis tickFormatter={v=>`$${v>=1000?(v/1000).toFixed(1)+'k':v}`}/>
                  <Tooltip formatter={v=>`$${v.toFixed(2)}`}/>
                  <Line dataKey="revenue" stroke="#1976d2" strokeWidth={3} dot={{r:4}} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (<Typography>No sales data</Typography>)}
        </Grid>

        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Sales by Category</Typography>
            <Button size="small" variant="outlined" onClick={e=>setMenuAnchor(e.currentTarget)}>Download</Button>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={()=>setMenuAnchor(null)} disableAutoFocusItem disableRestoreFocus MenuListProps={{onMouseDown:e=>e.stopPropagation()}}>
              {['today','weekly','monthly','yearly'].map(opt => (
                <MenuItem key={opt} onClick={()=>{exportCategoryReport(opt); setMenuAnchor(null);}}>
                  {opt.charAt(0).toUpperCase()+opt.slice(1)}
                </MenuItem>
              ))}
              <MenuItem onClick={() => {
                setDateBox({ open: true, type: 'category' });
                setMenuAnchor(null);
              }}>
                Custom Range
              </MenuItem>
            </Menu>
          </Box>
          {analytics.salesByCategory.length ? (
            <Box width="100%">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.salesByCategory.slice(0,6)}>
                  <XAxis dataKey="category"/>
                  <YAxis tickFormatter={v=>`$${v>=1000?(v/1000).toFixed(1)+'k':v}`}/>
                  <Tooltip formatter={v=>`$${v.toFixed(2)}`}/>
                  <Bar dataKey="totalRevenue" fill="#f57c00" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ):(<Typography>No category data</Typography>)}
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={5}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Order Trends</Typography>
          {analytics.orderTrends.length > 0 ? (
            <Box width="100%">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.orderTrends}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1976d2"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography>No trend data available</Typography>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Order Status Breakdown</Typography>
          {analytics.statusBreakdown.filter(e => e.status).length > 0 ? (
            <Box width="100%">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  {(() => {
                    const statusOrder = [
                      "Pending",
                      "Processing",
                      "Order Ready",
                      "Delivered",
                      "Pickedup",
                      "Cancelled"
                    ];
                    const sorted = analytics.statusBreakdown
                      .filter(e => statusOrder.includes(e.status))
                      .sort(
                        (a, b) =>
                          statusOrder.indexOf(a.status) -
                          statusOrder.indexOf(b.status)
                      );
                    return (
                      <Pie
                        data={sorted}
                        dataKey="count"
                        nameKey="status"
                        outerRadius={100}
                        label
                      >
                        {sorted.map((entry, i) => {
                          const paletteKey =
                            statusColorMap[entry.status] || "grey";
                          const fillColor =
                            theme.palette[paletteKey]?.main ||
                            theme.palette.grey[500];
                          return <Cell key={i} fill={fillColor} />;
                        })}
                      </Pie>
                    );
                  })()}
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography>No status data available</Typography>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={5}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Top 10 Selling Products</Typography>
          {analytics.topProducts.length > 0 ? (
            <Box width="100%">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={analytics.topProducts}
                    dataKey="totalSold"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {analytics.topProducts.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip/>
                  <Legend verticalAlign="bottom" align="center" height={50} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography>No top selling products available</Typography>
          )}
        </Grid>

        <Grid item xs={12} md={6} mt={isMobile ? 3 : 0}>
          <Typography variant="h6">Top 10 Highest Spenders</Typography>
          {analytics.activeUsers.length > 0 ? (
            <Box width="100%">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.activeUsers}
                    dataKey="totalSpent"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {analytics.activeUsers.map((_, i) => (
                      <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => `$${v.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography>No highest spenders data</Typography>
          )}
        </Grid>
      </Grid>

      {dateBox.open && (
        <DateRangeBox
          onClose={() => setDateBox({ open: false, type: null })}
          onApply={(fromDate, toDate) => {
            const from = fromDate.toISOString().split('T')[0];
            const to   = toDate.toISOString().split('T')[0];

            if (dateBox.type === 'category') {
              exportCategoryReport('custom', from, to);
            } else {
              exportSalesSummaryCustom(from, to);
            }

            setDateBox({ open: false, type: null });
          }}
        />
      )}
    </Box>
  );
}

export default AdminAnalytics;