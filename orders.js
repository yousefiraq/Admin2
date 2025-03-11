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

// عرض الخريطة
window.showOrderMap = (lat, lng) => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        return alert("الإحداثيات غير متوفرة لهذا الطلب!");
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
            style="
                position: absolute;
                top: 15px;
                left: 15px;
                padding: 8px 15px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                z-index: 1001;
            "
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

        const marker = new H.map.Marker({ lat: parseFloat(lat), lng: parseFloat(lng) });
        map.addObject(marker);
        new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        H.ui.UI.createDefault(map, defaultLayers);
    }, 100);
};

// فتح خرائط Google
window.openGoogleMaps = (lat, lng) => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
};

// فتح Waze
window.openWaze = (lat, lng) => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
    window.open(`https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
};

// إضافة طلب مع تحديد الموقع
async function addOrder() {
    try {
        navigator.geolocation.getCurrentPosition(async (position) => {
            await addDoc(collection(db, "orders"), {
                name: "مثال",
                phone: "07701234567",
                province: "بغداد",
                pipes: 2,
                orderDate: serverTimestamp(),
                status: "قيد الانتظار",
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
            alert("تم إضافة الطلب!");
        }, (error) => {
            alert("فشل في الحصول على الموقع! تأكد من السماح بصلاحيات الموقع");
        });
    } catch (error) {
        console.error("خطأ في الإضافة:", error);
        alert("فشل في الإضافة!");
    }
}
