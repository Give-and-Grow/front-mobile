import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import ipAdd from '../scripts/helpers/ipAddress';
const AdsScreen = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${ipAdd}:5000/admin/firebase-ads`);
      const data = await response.json();
      // فقط الإعلانات النشطة
      const activeAds = data.filter(ad => ad.is_active);
      setAds(activeAds);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAds();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.storeName}>{item.store_name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <TouchableOpacity
          style={styles.visitButton}
          onPress={() => Linking.openURL(item.website_url)}
        >
          <Text style={styles.visitButtonText}>Visit Website</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#66bb6a" />
        <Text>Loading ads...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={ads}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<Text style={styles.emptyText}>No active ads available.</Text>}
    />
  );
};
const styles = StyleSheet.create({
  listContainer: {
    padding: 20,
    backgroundColor: '#e8f5e9',  // أخضر فاتح جداً مريح للعين
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 7,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  image: {
    width: 200,
    height: 250,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  info: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2e7d32', // أخضر غامق
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '500',
  },
  visitButton: {
    backgroundColor: '#43a047', // أخضر متوسط لطيف
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: 'flex-start',
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  visitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 18,
    color: '#a5a5a5',
    fontWeight: '600',
  },
});


export default AdsScreen;
