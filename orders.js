import { db, collection, getDocs, updateDoc, doc, deleteDoc, getDoc } from "./firebase-config.js";

// البحث الديناميكي
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#ordersTable tr').forEach(row => {
        row.style.display = row.cells[0].textContent.toLowerCase().includes(term) ? '' : 'none';
    });
});

// جلب البيانات
const fetchOrders = async () => {
    try {
        const snapshot = await getDocs(collection(db, "orders"));
        const orders = [];
        let counters = { total: 0, pending: 0, delivered: 0, canceled: 0 };
        
        snapshot.forEach(doc => {
            const data = doc.data();
            orders.push({ id: doc.id, ...data });
            counters.total++;
            counters[data.status === 'تم التوصيل' ? 'delivered' : data.status === 'ملغى' ? 'canceled' : 'pending']++;
        });

        updateUI(orders, counters);
    } catch (error) {
        alert("فشل في جلب البيانات: " + error.message);
    }
};

// تحديث الواجهة
const updateUI = (orders, counters) => {
    document.getElementById('ordersTable').innerHTML = orders.map(order => `
        <tr>
            <td>${order.name}</td>
            <td>${order.phone}</td>
            <td>${order.province}</td>
            <td>${order.pipes}</td>
            <td>
                <select class="status-select" data-id="${order.id}">
                    ${['قيد الانتظار', 'تم التوصيل', 'ملغى'].map(status => `
                        <option ${order.status === status ? 'selected' : ''}>${status}</option>
                    `).join('')}
                </select>
            </td>
            <td>
                <div class="map-actions">
                    <button onclick="showOrderMap(${order.latitude},${order.longitude})" class="map-btn">
                        🌍 عرض الخريطة
                    </button>
                    <button onclick="openGoogleMaps(${order.latitude},${order.longitude})" class="google-btn">
                        🗺️ جوجل ماب
                    </button>
                    <button onclick="openWaze(${order.latitude},${order.longitude})" class="waze-btn">
                        🚗 وايز
                    </button>
                </div>
            </td>
            <td>${new Date(order.orderDate?.toDate()).toLocaleDateString('ar-EG')}</td>
            <td>
                <button onclick="editOrder('${order.id}')" class="edit-btn">✏️ تعديل</button>
                <button onclick="deleteOrder('${order.id}')" class="delete-btn">🗑️ حذف</button>
            </td>
        </tr>
    `).join('');

    // تحديث العدادات
    Object.entries(counters).forEach(([key, value]) => {
        document.getElementById(`${key}Orders`).textContent = value;
    });

    // إضافة Event Listeners
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            await updateDoc(doc(db, "orders", e.target.dataset.id), { status: e.target.value });
            fetchOrders();
        });
    });
};

// وظائف CRUD
window.deleteOrder = async (id) => {
    if (!confirm("تأكيد الحذف؟")) return;
    await deleteDoc(doc(db, "orders", id));
    fetchOrders();
};

window.editOrder = async (id) => {
    const docSnap = await getDoc(doc(db, "orders", id));
    const data = docSnap.data();
    
    const newData = {
        name: prompt("الاسم:", data.name),
        phone: prompt("الهاتف:", data.phone),
        province: prompt("المحافظة:", data.province),
        pipes: prompt("العدد:", data.pipes)
    };

    if (Object.values(newData).every(Boolean)) {
        await updateDoc(doc(db, "orders", id), newData);
        fetchOrders();
    }
};

// التحميل الأولي
window.onload = fetchOrders;
