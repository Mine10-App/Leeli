// view.js
window.addEventListener("DOMContentLoaded", async () => {
  console.log("🟢 Viewer Page Loaded");

  if (!window.cardDb) {
    alert("❌ Firebase is not initialized. Check fireatt.js and ensure it's loaded before this file.");
    return;
  }

  const db = window.cardDb.collection("AttendanceAdjustments");
  const tableBody = document.getElementById("adjustmentBody");
  const btnFilter = document.getElementById("btnFilter");
  const btnReset = document.getElementById("btnReset");

  const filterDate = document.getElementById("filterDate");
  const filterName = document.getElementById("filterName");
  const filterRC = document.getElementById("filterRC");

  async function loadRecords(filters = {}) {
    tableBody.innerHTML = `<tr><td colspan='7'>⏳ Loading records...</td></tr>`;
    try {
      let query = db;

      // Optional filters
      if (filters.name) query = query.where("name", "==", filters.name);
      if (filters.rcno) query = query.where("rcno", "==", filters.rcno);
      if (filters.date) query = query.where("date", "==", filters.date);

      const snapshot = await query.get();
      console.log(`📄 Found ${snapshot.size} records`);

      if (snapshot.empty) {
        tableBody.innerHTML = "<tr><td colspan='7'>No records found.</td></tr>";
        return;
      }

      tableBody.innerHTML = "";
      snapshot.forEach(doc => {
        const d = doc.data();
        console.log("📄 Doc:", doc.id, d);

        // Support lowercase and uppercase field names
        const name = d.name || d.Name || "";
        const rcno = d.rcno || d.RCNo || "";
        const date = d.date || d.Date || "";
        const reason = d.reason || d.Reason || "";
        const remarks = d.remarks || d.Remarks || "";
        const status = d.status || d.Status || "Pending";

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${name}</td>
          <td>${rcno}</td>
          <td>${date}</td>
          <td>${reason}</td>
          <td>${remarks}</td>
          <td>${status}</td>
          <td>
            ${status !== "Applied"
              ? `<button data-id="${doc.id}" class="apply-btn">Mark Applied</button>`
              : ""}
          </td>
        `;
        tableBody.appendChild(row);
      });

      // Attach update buttons
      document.querySelectorAll(".apply-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          await db.doc(id).update({ status: "Applied" });
          alert("✅ Status updated to Applied");
          loadRecords(filters);
        });
      });

    } catch (err) {
      console.error("❌ Error loading records:", err);
      tableBody.innerHTML = `<tr><td colspan='7' style='color:red;'>Error loading records — check console</td></tr>`;
    }
  }

  // Initial load
  loadRecords();

  // Filter handler
  btnFilter.addEventListener("click", () => {
    const filters = {
      name: filterName.value.trim(),
      rcno: filterRC.value.trim(),
      date: filterDate.value.trim()
    };
    loadRecords(filters);
  });

  btnReset.addEventListener("click", () => {
    filterName.value = "";
    filterRC.value = "";
    filterDate.value = "";
    loadRecords();
  });
});
