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
  const recordCount = document.getElementById("recordCount");

  const filterDate = document.getElementById("filterDate");
  const filterName = document.getElementById("filterName");
  const filterRC = document.getElementById("filterRC");
  const filterStatus = document.getElementById("filterStatus");
  const filterReason = document.getElementById("filterReason");

  // Modal elements
  const commentModal = document.getElementById("commentModal");
  const commentText = document.getElementById("commentText");
  const commentHistory = document.getElementById("commentHistory");
  const saveComment = document.getElementById("saveComment");
  const cancelComment = document.getElementById("cancelComment");
  const closeModal = document.querySelector('.close-modal');

  let currentCommentDocId = null;
  let currentFilters = {};

  // Get reason badge class
  function getReasonClass(reason) {
    switch(reason) {
      case 'Sick Leave': return 'reason-sick-leave';
      case 'No Out Card': return 'reason-no-out-card';
      case 'Duty Change': return 'reason-duty-change';
      case 'Personal Leave': return 'reason-personal';
      case 'Training': return 'reason-training';
      default: return 'reason-other';
    }
  }

  // Get status badge class
  function getStatusClass(status) {
    switch(status) {
      case 'Pending': return 'status-pending';
      case 'Applied': return 'status-applied';
      case 'Sent to HR': return 'status-sent-hr';
      case 'Action Required': return 'status-action-required';
      default: return 'status-pending';
    }
  }

  // Open comment modal
  function openCommentModal(docId) {
    currentCommentDocId = docId;
    
    // Clear comment text
    commentText.value = '';
    
    // Load and display comment history
    loadCommentHistory(docId);
    
    commentModal.style.display = 'flex';
  }

  // Load comment history
  async function loadCommentHistory(docId) {
    try {
      const doc = await db.doc(docId).get();
      const data = doc.data();
      
      commentHistory.innerHTML = '<h4>Comment History</h4>';
      
      if (!data.userComments || data.userComments.length === 0) {
        commentHistory.innerHTML += '<p>No comments yet.</p>';
        return;
      }
      
      data.userComments.forEach(comment => {
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';
        commentItem.innerHTML = `
          <div><strong>${comment.user || 'User'}:</strong> ${comment.text}</div>
          <div class="comment-date">${new Date(comment.timestamp).toLocaleString()}</div>
        `;
        commentHistory.appendChild(commentItem);
      });
    } catch (error) {
      console.error('Error loading comments:', error);
      commentHistory.innerHTML = '<p>Error loading comments</p>';
    }
  }

  // Close comment modal
  function closeCommentModal() {
    commentModal.style.display = 'none';
    currentCommentDocId = null;
  }

  // Save comment
  saveComment.addEventListener('click', async function() {
    if (currentCommentDocId) {
      const newComment = commentText.value.trim();
      
      if (newComment) {
        try {
          const doc = await db.doc(currentCommentDocId).get();
          const currentData = doc.data();
          
          // Initialize userComments array if it doesn't exist
          const userComments = currentData.userComments || [];
          
          // Add new comment
          userComments.push({
            text: newComment,
            timestamp: new Date().toISOString(),
            user: "Current User" // In real app, this would be the logged in user
          });
          
          // Update the document
          await db.doc(currentCommentDocId).update({
            userComments: userComments
          });
          
          // If comment contains keywords, update status
          if (newComment.toLowerCase().includes('mc needed') || 
              newComment.toLowerCase().includes('document') ||
              newComment.toLowerCase().includes('action required')) {
            await db.doc(currentCommentDocId).update({
              status: 'Action Required'
            });
          }
          
          alert('✅ Comment added successfully');
          loadRecords(currentFilters);
          closeCommentModal();
        } catch (error) {
          console.error('Error saving comment:', error);
          alert('❌ Error saving comment');
        }
      } else {
        alert('Please enter a comment before saving.');
      }
    }
  });

  // Cancel comment
  cancelComment.addEventListener('click', closeCommentModal);
  closeModal.addEventListener('click', closeCommentModal);

  async function loadRecords(filters = {}) {
    tableBody.innerHTML = `<tr><td colspan='7' class="empty-state"><i class="fas fa-inbox"></i><p>⏳ Loading records...</p></td></tr>`;
    try {
      // Get ALL records first (since Firebase doesn't support partial text search)
      const snapshot = await db.get();
      console.log(`📄 Found ${snapshot.size} records total`);

      if (snapshot.empty) {
        tableBody.innerHTML = `<tr><td colspan='7' class="empty-state"><i class="fas fa-inbox"></i><p>No adjustment records found</p></td></tr>`;
        recordCount.textContent = '(0 records)';
        return;
      }

      // Filter records client-side for partial matching
      let filteredDocs = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        let matches = true;

        // Apply filters
        if (filters.name) {
          const name = (d.name || d.Name || "").toLowerCase();
          if (!name.includes(filters.name.toLowerCase())) {
            matches = false;
          }
        }

        if (filters.rcno && matches) {
          const rcno = (d.rcno || d.RCNo || "").toLowerCase();
          if (!rcno.includes(filters.rcno.toLowerCase())) {
            matches = false;
          }
        }

        if (filters.date && matches) {
          const date = d.date || d.Date || "";
          if (date !== filters.date) {
            matches = false;
          }
        }

        if (filters.status && matches) {
          const status = d.status || d.Status || "Pending";
          if (status !== filters.status) {
            matches = false;
          }
        }

        if (filters.reason && matches) {
          const reason = d.reason || d.Reason || "";
          if (reason !== filters.reason) {
            matches = false;
          }
        }

        if (matches) {
          filteredDocs.push({ id: doc.id, data: d });
        }
      });

      console.log(`📄 Displaying ${filteredDocs.length} filtered records`);

      if (filteredDocs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan='7' class="empty-state"><i class="fas fa-inbox"></i><p>No adjustment records found</p></td></tr>`;
        recordCount.textContent = '(0 records)';
        return;
      }

      // Update record count
      recordCount.textContent = `(${filteredDocs.length} records)`;

      // Render table
      tableBody.innerHTML = "";
      filteredDocs.forEach(({ id, data: d }) => {
        const name = d.name || d.Name || "";
        const rcno = d.rcno || d.RCNo || "";
        const date = d.date || d.Date || "";
        const reason = d.reason || d.Reason || "";
        const remarks = d.remarks || d.Remarks || "";
        const status = d.status || d.Status || "Pending";

        // Determine which buttons to show based on status
        let actionButtons = '';
        
        if (status === 'Pending') {
          actionButtons = `
            <button class="action-btn action-apply" data-id="${id}">
              <i class="fas fa-check"></i> Apply
            </button>
            <button class="action-btn action-send-hr" data-id="${id}">
              <i class="fas fa-paper-plane"></i> Send to HR
            </button>
          `;
        } else if (status === 'Applied') {
          actionButtons = `
            <button class="action-btn action-apply" data-id="${id}" style="opacity: 0.6; cursor: not-allowed;">
              <i class="fas fa-check"></i> Applied
            </button>
          `;
        } else if (status === 'Sent to HR') {
          actionButtons = `
            <button class="action-btn action-apply" data-id="${id}">
              <i class="fas fa-check"></i> Apply
            </button>
            <button class="action-btn action-sent-hr" data-id="${id}">
              <i class="fas fa-paper-plane"></i> Sent to HR
            </button>
          `;
        } else if (status === 'Action Required') {
          actionButtons = `
            <button class="action-btn action-apply" data-id="${id}">
              <i class="fas fa-check"></i> Apply
            </button>
            <button class="action-btn action-send-hr" data-id="${id}">
              <i class="fas fa-paper-plane"></i> Send to HR
            </button>
          `;
        }

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${name}</td>
          <td>${rcno}</td>
          <td>${date}</td>
          <td>
            <span class="reason-badge ${getReasonClass(reason)}">
              ${reason}
            </span>
          </td>
          <td>${remarks}</td>
          <td>
            <span class="status-badge ${getStatusClass(status)}">
              ${status}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
              ${actionButtons}
              <button class="action-btn action-comment" data-id="${id}">
                <i class="fas fa-comment"></i> Comment
              </button>
            </div>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // Attach button handlers
      document.querySelectorAll(".action-apply").forEach(btn => {
        if (!btn.style.opacity) { // Only add listener if not disabled
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (confirm('Are you sure you want to mark this request as applied?')) {
              await db.doc(id).update({ status: "Applied" });
              alert("✅ Status updated to Applied");
              loadRecords(filters);
            }
          });
        }
      });

      document.querySelectorAll(".action-send-hr").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          if (confirm('Are you sure you want to send this request to HR for processing?')) {
            await db.doc(id).update({ status: "Sent to HR" });
            alert("📤 Record sent to HR");
            loadRecords(filters);
          }
        });
      });

      document.querySelectorAll(".action-comment").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          openCommentModal(id);
        });
      });

      // Update statistics
      updateStats(filteredDocs);

    } catch (err) {
      console.error("❌ Error loading records:", err);
      tableBody.innerHTML = `<tr><td colspan='7' class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading records — check console</p></td></tr>`;
    }
  }

  // Update statistics
  function updateStats(records) {
    const totalRequests = document.getElementById('totalRequests');
    const pendingRequests = document.getElementById('pendingRequests');
    const appliedRequests = document.getElementById('appliedRequests');
    const sentHrRequests = document.getElementById('sentHrRequests');

    if (totalRequests) totalRequests.textContent = records.length;
    if (pendingRequests) pendingRequests.textContent = records.filter(r => {
      const status = r.data.status || r.data.Status || "Pending";
      return status === "Pending" || status === "Action Required";
    }).length;
    if (appliedRequests) appliedRequests.textContent = records.filter(r => {
      const status = r.data.status || r.data.Status || "Pending";
      return status === "Applied";
    }).length;
    if (sentHrRequests) sentHrRequests.textContent = records.filter(r => {
      const status = r.data.status || r.data.Status || "Pending";
      return status === "Sent to HR";
    }).length;
  }

  // Initial load
  loadRecords();

  // Filter handler
  btnFilter.addEventListener("click", () => {
    currentFilters = {
      name: filterName.value.trim(),
      rcno: filterRC.value.trim(),
      date: filterDate.value.trim(),
      status: filterStatus.value,
      reason: filterReason.value
    };
    loadRecords(currentFilters);
  });

  btnReset.addEventListener("click", () => {
    filterName.value = "";
    filterRC.value = "";
    filterDate.value = "";
    filterStatus.value = "";
    filterReason.value = "";
    currentFilters = {};
    loadRecords();
  });
});
