// ==========================================
// CONFIGURATION & CREDENTIALS
// ==========================================
const voters = {
    'abdur rehman': '48291', 'asaad': '73915', 'muhammad bhai': '61047',
    'minhaj': '29584', 'aman hasnain': '84320', 'ghanat': '17496',
    'rahim': '56038', 'zia': '92741', 'aamish': '30865',
    'aryan': '69124', 'samama': '45790', 'abdullah': '81263',
    'hashir': '23589', 'momin': '70416', 'mureeb': '38952',
    'jahanzeb': '65193', 'bilawal': '92048', 'affan': '17864',
    'faiq': '53690', 'talha': '80427', 'ali': '26195',
    'khizar': '49713', 'uzair': '91560', 'sufyan': '37284',
    'hammad': '68409', 'ammad': '14976', 'mustafa': '75831',
    'rafay': '90352', 'moosa': '3316'
};

// ONLY 4 CANDIDATES NOW
const CANDIDATE_NAMES = { 
    'A': 'GHANAT', 
    'B': 'RAHIM', 
    'C': 'BILAWAL', 
    'D': 'ABDULLAH' 
};

const CANDIDATE_KEYS = ['A', 'B', 'C', 'D']; // Loop helper

const ADMIN = { u: 'syed muhammad moosa rizvi', p: '3316' };

// Storage Keys (New keys for the final 4-candidate setup to be fresh)
const K_VOTES = 'univ_final_v4';
const K_RECORDS = 'univ_final_r4';

// Global State
let votes = { A:0, B:0, C:0, D:0 };
let records = [];
let currentUser = null;

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Auto-load dashboards if present
    if(document.getElementById('votingSection')) updateResults();
    if(document.getElementById('adminPanel')) {
        if(sessionStorage.getItem('admOK') === 'true') showAdmin();
    }

    // Enable "Enter" key on passwords
    const passInput = document.getElementById('password');
    if(passInput) {
        passInput.addEventListener('keyup', (e) => { if(e.key === 'Enter') userLogin(); });
    }
    const adminPassInput = document.getElementById('admPass');
    if(adminPassInput) {
        adminPassInput.addEventListener('keyup', (e) => { if(e.key === 'Enter') adminLogin(); });
    }
});

function loadData() {
    const v = localStorage.getItem(K_VOTES);
    const r = localStorage.getItem(K_RECORDS);
    if(v) votes = JSON.parse(v);
    else votes = { A:0, B:0, C:0, D:0 }; // Ensure defaults
    
    if(r) records = JSON.parse(r);
    else records = [];
}

function saveData() {
    localStorage.setItem(K_VOTES, JSON.stringify(votes));
    localStorage.setItem(K_RECORDS, JSON.stringify(records));
}

// ==========================================
// VOTING LOGIC
// ==========================================
window.userLogin = function() {
    const u = document.getElementById('username').value.trim().toLowerCase();
    const p = document.getElementById('password').value;

    if(voters[u] && voters[u] === p) {
        currentUser = u;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('votingSection').classList.add('show');
        document.getElementById('userDisplay').innerText = u.toUpperCase();
        checkVoteStatus();
    } else {
        alert("Invalid Username or Password!");
    }
};

window.vote = function(cand) {
    if(!currentUser) return;
    
    // Update State
    votes[cand]++;
    records.push({
        id: Date.now(),
        voter: currentUser,
        candidate: cand,
        time: new Date().toLocaleString()
    });

    saveData();
    updateResults();
    checkVoteStatus();
};

window.checkVoteStatus = function() {
    // Check history for current user
    const rec = records.find(r => r.voter === currentUser);
    
    const msg = document.getElementById('voteStatus');
    const changeBtn = document.getElementById('changeBtn');
    const allButtons = document.querySelectorAll('.vote-btn-card');

    if(rec) {
        // ALREADY VOTED
        allButtons.forEach(btn => btn.disabled = true);
        changeBtn.style.display = 'inline-block';
        msg.innerHTML = `
            <div style="background:#d4edda; color:#155724; padding:15px; border-radius:10px; text-align:center; margin-bottom:20px; border:1px solid #c3e6cb;">
                ✅ <b>Vote Confirmed for ${CANDIDATE_NAMES[rec.candidate]}</b>
            </div>
        `;
    } else {
        // NOT VOTED
        allButtons.forEach(btn => btn.disabled = false);
        changeBtn.style.display = 'none';
        msg.innerHTML = '';
    }
};

window.updateResults = function() {
    // Calculate total based only on A, B, C, D
    const total = Object.values(votes).reduce((a,b)=>a+b, 0);
    const totalEl = document.getElementById('totalDisp');
    if(totalEl) totalEl.innerText = total;

    // Loop through the 4 candidates
    CANDIDATE_KEYS.forEach(id => {
        const scoreEl = document.getElementById('score'+id);
        const barEl = document.getElementById('bar'+id);
        
        let pct = 0;
        if(total > 0) pct = Math.round((votes[id]/total)*100);

        if(scoreEl) scoreEl.innerText = `${votes[id]} (${pct}%)`;
        if(barEl) barEl.style.width = pct + "%";
    });
};

// CHANGE VOTE LOGIC
window.openChangeModal = function() { document.getElementById('voterModal').style.display = 'flex'; };
window.closeVoterModal = function() { document.getElementById('voterModal').style.display = 'none'; };

window.confirmChangeVote = function() {
    const idx = records.findIndex(r => r.voter === currentUser);
    if(idx !== -1) {
        const oldCand = records[idx].candidate;
        if(votes[oldCand] > 0) votes[oldCand]--;
        records.splice(idx, 1);
        saveData();
        checkVoteStatus();
        updateResults();
    }
    closeVoterModal();
};

window.userLogout = function() { location.reload(); };

// ==========================================
// ADMIN LOGIC
// ==========================================
window.adminLogin = function() {
    const u = document.getElementById('admUser').value.trim().toLowerCase();
    const p = document.getElementById('admPass').value;

    if(u === ADMIN.u && p === ADMIN.p) {
        sessionStorage.setItem('admOK', 'true');
        showAdmin();
    } else {
        alert("Invalid Admin Info");
    }
};

window.showAdmin = function() {
    const loginSec = document.getElementById('adminLoginSection');
    const panelSec = document.getElementById('adminPanel');

    if(loginSec) loginSec.style.display = 'none';
    if(panelSec) panelSec.classList.add('show');
    
    renderStats();
    renderTable();
};

window.userLogoutAdmin = function() {
    sessionStorage.removeItem('admOK');
    location.reload();
};

window.renderStats = function() {
    const admTotal = document.getElementById('admTotal');
    if(!admTotal) return;

    let total = 0;
    for(let k in votes) total += votes[k];
    
    admTotal.innerText = total;
    CANDIDATE_KEYS.forEach(k => {
        document.getElementById('adm'+k).innerText = votes[k];
    });
};

window.renderTable = function() {
    const tbody = document.getElementById('admBody');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    
    records.forEach((r, i) => {
        tbody.innerHTML += `
            <tr>
                <td>${i+1}</td>
                <td><b>${r.voter}</b></td>
                <td>${CANDIDATE_NAMES[r.candidate]}</td>
                <td>${r.time}</td>
                <td style="text-align:center;">
                    <button style="background:none; border:none; cursor:pointer; font-size:18px;" onclick="deleteVote(${r.id})" title="Delete Vote">❌</button>
                </td>
            </tr>
        `;
    });
};

window.deleteVote = function(id) {
    if(!confirm("Are you sure you want to DELETE this vote?")) return;
    
    const idx = records.findIndex(r => r.id === id);
    if(idx !== -1) {
        votes[records[idx].candidate]--;
        records.splice(idx, 1);
        saveData();
        renderStats();
        renderTable();
    }
};

window.openAdminReset = function() { document.getElementById('adminModal').style.display = 'flex'; };
window.closeAdminModal = function() { document.getElementById('adminModal').style.display = 'none'; };

window.confirmReset = function() {
    // Completely wipe the storage
    localStorage.removeItem(K_VOTES);
    localStorage.removeItem(K_RECORDS);
    location.reload(); // Refresh page to reset everything
};