import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/FontAwesome5";
import Toast from "react-native-toast-message";
import ipAdd from '../scripts/helpers/ipAddress';

const screenWidth = Dimensions.get("window").width;

const DashbordData = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ roles: [], total_admins: 0, active_admins: 0, inactive_admins: 0 });
  const [orgStats, setOrgStats] = useState({ active_organizations: 0, inactive_organizations: 0, total_organizations: 0, verified_organizations: 0 });
  const [userStats, setUserStats] = useState({ pending_users: 0, total_users: 0, users_by_city: [], users_by_gender: [] });
  const greenShades = ["#f94144", "#f9c74f", "#43aa8b", "#577590", "#9b5de5"];

  const fetchWithToken = async (url, setter) => {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setter(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: `خطأ: ${url.split("/").pop()}` });
    }
  };

  useEffect(() => {
    const getTokenAndFetchData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) throw new Error("لا يوجد توكين مخزن");
        setToken(storedToken);
        await Promise.all([
          fetchWithToken(`${ipAdd}:5000/admin/admins/stats`, setStats),
          fetchWithToken(`${ipAdd}:5000/admin/organizations/stats`, setOrgStats),
          fetchWithToken(`${ipAdd}:5000/admin/users/stats`, setUserStats)
        ]);
      } catch (error) {
        Toast.show({ type: 'error', text1: "فشل في تحميل البيانات" });
      } finally {
        setLoading(false);
      }
    };

    getTokenAndFetchData();
  }, [token]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} color="#43aa8b" />;
  }

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(67, 170, 139, ${opacity})`,
    labelColor: () => "#000",
  };

  const statusData = [
    { name: "Active", count: stats.active_admins, color: "#43aa8b", legendFontColor: "#000", legendFontSize: 14 },
    { name: "Inactive", count: stats.inactive_admins, color: "#f94144", legendFontColor: "#000", legendFontSize: 14 }
  ];

  const rolesData = {
    labels: stats.roles.map(r => r.role),
    datasets: [{ data: stats.roles.map(r => r.count) }]
  };

  const genderData = userStats.users_by_gender.map((g, i) => ({
    name: g.gender,
    count: g.count,
    color: greenShades[i % greenShades.length],
    legendFontColor: "#000",
    legendFontSize: 14
  }));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}><Icon name="user-shield" size={24} color="#2a7a39" /> Admin Dashboard</Text>

      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}><Icon name="user-check" /> Admins Status</Text>
        <PieChart data={statusData} width={screenWidth - 30} height={200} chartConfig={chartConfig} accessor={"count"} backgroundColor={"transparent"} />
      </View>

      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>Admins by Role</Text>
        <BarChart data={rolesData} width={screenWidth - 30} height={220} chartConfig={chartConfig} fromZero showValuesOnTopOfBars />
      </View>

      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}><Icon name="venus-mars" /> Users by Gender</Text>
        <PieChart data={genderData} width={screenWidth - 30} height={200} chartConfig={chartConfig} accessor={"count"} backgroundColor={"transparent"} />
      </View>

      {/* Users by City - Horizontal Scroll with Cards */}
      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}><Icon name="city" /> Users by City</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 10 }}>
          {userStats.users_by_city.length === 0 ? (
            <Text>No data available</Text>
          ) : (
            userStats.users_by_city.map((city, index) => (
              <View key={index} style={[styles.cityCard, { backgroundColor: greenShades[index % greenShades.length] }]}>
                <Text style={styles.cityName}>{city.city || "Unknown"}</Text>
                <View style={styles.barBackground}>
                  <View
                    style={[styles.barFill, { width: `${Math.min(city.count * 5, 100)}%` }]}
                  />
                </View>
                <Text style={styles.cityCount}>{city.count} Users</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <Toast />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
    backgroundColor: "#f9fafb",  // لون خلفية ناعم ومريح للعين
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 25,
    color: "#2a7a39",
    letterSpacing: 1,
  },
  chartBox: {
    marginBottom: 35,
    backgroundColor: "#ffffff",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 16,
    // ظل ناعم متوافق مع iOS و Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    color: "#2e7d32",
    letterSpacing: 0.5,
  },
  cityCard: {
    width: 140,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginRight: 15,
    elevation: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#43aa8b",
    shadowColor: "#43aa8b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cityName: {
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    fontSize: 18,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  barBackground: {
    width: "100%",
    height: 18,
    backgroundColor: "#d9e7df",
    borderRadius: 9,
    overflow: "hidden",
    marginBottom: 12,
  },
  barFill: {
    height: 18,
    backgroundColor: "#e0f2f1",
    borderRadius: 9,
  },
  cityCount: {
    color: "#e8f5e9",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});


export default DashbordData;
