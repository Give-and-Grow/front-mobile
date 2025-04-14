import * as Location from 'expo-location';

export const getUserLocation = async (setUserLocation) => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('إذن الوصول للموقع مرفوض.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    console.log('Latitude:', location.coords.latitude);
    console.log('Longitude:', location.coords.longitude);
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  } catch (error) {
    console.error('خطأ في الحصول على الموقع:', error);
  }
};
