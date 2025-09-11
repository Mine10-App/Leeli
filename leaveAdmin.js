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

// Populate staff dropdown from aqj.js users array
if(typeof users !== "undefined"){
  users.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.name;
    opt.textContent = u.name;
    staffSelect.appendChild(opt);
  });
}

// Auto-fill RC No when staff selected
staffSelect.addEventListener("change", ()=>{
  const selectedStaff = users.find(u => u.name === staffSelect.value);
  rcInput.value = selectedStaff ? selectedStaff.rcNo : "";
});

// Reason options
const sickReasons = ["Abdominal pain","Accident Injuries","Allergic","Anxiety","Arthritis","Asthma","Arm Pain","Back Pain","Body Pain","Leg Pain","Ear Pain","Bacterial Conjunctivitis","Common Cold / Flu and Fever","Dental issue","Depression","Dizziness","Dirrhea","Eye Infection","Fatigue","Gastric","Headache","Hernia","Infection","Joint Pain","Medical Appointments","Menstrual Pain","Migraines","Minor surgery","Muscle Pain","Pharyngitis","Physical injuries","Senile Cataract","Spasrnodic Torticollis","Stomach upset","Tonsillitis","URTI","Viral Conjunctivitis"];
const frlReasons = ["Moving to a new House","To attend a family event","To take family to and from Island","Urgent work at home","Baby sitting","Parent-Teacher meeting","House Renovation","Family member sick/admitted","Court appearance","To attend a funeral"];

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
  }catch(err){
    console.error("Error adding document:", err);
  }
});

// Load today's leaves
function loadReports(){
  const today = new Date().toISOString().split("T")[0];
  db.collection("leave_entries")
    .where("date","==",today)
    .orderBy("timestamp","desc")
    .onSnapshot(snapshot=>{
      reportList.innerHTML = "";
      snapshot.forEach(docSnap=>{
        const d = docSnap.data();
        const row = document.createElement("tr");
        const status = d.status || "pending";

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

        const applyBtn = row.querySelector(".apply-btn");
        const deleteBtn = row.querySelector(".delete-btn");

        applyBtn.onclick = async ()=>{
          if(status!=="applied"){
            await db.collection("leave_entries").doc(docSnap.id).update({ status:"applied" });
          }
        };

        deleteBtn.onclick = async ()=>{
          if(confirm("Delete this entry?")){
            await db.collection("leave_entries").doc(docSnap.id).delete();
          }
        };

        reportList.appendChild(row);
      });
    });
}

loadReports();
