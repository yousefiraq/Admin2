import { db, collection, addDoc, serverTimestamp } from "./firebase-config.js";

document.getElementById("darkModeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

window.addEventListener('load', () => {
    if (localStorage.getItem("darkMode") === 'true') {
        document.body.classList.add("dark-mode");
    }
});

// دالة فتح Google Maps
window.openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
};

// دالة فتح Waze
window.openWaze = (lat, lng) => {
    window.open(`https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
};

// دالة إضافة طلب (مثال)
async function addOrder() {
    try {
        await addDoc(collection(db, "orders"), {
            name: "مثال",
            phone: "07701234567",
            province: "بغداد",
            pipes: 2,
            orderDate: serverTimestamp(),
            status: "قيد الانتظار",
            latitude: 33.3152, // تأكد من إضافة الإحداثيات
            longitude: 44.3661
        });
        alert("تم إضافة الطلب!");
    } catch (error) {
        console.error("خطأ في الإضافة:", error);
        alert("فشل في الإضافة!");
    }
}
