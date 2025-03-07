import { db, collection, getDocs, deleteDoc, doc } from "./firebase-config.js";

async function fetchOrders() {
    let tableBody = document.getElementById("ordersTable");
    tableBody.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        querySnapshot.forEach((docSnap) => {
            let data = docSnap.data();
            let row = document.createElement("tr");

            row.innerHTML = `
                <td>${data.name}</td>
                <td>${data.phone}</td>
                <td>${data.address}</td>
                <td>${data.status}</td>
                <td><button onclick="deleteOrder('${docSnap.id}')">حذف</button></td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("خطأ في جلب الطلبات:", error);
    }
}

async function deleteOrder(orderId) {
    if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
        try {
            await deleteDoc(doc(db, "orders", orderId));
            alert("تم حذف الطلب بنجاح!");
            fetchOrders(); // تحديث الجدول بعد الحذف
        } catch (error) {
            console.error("خطأ في حذف الطلب:", error);
        }
    }
}

window.onload = fetchOrders;
