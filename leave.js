// ===================== TIMER LOGIC =====================
    const activationDate = new Date("2025-12-01T14:30:00+05:00"); // Maldives time
    const countdownSection = document.getElementById("countdownSection");
    const formSection = document.getElementById("formSection");
    const timerDisplay = document.getElementById("timer");

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = activationDate - now;

      if (distance <= 0) {
        countdownSection.classList.add("hidden");
        formSection.classList.remove("hidden");
        clearInterval(timerInterval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      timerDisplay.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    const timerInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Run immediately once

    // ===================== FORM LOGIC =====================
    document.getElementById("leaveForm").addEventListener("submit", async function(e) {
      e.preventDefault();

      const name = document.getElementById("staffName").value.trim();
      const rcNo = document.getElementById("rcNo").value.trim();

      const periods = [];
      for (let i = 1; i <= 3; i++) {
        const from = document.getElementById("from" + i).value;
        const to = document.getElementById("to" + i).value;
        if (from && to) periods.push({ from, to });
      }

      if (!name || !rcNo || periods.length === 0) {
        alert("Please fill staff info and at least one leave period.");
        return;
      }

      const refNo = "LV-" + Date.now().toString().slice(-6);
      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString();

      const leaveData = {
        staffName: name,
        rcNo: rcNo,
        leavePeriods: periods,
        referenceNo: refNo,
        submitDate: date,
        submitTime: time,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        year: 2026
      };

      try {
        // Use the initialized cardDb from fireleave.js
        await cardDb.collection("LeavePlans2026").add(leaveData);
        const messageDiv = document.getElementById("message");
        messageDiv.innerHTML = `
          <div class="success">
            ✅ Leave Plan submitted successfully!<br>
            <div class="reference-info">Reference No: <b>${refNo}</b></div>
            <div class="reference-info">Submitted on: ${date} at ${time}</div>
          </div>
        `;
        document.getElementById("leaveForm").reset();
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth' });
        
        // Clear message after 10 seconds
        setTimeout(() => {
          messageDiv.innerHTML = '';
        }, 10000);
      } catch (error) {
        console.error("Error saving to Firestore:", error);
        document.getElementById("message").innerHTML = `
          <div class="error">
            ❌ Error saving data: ${error.message}
          </div>
        `;
      }
    });

    // Set date range for 2026
    const start2026 = new Date('2026-01-01').toISOString().split('T')[0];
    const end2026 = new Date('2026-12-31').toISOString().split('T')[0];
    
    for (let i = 1; i <= 3; i++) {
      document.getElementById('from' + i).min = start2026;
      document.getElementById('from' + i).max = end2026;
      document.getElementById('to' + i).min = start2026;
      document.getElementById('to' + i).max = end2026;
    }

    // Add date validation to ensure "to" date is after "from" date
    for (let i = 1; i <= 3; i++) {
      const fromInput = document.getElementById('from' + i);
      const toInput = document.getElementById('to' + i);
      
      fromInput.addEventListener('change', function() {
        toInput.min = this.value;
        if (toInput.value && toInput.value < this.value) {
          toInput.value = this.value;
        }
      });
    }

    // Add input validation for RC Number (alphanumeric only)
    document.getElementById('rcNo').addEventListener('input', function(e) {
      this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
    });


