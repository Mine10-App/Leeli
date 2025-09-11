firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Elements
const staffSelect = document.getElementById("StaffName");
const rcInput = document.getElementById("RcNo");
const leaveSelect = document.getElementById("LType");
const reasonSelect = document.getElementById("Reason");
const dutyInput = document.getElementById("DutyTime");
const form = document.getElementById("leaveForm");
const reportList = document.getElementById("reportList");

// Wait until `users` exists
function initDropdown(){
  if(typeof users === "undefined"){
    console.error("Users array not loaded from aqj.js yet");
    setTimeout(initDropdown, 100);  // Retry after 100ms
    return;
  }
  // Populate staff dropdown
  users.forEach(u=>{
    const opt = document.createElement("option");
    opt.value = u.name;
    opt.textContent = u.name;
    staffSelect.appendChild(opt);
  });
}

initDropdown();

// Auto-fill RC No
staffSelect.addEventListener("change", ()=>{
  const selectedStaff = users.find(u=>u.name===staffSelect.value);
  rcInput.value = selectedStaff ? selectedStaff.rcNo : "";
});

// Reason options
const sickReasons = [...]; // same as before
const frlReasons = [...];  // same as before

leaveSelect.addEventListener("change", ()=>{
  reasonSelect.innerHTML = '<option value="">--Select Reason--</option>';
  let reasons = [];
  if(leaveSelect.value === "Sick Leave") reasons = sickReasons;
  else if(leaveSelect.value === "FRL") reasons = frlReasons;
  reasons.forEach(r=>{
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    reasonSelect.appendChild(opt);
  });
});

// Submit leave
form.addEventListener("submit", async e=>{
  e.preventDefault();
  const staffName = staffSelect.value;
  const staffObj = users.find(u=>u.name===staffName);
  const leaveVal = leaveSelect.value;
  const reasonVal = reasonSelect.value;
  const dutyVal = dutyInput.value;
  if(!staffName || !leaveVal || !reasonVal || !dutyVal) return;

  const now = new Date();
  const submitTime = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

  try{
    await db.collection("leave_entries").add({
      date: now.toISOString().split("T")[0],
      staff: staffName,
      rcNo: staffObj.rcNo,
      leave: leaveVal,
      reason: reasonVal,
      duty: dutyVal,
      submitTime: submitTime,
      status: "pending",
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    form.reset();
  }catch(err){ console.error(err); }
});

// Load today's leaves
function loadReports(){
  const today = new Date().toISOString().split("T")[0];
  db.collection("leave_entries")
    .where("date","==",today)
    .orderBy("timestamp","desc")
    .onSnapshot(snapshot=>{
      reportList.innerHTML = "";
      if(snapshot.empty){
        reportList.innerHTML = "<tr><td colspan='8'>No entries for today</td></tr>";
        return;
      }
      snapshot.forEach(docSnap=>{
        const d = docSnap.data();
        const status = d.status || "pending";
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="staff-col">${d.staff}</td>
          <td>${d.rcNo}</td>
          <td>${d.leave}</td>
          <td class="reason-col">${d.reason}</td>
          <td>${d.duty}</td>
          <td class="submit-col">${d.submitTime || "-"}</td>
          <td>${status}</td>
          <td>
            <button class="apply-btn ${status==='applied'?'applied':''}" ${status==='applied'?'disabled':''}>Apply</button>
            <button class="delete-btn">Delete</button>
          </td>
        `;

        row.querySelector(".apply-btn").onclick = async ()=>{
          if(status!=="applied"){
            await db.collection("leave_entries").doc(docSnap.id).update({ status:"applied" });
          }
        };

        row.querySelector(".delete-btn").onclick = async ()=>{
          if(confirm("Delete this entry?")){
            await db.collection("leave_entries").doc(docSnap.id).delete();
          }
        };

        reportList.appendChild(row);
      });
    });
}

loadReports();
