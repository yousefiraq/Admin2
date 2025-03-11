import { db, collection, addDoc, serverTimestamp } from "./firebase-config.js";

// إدارة الوضع الداكن
document.getElementById("darkModeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

window.addEventListener('load', () => {
    if (localStorage.getItem("darkMode") === 'true') {
        document.body.classList.add("dark-mode");
    }
});

// تهيئة HERE Maps
const platform = new H.service.Platform({
    apikey: "7kAhoWptjUW7A_sSWh3K2qaZ6Lzi4q3xaDRYwFWnCbE"
});

// وظائف الخرائط
window.showOrderMap = (lat, lng) => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        return alert("الإحداثيات غير صالحة!");
    }
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 70vh;
        background: white;
        z-index: 1000;
        border-radius: 15px;
        box-shadow: 0 0 25px rgba(0,0,0,0.2);
        overflow: hidden;
    `;

    modal.innerHTML = `
        <div id="mapContainer" style="height: 100%; width: 100%;"></div>
        <button 
            onclick="this.parentElement.remove()" 
            class="close-map-btn"
        >
            ✕ إغلاق
        </button>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        const defaultLayers = platform.createDefaultLayers();
        const map = new H.Map(
            document.getElementById('mapContainer'),
            defaultLayers.vector.normal.map,
            { 
                center: { lat: parseFloat(lat), lng: parseFloat(lng) }, 
                zoom: 15,
                pixelRatio: window.devicePixelRatio || 1 
            }
        );

        new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        H.ui.UI.createDefault(map, defaultLayers);
        new H.map.Marker({ lat: parseFloat(lat), lng: parseFloat(lng) }).addTo(map);
    }, 100);
};

window.openGoogleMaps = (lat, lng) => {
    if (!lat || !lng) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
};

window.openWaze = (lat, lng) => {
    if (!lat || !lng) return;
    window.open(`https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
};

// إضافة طلب جديد
window.addOrder = async () => {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        await addDoc(collection(db, "orders"), {
            name: `عميل ${Math.floor(Math.random() * 1000)}`,
            phone: `077${Math.floor(1000000 + Math.random() * 9000000)}`,
            province: ["بغداد", "البصرة", "نينوى"][Math.floor(Math.random() * 3)],
            pipes: Math.floor(1 + Math.random() * 5),
            orderDate: serverTimestamp(),
            status: "قيد الانتظار",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
        
        alert("تمت الإضافة بنجاح!");
        window.location.reload();
    } catch (error) {
        console.error("خطأ:", error);
        alert(error.message.includes("geolocation") ? "يجب تفعيل صلاحيات الموقع!" : "فشل في الإضافة!");
    }
};
