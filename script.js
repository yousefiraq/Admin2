import { db, collection, addDoc } from "./firebase-config.js";

// تهيئة منصة HERE Maps
const platform = new H.service.Platform({
  apikey: "7kAhoWptjUW7A_sSWh3K2qaZ6Lzi4q3xaDRYwFWnCbE"
});

// متغيرات حالة التطبيق
let userLatitude = null;
let userLongitude = null;
let mapInitialized = false; // تتبع حالة الخريطة
let mapInstance = null; // حفظ نسخة الخريطة

// حدث تحديد الموقع الجغرافي
document.getElementById("getLocation").addEventListener("click", () => {
  if (userLatitude && userLongitude) {
    alert("لقد تم تحديد موقعك بالفعل!");
    if (!mapInitialized) {
      showMap(userLatitude, userLongitude);
      mapInitialized = true;
    }
    return;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLatitude = position.coords.latitude;
        userLongitude = position.coords.longitude;
        showMap(userLatitude, userLongitude);
        mapInitialized = true;
        alert("تم تحديد الموقع بنجاح!");
      },
      (error) => {
        alert("خطأ في تحديد الموقع: " + error.message);
      }
    );
  } else {
    alert("المتصفح لا يدعم خدمة الموقع الجغرافي.");
  }
});

// دالة عرض الخريطة مع التحسينات
function showMap(lat, lng) {
  const mapContainer = document.getElementById('map');
  
  // إعادة التعيين إذا كانت الخريطة موجودة
  if (mapInstance) {
    mapInstance.dispose();
    mapContainer.innerHTML = '';
  }

  // إنشاء خريطة جديدة
  const defaultLayers = platform.createDefaultLayers();
  mapInstance = new H.Map(
    mapContainer,
    defaultLayers.vector.normal.map,
    {
      center: { lat: lat, lng: lng },
      zoom: 14,
      pixelRatio: window.devicePixelRatio || 1
    }
  );

  // إضافة التفاعلات الأساسية
  const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(mapInstance));
  
  // إضافة علامة الموقع
  new H.map.Marker({ lat: lat, lng: lng }).addTo(mapInstance);
  
  // ضبط حجم الخريطة ديناميكيًا
  window.addEventListener('resize', () => mapInstance.getViewPort().resize());
}

// إرسال الطلب مع التحقق النهائي
document.getElementById("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!name || !phone || !address || !userLatitude || !userLongitude) {
    alert("الرجاء تعبئة جميع الحقول وتحديد الموقع!");
    return;
  }

  try {
    await addDoc(collection(db, "orders"), {
      name,
      phone,
      address,
      latitude: userLatitude,
      longitude: userLongitude,
      status: "قيد الانتظار",
      timestamp: new Date()
    });
    
    alert("تم إرسال الطلب بنجاح!");
    document.getElementById("orderForm").reset();
    userLatitude = null;
    userLongitude = null;
    mapInitialized = false;
    if (mapInstance) {
      mapInstance.dispose();
      document.getElementById('map').innerHTML = '';
    }
  } catch (error) {
    console.error("فشل في إرسال الطلب:", error);
    alert("حدث خطأ أثناء إرسال الطلب!");
  }
});
