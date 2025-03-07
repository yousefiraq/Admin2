import { db, collection, addDoc } from "./firebase-config.js";

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            document.getElementById("location").value = `${lat}, ${lng}`;
        }, (error) => {
            alert("حدث خطأ في جلب الموقع: " + error.message);
        });
    } else {
        alert("المتصفح لا يدعم تحديد الموقع.");
    }
}

document.getElementById("orderForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    let name = document.getElementById("name").value;
    let phone = document.getElementById("phone").value;
    let address = document.getElementById("address").value;
    let location = document.getElementById("location").value;

    if (name && phone && address && location) {
        try {
            await addDoc(collection(db, "orders"), { name, phone, address, location, status: "قيد الانتظار" });
            alert("تم إرسال الطلب بنجاح!");
            document.getElementById("orderForm").reset();
        } catch (error) {
            console.error("خطأ في إرسال الطلب: ", error);
        }
    } else {
        alert("يرجى ملء جميع الحقول!");
    }
});
