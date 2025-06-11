import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import DropDownPicker from 'react-native-dropdown-picker';
import ipAdd from "../scripts/helpers/ipAddress";


const HonorBoard = () => {
  const [period, setPeriod] = useState('all');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // DropDown states
  const [openPeriod, setOpenPeriod] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);

  const [periodItems, setPeriodItems] = useState([
    { label: 'All', value: 'all' },
    { label: 'Monthly', value: 'month' },
    { label: 'Semi-Annually', value: 'smonths' },
    { label: 'Annually', value: 'year' },
  ]);

  const [yearItems, setYearItems] = useState(
    [2022, 2023, 2024, 2025].map(y => ({ label: `${y}`, value: y }))
  );

  const [monthItems, setMonthItems] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      label: `${i + 1}`,
      value: i + 1,
    }))
  );


  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (period !== 'all') params.append('period', period);

      if (['month', 'smonths', 'year'].includes(period)) {
        params.append('year', year);
      }

      if (period === 'month') {
        params.append('month', month);
      }

      const fullUrl = `${ipAdd}:5000/volunteers/top/all-honors?${params.toString()}`;
      console.log('📡 Request URL:', fullUrl);

      const response = await fetch(fullUrl);

      if (!response.ok) {
        Alert.alert('Error', `Failed to fetch data: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVolunteers(data);

    } catch (error) {
      console.error('Error fetching volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setYear(new Date().getFullYear());
    setMonth(new Date().getMonth() + 1);
  }, [period]);

  useEffect(() => {
    setShowConfetti(true);
    fetchVolunteers();
  }, [period, year, month]);

  return (
    <View style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          count={100}
          origin={{ x: 200, y: -10 }}
          fadeOut={true}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}

      <Text style={styles.title}>🎉 Honor Board 🎉</Text>

      <View style={styles.filterContainer}>
        <View style={[styles.dropdownWrapper, styles.dropdownWrapperHorizontal]}>
          <Text style={styles.label}>Period:</Text>
          <DropDownPicker
            open={openPeriod}
            value={period}
            items={periodItems}
            setOpen={setOpenPeriod}
            setValue={setPeriod}
            setItems={setPeriodItems}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownBox}
            zIndex={4000}
          />
        </View>

        {['month', 'smonths', 'year'].includes(period) && (
          <View style={[styles.dropdownWrapper, styles.dropdownWrapperHorizontal]}>
            <Text style={styles.label}>Year:</Text>
            <DropDownPicker
              open={openYear}
              value={year}
              items={yearItems}
              setOpen={setOpenYear}
              setValue={setYear}
              setItems={setYearItems}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownBox}
              zIndex={3000}
            />
          </View>
        )}

        {period === 'month' && (
          <View style={[styles.dropdownWrapper, styles.dropdownWrapperHorizontal]}>
            <Text style={styles.label}>Month:</Text>
            <DropDownPicker
              open={openMonth}
              value={month}
              items={monthItems}
              setOpen={setOpenMonth}
              setValue={setMonth}
              setItems={setMonthItems}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownBox}
              zIndex={2000}
            />
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" />
      ) : (
        <ScrollView style={styles.volunteerList}>
          {volunteers.length === 0 ? (
            <Text style={styles.noVolunteers}>No volunteers found for this period.</Text>
          ) : (
            volunteers.map((v, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.volunteerCard}
              onPress={() => {
  setShowConfetti(true);
 
}}

                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: v.image || 'https://via.placeholder.com/60' }}
                  style={styles.avatar}
                />
                <View style={styles.volunteerInfo}>
                  <Text style={styles.volunteerName}>{v.full_name}</Text>
                  <Text style={styles.volunteerPoints}>Points: {v.total_points}</Text>
                  <Text style={styles.volunteerPeriod}>
                    From {v.period_start} to {v.period_end}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a1e',
    textAlign: 'center',
    marginBottom: 20,
  },
 filterContainer: {
  borderRadius: 12,
  padding: 12,
  marginBottom: 16,
  flexDirection: 'row',
  justifyContent: 'space-between',
  flexWrap: 'wrap',

  // إضافة البوردر
  borderWidth: 1.8,
  borderColor: '#34d399',  // أخضر فاتح وجميل

  // إضافة ظل ناعم
  shadowColor: '#34d399',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,

  elevation: 6, // للاندرويد
  backgroundColor: '#E8F5E9', // مهم عشان يظهر البوردر والشادو بوضوح
  zIndex: 1000,
},

  dropdownWrapper: {
    marginBottom: 14,
    zIndex: 1000,
  },
  dropdownWrapperHorizontal: {
    flex: 1,
    minWidth: 100,
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#065f46',
    marginBottom: 6,
  },
  dropdown: {
    backgroundColor: '#f9fafb',
    borderColor: '#10b981',
    height: 44,
  },
  dropdownBox: {
    borderColor: '#10b981',
  },
  volunteerList: {
    marginTop: 10,
  },
  volunteerCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#ffffff',
  padding: 16,
  marginBottom: 14,
  borderRadius: 14,

  // ظلال أنيقة مع عمق مناسب
  elevation: 6,               // أندرويد
  shadowColor: '#2e7d32',    // لون ظل أخضر هادي (يتناسب مع الثيم)
  shadowOpacity: 0.15,
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 12,

  // إضافة حدود خفيفة عشان يبرز الكارد
  borderWidth: 1,
  borderColor: '#a5d6a7',    // أخضر فاتح شفاف

  // تأثير رفع بسيط عند اللمس (optional)
  // ممكن تضيف تأثير animated لما تضغط عليه
},

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  volunteerPoints: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 2,
  },
  volunteerPeriod: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  noVolunteers: {
    textAlign: 'center',
    fontSize: 16,
    color: '#dc2626',
    marginTop: 20,
  },
});

export default HonorBoard;
