import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';

const CertificateScreen = ({ route }) => {
  const { applicationId } = route.params;
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('userToken');
      setToken(storedToken);
    };
    loadToken();
  }, []);

  if (!token) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  const url = `${ipAdd}:5000/certificates/download-certificate/${applicationId}`;

  return (
    <WebView
      source={{
        uri: url,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }}
      startInLoadingState={true}
      renderLoading={() => (
        <ActivityIndicator size="large" color="#2e7d32" style={{ flex: 1 }} />
      )}
      style={{ flex: 1 }}
    />
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CertificateScreen;
