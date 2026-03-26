"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Table,
  Chip,
  Stack,
  Skeleton
} from "@mui/joy";

import { motion } from "framer-motion";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { inventoryApi } from "@/services/api/inventory/inventory.api";
import { ordersApi } from "@/services/api/orders/orders.api";
import { InventoryItemStatusEnum } from "@/services/api/inventory/inventory.types";
import { useAuth } from "@/auth/AuthProvider";

const MotionCard = motion(Card); // create a motion-enabled version of the MUI Card component for animations

const COLORS = [
  "#4f46e5",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6"
]; // color palette for charts, we can reuse these colors for consistency across different charts

interface ActivityItem {
  text: string;
}// this interface defines the shape of an activity feed item, which currently just has a text property. We can expand this later to include things like timestamp, type of activity, etc.

interface ChartItem {
  name: string;
  orders: number;
}// this interface defines the shape of data points for our order activity line chart. Each item has a name (e.g. "Day 1") and a number of orders for that day.

interface CategoryItem {
  name: string;
  value: number;
}// this interface defines the shape of data points for our inventory category pie chart. Each item has a name (category name) and a value (number of items in that category).

function StatCard({
  title,
  value //displays inventory items, low stock count, and orders today. We can easily reuse this component for any other key metrics we want to add to the dashboard in the future.
}: {
  title: string;
  value: number; // we can expand this later to support different types of values (e.g. currency, percentages) and maybe an optional icon or trend indicator
}) {
  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: "lg",
        transition: "0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "lg"
        } // hover effect
      }}
    >
      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
        {title}
      </Typography>

      <Typography level="h2">
        {value}
      </Typography>
    </MotionCard>
  );
}

function statusChip(status: InventoryItemStatusEnum) {

  switch (status) {

    case InventoryItemStatusEnum.InStock:
      return <Chip color="success">In Stock</Chip>;

    case InventoryItemStatusEnum.LowStock:
      return <Chip color="warning">Low Stock</Chip>;

    default:
      return <Chip color="danger">Out of Stock</Chip>;
  }
}

export default function DashboardPage() {

  const { user } = useAuth();
//gets user info from auth context to greet them by name. We try to get the firstName property from the user object, but if it's not available, we fallback to splitting the name by space and taking the first part (assuming it's the first name). If that also fails, we just use "User" as a generic fallback. This way we can greet the user by their first name if we have it, or at least use a friendly default if we don't.
  const firstName =
    user?.firstName ?? //first try to get firstName from user object, if not available, fallback to splitting the name by space and taking the first part (assuming it's the first name), if that also fails, just use "User" as a generic fallback. This way we can greet the user by their first name if we have it, or at least use a friendly default if we don't.
    user?.name?.split(" ")[0] ??
    "User";

  const [loading, setLoading] = useState(true);
// loading state for the entire dashboard, we show skeletons while loading is true, and then show the actual content once loading is false. We set loading to false after we finish fetching all the necessary data for the dashboard in the useEffect below.
  const [inventoryCount, setInventoryCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [ordersToday, setOrdersToday] = useState(0);
//three number counters for stat cards. All start at 0 and gets updated after the api respond
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);

  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
//same here get populated after api calls finish
  useEffect(() => {

    async function loadDashboard() {

      try {

        /* INVENTORY */

        const inventoryRes = await inventoryApi.list({
          Page: 1,
          PageSize: 1000
        });

        const items = inventoryRes.items;
        // fetches up to 1000 inventory items. 
        setInventoryCount(items.length);
        //total count of inventory items for the stat card
        const lowStock = items.filter(
          (item) =>
            item.status === InventoryItemStatusEnum.LowStock ||
            item.status === InventoryItemStatusEnum.OutStock
        );
        

        setLowStockCount(lowStock.length);
        setLowStockItems(lowStock.slice(0, 5));
        // we filter the items to find those that are low stock or out of stock, then we set the low stock count for the stat card, and also keep a list of the first 5 low stock items to show in the low stock alerts table.
        /* CATEGORY DATA */

        const categoryMap: Record<string, number> = {}; // we create a map to count the number of items in each category. The keys are category names and the values are the counts. We will populate this map by iterating over all inventory items and counting how many belong to each category.

        items.forEach((item) => {

          const category = item.category ?? "Other";

          categoryMap[category] =
            (categoryMap[category] ?? 0) + 1;

        });

        const categoryChart: CategoryItem[] =
          Object.keys(categoryMap).map((key) => ({
            name: key,
            value: categoryMap[key]
          }));// we then transform the categoryMap into an array of CategoryItem objects, which have the shape { name: categoryName, value: itemCount }. This array can then be used as data for the inventory category pie chart.

        setCategoryData(categoryChart); //

        /* ORDERS */

        const ordersRes = await ordersApi.list({
          Page: 1,
          PageSize: 20
        });

        const orders = ordersRes.items;

        setRecentOrders(orders.slice(0, 5));

        const today = new Date().toDateString();

        const todaysOrders = orders.filter(
          (order) =>
            new Date(order.createdAt).toDateString() === today
        );
        setOrdersToday(todaysOrders.length);
        //we filter the orders to find those that were created today, and then we set the orders today count for the stat card. We also keep a list of the first 5 recent orders to show in the recent orders table.


        /* ORDER CHART */

        const chart: ChartItem[] =
          orders.slice(0, 7).map((order, index) => ({
            name: `Day ${index + 1}`,
            orders: order.totalItems ?? 1
          }));

        setChartData(chart);
          // we take the first 7 orders and create a simple chart data array where the name is "Day 1", "Day 2", etc. and the orders value is the total number of items in that order (or 1 if totalItems is not available). This is just a placeholder for demonstration, in a real app we would want to group orders by day and count how many orders were created each day to show a more meaningful order activity chart.

        /* ACTIVITY FEED */

        const activity: ActivityItem[] = [

          ...orders.slice(0, 3).map((order) => ({
            text: `Order #${order.id} created`
          })),

          ...lowStock.slice(0, 2).map((item) => ({
            text: `${item.productName} low stock`
          }))

        ]; // we create a simple activity feed by taking the first few orders and low stock items and creating text entries for them. This is just a basic example, in a real app we would want to have a more robust activity feed that captures different types of events (e.g. new order, order shipped, item low stock, item out of stock, etc.) along with timestamps and maybe links to the relevant order or inventory item.

        setActivityFeed(activity);

      } catch (error) {

        console.error("Dashboard load failed", error);

      } finally {

        setLoading(false);

      }// we wrap all our data fetching and processing in a try-catch block to handle any potential errors that might occur during the API calls. In the finally block, we set loading to false to indicate that we have finished loading the dashboard data, whether it was successful or if there was an error. This way we can stop showing the skeletons and either show the data or an error message if needed (currently we just log the error to console, but we could also set an error state and display it in the UI).
    }

    loadDashboard(); 

  }, []); // we run this effect once on component mount to load all the dashboard data from the API. We fetch inventory items, orders, and then derive all our dashboard metrics and charts from that data. We also handle loading state and errors.

  return (
    <Box>

      {/* HEADER */}

      <Box sx={{ mb: 3 }}>

        <Typography level="h2">
          Welcome, {firstName}
        </Typography>

        <Typography
          level="body-sm"
          sx={{ color: "text.tertiary" }}
        >
          Here is what's happening in your warehouse today.
        </Typography>

      </Box>

      {/* STAT CARDS */}

      <Grid container spacing={2} sx={{ mb: 3 }}>

        <Grid xs={12} sm={6} md={4}>
          {loading ? (
            <Skeleton height={90} />
          ) : (
            <StatCard
              title="Inventory Items"
              value={inventoryCount}
            />
          )}
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          {loading ? (
            <Skeleton height={90} />
          ) : (
            <StatCard
              title="Low Stock Items"
              value={lowStockCount}
            />
          )}
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          {loading ? (
            <Skeleton height={90} />
          ) : (
            <StatCard
              title="Orders Today"
              value={ordersToday}
            />
          )}
        </Grid>

      </Grid>

      {/* CHARTS */}

      <Grid container spacing={2} sx={{ mb: 3 }}>

        <Grid xs={12} md={6}>

          <Card sx={{ p: 2 }}>

            <Typography level="title-md">
              Order Activity
            </Typography>

            <Box sx={{ height: 250 }}>

              {loading ? (
                <Skeleton height={250} />
              ) : (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart data={chartData}>

                    <XAxis dataKey="name" />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#4f46e5"
                      strokeWidth={3}
                    />

                  </LineChart>

                </ResponsiveContainer>
                // we show a line chart of order activity using the chartData we prepared earlier. If we're still loading, we show a skeleton instead. The chart is responsive and will adjust to the size of the container. We use a monotone line type for smooth curves, and we customize the stroke color and width for better visuals.

              )}

            </Box>

          </Card>

        </Grid>

        <Grid xs={12} md={6}>

          <Card sx={{ p: 2 }}>

            <Typography level="title-md">
              Inventory Categories
            </Typography>

            <Box sx={{ height: 250 }}>

              {loading ? (
                <Skeleton height={250} />
              ) : (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >

                      {categoryData.map((entry, index) => (

                        <Cell
                          key={index}
                          fill={
                            COLORS[index % COLORS.length]
                          }
                        />

                      ))}

                    </Pie>
                    

                  </PieChart>

                </ResponsiveContainer>

              )}

            </Box>

          </Card>

        </Grid>

      </Grid>

      {/* TABLES */}

      <Grid container spacing={2}>

        {/* LOW STOCK */}

        <Grid xs={12} md={4}>

          <Card sx={{ p: 2 }}>

            <Typography level="title-md">
              Low Stock Alerts
            </Typography>

            <Table size="sm">

              <tbody>

                {lowStockItems.map((item) => (

                  <tr key={item.id}>

                    <td>{item.productName}</td>

                    <td>{item.quantity}</td>

                    <td>
                      {statusChip(item.status)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </Table>

          </Card>

        </Grid>

        {/* RECENT ORDERS */}

        <Grid xs={12} md={4}>

          <Card sx={{ p: 2 }}>

            <Typography level="title-md">
              Recent Orders
            </Typography>

            <Table size="sm">

              <tbody>

                {recentOrders.map((order) => (

                  <tr key={order.id}>

                    <td>{order.id}</td>

                    <td>
                      <Chip size="sm">
                        {order.status ?? "Pending"}
                      </Chip>
                    </td>

                  </tr>

                ))}

              </tbody>

            </Table>

          </Card>

        </Grid>

        {/* ACTIVITY FEED */}

        <Grid xs={12} md={4}>

          <Card sx={{ p: 2 }}>

            <Typography level="title-md">
              Activity Feed
            </Typography>

            <Stack spacing={1.2} sx={{ mt: 1 }}>

              {activityFeed.map((activity, index) => (

                <Typography
                  key={index}
                  level="body-sm"
                >
                  • {activity.text}
                </Typography>

              ))}

            </Stack>

          </Card>

        </Grid>

      </Grid>

    </Box>
  );
}