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

const MotionCard = motion(Card);

const COLORS = ["#4f46e5", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

function StatCard({
  title,
  value
}: {
  title: string;
  value: number;
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
        }
      }}
    >
      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
        {title}
      </Typography>

      <Typography level="h2">{value}</Typography>
    </MotionCard>
  );
}

function statusChip(status: number) {
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

  const firstName =
    user?.firstName ??
    user?.name?.split(" ")[0] ??
    "User";

  const [loading, setLoading] = useState(true);

  const [inventoryCount, setInventoryCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [ordersToday, setOrdersToday] = useState(0);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  useEffect(() => {

    async function loadDashboard() {

      try {

        /* INVENTORY */

        const inventoryRes = await inventoryApi.list({
          Page: 1,
          PageSize: 1000
        });

        const items = inventoryRes.items;

        setInventoryCount(items.length);

        const lowStock = items.filter(
          (i: any) =>
            i.status === InventoryItemStatusEnum.LowStock ||
            i.status === InventoryItemStatusEnum.OutStock
        );

        setLowStockCount(lowStock.length);
        setLowStockItems(lowStock.slice(0, 5));

        /* CATEGORY DATA */

        const categoryMap: any = {};

        items.forEach((item: any) => {
          const cat = item.category ?? "Other";
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        const categoryChart = Object.keys(categoryMap).map((key) => ({
          name: key,
          value: categoryMap[key]
        }));

        setCategoryData(categoryChart);

        /* ORDERS */

        const ordersRes = await ordersApi.list({
          Page: 1,
          PageSize: 20
        });

        const orders = ordersRes.items;

        setRecentOrders(orders.slice(0, 5));

        const today = new Date().toDateString();

        const todaysOrders = orders.filter(
          (o: any) =>
            new Date(o.createdAt).toDateString() === today
        );

        setOrdersToday(todaysOrders.length);

        /* CHART */

        const chart = orders.slice(0, 7).map((o: any, i: number) => ({
          name: `Day ${i + 1}`,
          orders: o.totalItems ?? 1
        }));

        setChartData(chart);

        /* ACTIVITY FEED */

        const activity = [
          ...orders.slice(0, 3).map((o: any) => ({
            text: `Order #${o.id} created`,
            time: "recent"
          })),
          ...lowStock.slice(0, 2).map((i: any) => ({
            text: `${i.productName} low stock`,
            time: "inventory"
          }))
        ];

        setActivityFeed(activity);

      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();

  }, []);

  return (
    <Box>

      {/* WELCOME HEADER */}

      <Box sx={{ mb: 3 }}>

        <Typography level="h2">
          Welcome, {firstName}
        </Typography>

        <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
          Here is what's happening in your warehouse today.
        </Typography>

      </Box>

      {/* STAT CARDS */}

      <Grid container spacing={2} sx={{ mb: 3 }}>

        <Grid xs={12} sm={6} md={4}>
          {loading ? (
            <Skeleton height={90} />
          ) : (
            <StatCard title="Inventory Items" value={inventoryCount} />
          )}
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          {loading ? (
            <Skeleton height={90} />
          ) : (
            <StatCard title="Low Stock Items" value={lowStockCount} />
          )}
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          {loading ? (
            <Skeleton height={90} />
          ) : (
            <StatCard title="Orders Today" value={ordersToday} />
          )}
        </Grid>

      </Grid>

      {/* CHARTS */}

      <Grid container spacing={2} sx={{ mb: 3 }}>

        <Grid xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography level="title-md">Order Activity</Typography>

            <Box sx={{ height: 250 }}>

              {loading ? (
                <Skeleton height={250} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
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
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}

            </Box>
          </Card>
        </Grid>

      </Grid>

      {/* TABLES + ACTIVITY */}

      <Grid container spacing={2}>

        {/* LOW STOCK */}

        <Grid xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography level="title-md">Low Stock Alerts</Typography>

            <Table size="sm">
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>{statusChip(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Grid>

        {/* RECENT ORDERS */}

        <Grid xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography level="title-md">Recent Orders</Typography>

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
            <Typography level="title-md">Activity Feed</Typography>

            <Stack spacing={1.2} sx={{ mt: 1 }}>

              {activityFeed.map((a, i) => (
                <Typography key={i} level="body-sm">
                  • {a.text}
                </Typography>
              ))}

            </Stack>
          </Card>
        </Grid>

      </Grid>

    </Box>
  );
}