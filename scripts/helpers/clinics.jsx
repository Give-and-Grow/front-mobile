import axios from 'axios';

const getClinicsNearby = async (latitude, longitude) => {
  const apiKey = 'AIzaSyCPQIzwoidOaofrvaR23jmpQ7nvznvd2gg'; // استبدل YOUR_GOOGLE_API_KEY بمفتاحك
  const radius = 20000; // نطاق البحث 10 كم
  const keyword = 'مستشفى'; // الكلمات المفتاحية باللغة العربية
  const language = 'ar'; // تحديد اللغة العربية للنتائج
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&language=${language}&key=${apiKey}`;
  console.log('Request URL:', url);

  try {
    const response = await axios.get(url);
    console.log('Response:', response.data); // تحقق من البيانات القادمة
    return response.data.results.map((clinic) => ({
      name: clinic.name,
      address: clinic.vicinity,
      latitude: clinic.geometry.location.lat,
      longitude: clinic.geometry.location.lng,
    }));
  } catch (error) {
    console.error('خطأ في جلب العيادات:', error);
    return [];
  }
};

export { getClinicsNearby };
