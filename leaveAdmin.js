<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Leave Admin Entry</title>
<style>
body { font-family: Arial, sans-serif; margin:0; padding:20px; background:#eef2f7; }
.container { display:flex; gap:20px; }
.entry-container { flex:1; background:#fff; padding:15px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); }
.report-container { flex:2; background:#fff; padding:15px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); overflow-x:auto; }

form .form-row { display:flex; align-items:center; margin-bottom:10px; }
form label { width:100px; font-weight:bold; margin-right:10px; }
form input, form select { flex:1; padding:6px; border-radius:4px; border:1px solid #ccc; }
form input[type="submit"] { background:#007bff; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; width:100%; }
form input[type="submit"]:hover { background:#0056b3; }

table { width:100%; border-collapse:collapse; margin-top:10px; }
th, td { border:1px solid #ccc; padding:6px; text-align:center; font-size:13px; }
th { background:#007bff; color:white; }
.staff-col { min-width:120px; }
.reason-col { min-width:180px; }
.submit-col { min-width:80px; }
.apply-btn { background:#28a745; color:white; border:none; padding:3px 6px; border-radius:3px; cursor:pointer; }
.apply-btn.applied { background:gray; cursor:default; }
.delete-btn { background:red; color:white; border:none; padding:3px 6px; border-radius:3px; cursor:pointer; }
</style>
</head>
<body>

<div class="container">
  <!-- Entry Form -->
  <div class="entry-container">
    <h2>Leave Entry</h2>
    <form id="leaveForm">
      <div class="form-row">
        <label for="StaffName">Staff:</label>
        <select id="StaffName" required><option value="">--Select Staff--</option></select>
      </div>
      <div class="form-row">
        <label for="RcNo">RC No:</label>
        <input type="text" id="RcNo" readonly>
      </div>
      <div class="form-row">
        <label for="LType">Leave Type:</label>
        <select id="LType" required>
          <option value="">--Select--</option>
          <option value="Sick Leave">Sick Leave</option>
          <option value="FRL">FRL</option>
          <option value="Absent">Absent</option>
        </select>
      </div>
      <div class="form-row">
        <label for="Reason">Reason:</label>
        <select id="Reason" required><option value="">--Select Reason--</option></select>
      </div>
      <div class="form-row">
        <label for="DutyTime">Duty Time:</label>
        <input type="time" id="DutyTime" required>
      </div>
      <input type="submit" value="Add Leave">
    </form>
  </div>

  <!-- Report -->
  <div class="report-container">
    <h2>Today's Leaves</h2>
    <table>
      <thead>
        <tr>
          <th class="staff-col">Staff</th>
          <th>RC No</th>
          <th>Leave</th>
          <th class="reason-col">Reason</th>
          <th>Duty</th>
          <th class="submit-col">Submitted</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="reportList">
        <tr><td colspan="8">Loading...</td></tr>
      </tbody>
    </table>
  </div>
</div>

<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="sca.js"></script>
<script src="aqj.js"></script> 

<script>
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

// Populate staff dropdown from aqj.js
if(typeof users !== "undefined"){
  users.forEach(u=>{
    const opt = document.createElement("option");
    opt.value = u.name;
    opt.textContent = u.name;
    staffSelect.appendChild(opt);
  });
}

// Auto-fill RC No
staffSelect.addEventListener("change", ()=>{
  const selectedStaff = users.find(u=>u.name===staffSelect.value);
  rcInput.value = selectedStaff ? selectedStaff.rcNo : "";
});

// Reason options
const sickReasons = ["Abdominal pain","Accident Injuries","Allergic","Anxiety","Arthritis","Asthma","Arm Pain","Back Pain","Body Pain","Leg Pain","Ear Pain","Bacterial Conjunctivitis","Common Cold / Flu and Fever","Dental issue","Depression","Dizziness","Dirrhea","Eye Infection","Fatigue","Gastric","Headache","Hernia","Infection","Joint Pain","Medical Appointments","Menstrual Pain","Migraines","Minor surgery","Muscle Pain","Pharyngitis","Physical injuries","Senile Cataract","Spasrnodic Torticollis","Stomach upset","Tonsillitis","URTI","Viral Conjunctivitis"];
const frlReasons = ["Moving to a new House","To attend a family event","To take family to and from Island","Urgent work at home","Baby sitting","Parent-Teacher meeting","House Renovation","Family member sick/admitted","Court appearance","To attend a funeral"];

leaveSelect.addEventListener("change", ()=>{
  reasonSelect.innerHTML = '<option value="">--Select Reason--</option>';
  let reasons = [];
  if(leaveSelect.value==="Sick Leave") reasons = sickReasons;
  else if(leaveSelect.value==="FRL") reasons = frlReasons;
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
  const submitTime = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});

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
    rcInput.value = "";
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
</script>

</body>
</html>
