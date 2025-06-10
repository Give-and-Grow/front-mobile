import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import ipAdd from "../scripts/helpers/ipAddress";

const HonorBoard = () => {
  const [honors, setHonors] = useState([]);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    const fetchHonors = async () => {
      try {
        const url =
          period === "all"
            ? `${ipAdd}:5000/volunteers/top/all-honors`
            : `${ipAdd}:5000/volunteers/top/all-honors?period=${period}`;
        const response = await axios.get(url);
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setHonors(data);
      } catch (error) {
        console.error("Error fetching honors:", error);
      }
    };

    fetchHonors();
  }, [period]);

  const formatPeriod = (start, end) => {
    return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
  };

  const periodLabels = {
    all: "All",
    month: "Monthly",
    smonths: "Semi-Annual",
    year: "Yearly",
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Honor Board</Text>

      <View style={styles.buttons}>
        {Object.entries(periodLabels).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.periodBtn,
              period === key && styles.activeBtn
            ]}
            onPress={() => setPeriod(key)}
          >
            <Text style={styles.btnText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.grid}>
       {honors.map((vol, index) => (
    <View key={`${vol.user_id}-${index}`} style={styles.card}>
      <Image source={{ uri: vol.image }} style={styles.avatar} />
      <Text style={styles.name}>{vol.full_name}</Text>
      <Text style={styles.points}>Points: {vol.total_points}</Text>
      <Text style={styles.period}>
        Period: {formatPeriod(vol.period_start, vol.period_end)}
      </Text>
    </View>
  ))}
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E6F4EA", // أخضر فاتح جداً مريح للعين
  },
  title: {
    fontSize: 30,
    textAlign: "center",
    marginVertical: 25,
    fontWeight: "700",
    color: "#2E7D32", // أخضر غامق رسمي وجميل
    letterSpacing: 1.2,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 30,
    gap: 12,
  },
  periodBtn: {
    backgroundColor: "#A5D6A7", // أخضر فاتح هادي
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginHorizontal: 5,
    shadowColor: "#388E3C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  activeBtn: {
    backgroundColor: "#2E7D32", // أخضر غامق للزر النشط
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  grid: {
    gap: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#66BB6A",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  points: {
    fontSize: 18,
    color: "#388E3C",
    marginBottom: 8,
    fontWeight: "600",
  },
  period: {
    fontSize: 15,
    color: "#558B2F",
    fontStyle: "italic",
  },
});


export default HonorBoard;
