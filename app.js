// Localized Mock Database Layer
const INITIAL_STATE = {
    userProfile: {
        username: "Eco Warrior",
        avatarSeed: "JalWater",
        xp: 540,
        streak: 12,
        waterSavedMonth: 3200,
        challengesCompletedCount: 8,
        friendsInvitedCount: 3,
        todayWaterLogged: 0
    },
    challenges: [
        { id: "d1", text: "Carry reusable bottle structural unit", type: "daily", xp: 15, completed: true },
        { id: "d2", text: "Reduce personal shower time duration by 2 mins", type: "daily", xp: 20, completed: false },
        { id: "d3", text: "Consume one exclusively plant-based nutritional array", type: "daily", xp: 25, completed: false },
        { id: "w1", text: "Execute exactly 3 shorter shower duration operations", type: "weekly", xp: 60, completed: false },
        { id: "w2", text: "Ingest 2 certified low-water-footprint meals", type: "weekly", xp: 80, completed: true },
        { id: "m1", text: "Reduce total monthly composite footprint metric by 10%", type: "monthly", xp: 200, completed: false },
        { id: "m2", text: "Finalize 20 custom distinct eco-friendly actions", type: "monthly", xp: 250, completed: false }
    ],
    friends: [
        { name: "Muskan", xp: 1200, waterSaved: 4800, level: "Ocean Hero", isVeg: true },
        { name: "Riya", xp: 1100, waterSaved: 4200, level: "River Guardian", isVeg: true },
        { name: "Aryan", xp: 900, waterSaved: 3600, level: "Stream Protector", isVeg: false },
        { name: "Karan", xp: 520, waterSaved: 2100, level: "Water Explorer", isVeg: false }
    ],
    badges: [
        { id: "b1", name: "🌱 Eco Beginner", desc: "Initiated resource optimization logging operations.", requirement: 100 },
        { id: "b2", name: "💧 Water Saver", desc: "Crossed 500 total Experience points threshold.", requirement: 500 },
        { id: "b3", name: "🏆 River Guardian", desc: "Crossed 1000 total Experience points threshold.", requirement: 1000 },
        { id: "b4", name: "🌊 Ocean Hero", desc: "Attained peak structural ecosystem validation standard.", requirement: 2000 }
    ]
};

function renderResult(data, foodName) {
    document.getElementById("result").innerHTML = `
        <div class="result-card">

            <div class="result-header">
                <h2>${data.matched_food.toUpperCase()}</h2>
                <div class="water-number">
                    ${data.water_liters}
                    <span>L</span>
                </div>
                <p>${data.unit}</p>
            </div>

            <div class = "breakdown-grid">
                <div class="stat-card green">
                    <h3>${data.breakdown.green}</h3>
                    <p>Green Water</p>
                </div>

                <div class="stat-card blue">
                    <h3>${data.breakdown.blue}</h3>
                    <p>Blue Water</p>
                </div>

                <div class="stat-card grey">
                    <h3>${data.breakdown.grey}</h3>
                    <p>Grey Water</p>
                </div>
            </div>

            <div class="tips-section">
                <h3>Did You Know?</h3>
                ${data.tips.map(t => `<p>• ${t}</p>`).join("")}
            </div>

            <div class="advice-box">
                ${data.advice}
            </div>

        </div>
        `;
}

async function lookup() {
    const food = document.getElementById("meal-text").value;

    const response = await fetch("http://localhost:8000/lookup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            food_name: food
        })
    });

    const data = await response.json();

    if (!data.found) {
        document.getElementById("result").innerHTML =
            `<p>${data.message}</p>`;
        return;
    }

    renderResult(data, food);
}

// 1. The Core Logic: Handles reading the file and sending it to the API
async function scan(file) {
    if (!file) return;

    // 1. Get your existing result element (replace "result-container" with your actual ID)
    const resultElement = document.getElementById("result");
    
    // 2. Put the loading text inside it immediately
    if (resultElement) {
        resultElement.innerHTML = "<p class='loading-text'>Please wait, scanning image...</p>";
    }

    const reader = new FileReader();

    reader.onload = async function(e) {
        try {
            const base64 = e.target.result.split(",")[1];

            const response = await fetch("http://localhost:8000/scan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ image: base64 })
            });

            const data = await response.json();
            
            // 3. Your existing function will automatically overwrite the loading text with the real data
            renderResult(data, data.identified_as || "Unknown");

        } catch (error) {
            console.error("Scanning failed:", error);
            
            // 4. If it fails, clear the loading message and show an error instead
            if (resultElement) {
                resultElement.innerHTML = "<p style='color: red;'>Failed to scan image. Please try again.</p>";
            }
        }
    };

    reader.readAsDataURL(file);
}

// 2. The Event Handler: Extracts the file and updates the UI status
async function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;

    document.getElementById("upload-status").textContent = file.name;

    // Reuse the scan function here
    await scan(file);
}


// State Controller Lifecycle Wrapper
let appState = JSON.parse(localStorage.getItem('JALKHAATA_STATE')) || INITIAL_STATE;

function syncLocalStorage() {
    localStorage.setItem('JALKHAATA_STATE', JSON.stringify(appState));
}

// Single Page Nav Engine
function showPage(pageId) {
    document.querySelectorAll('.app-page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const TargetPage = document.getElementById(`page-${pageId}`);
    if(TargetPage) TargetPage.classList.add('active');

    // Sync menu highlighting nodes
    const menuItems = document.querySelectorAll('.nav-menu .nav-item');
    menuItems.forEach(item => {
        if(item.textContent.toLowerCase().includes(pageId === 'log' ? 'log activity' : pageId)) {
            item.classList.add('active');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Compute Tier Rank Classifications dynamically from XP values
function getLevelName(xp) {
    if (xp < 500) return "Water Explorer";
    if (xp < 1000) return "Stream Protector";
    if (xp < 2000) return "River Guardian";
    return "Ocean Hero";
}

// Core Rendering Pipeline
function updateUIRefreshes() {
    const profile = appState.userProfile;
    const computedLevel = getLevelName(profile.xp);

    // Navigation Status syncs
    document.getElementById('nav-streak').textContent = profile.streak;
    document.getElementById('nav-xp').textContent = profile.xp;
    document.getElementById('nav-avatar-img').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.avatarSeed}`;

    // Dashboard elements syncs
    document.getElementById('hero-username').textContent = profile.username;
    document.getElementById('dash-level-name').textContent = computedLevel;
    document.getElementById('dash-water-saved').textContent = profile.waterSavedMonth.toLocaleString();
    document.getElementById('dash-today-litres').textContent = profile.todayWaterLogged;

    // Progress circle evaluation logic
    const circle = document.getElementById('today-progress-circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    
    // Baselines limit at 500 Litres for circular progress visualization bounds
    const baselineCap = 500;
    const percentage = Math.min((profile.todayWaterLogged / baselineCap) * 100, 100);
    const offset = circumference - (percentage / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Sub-component renders
    renderDashboardQuests();
    renderMainQuestMatrix();
    renderLeaderboards();
    renderProfileHeatmaps();
}

// Render Core Lists
function renderDashboardQuests() {
    const container = document.getElementById('dash-challenges-list');
    container.innerHTML = "";
    
    // Render top 2 incomplete challenges
    const activeQuests = appState.challenges.filter(c => !c.completed).slice(0, 2);
    if(activeQuests.length === 0) {
        container.innerHTML = "<p style='font-size:0.9rem; color:var(--text-muted);'>All active operational directives cleared!</p>";
        return;
    }

    activeQuests.forEach(quest => {
        const item = document.createElement('div');
        item.className = "challenge-item-row";
        item.innerHTML = `
            <div class="challenge-main">
                <button class="chk-btn" onclick="completeQuestDirectly('${quest.id}')"></button>
                <div class="challenge-text-block">
                    <label>${quest.text}</label>
                    <div class="challenge-meta"><span class="c-xp">+${quest.xp} XP</span></div>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderMainQuestMatrix() {
    const dailyBox = document.getElementById('container-daily-challenges');
    const weeklyBox = document.getElementById('container-weekly-challenges');
    const monthlyBox = document.getElementById('container-monthly-challenges');

    if(!dailyBox) return; // Guard clause for structural checking

    dailyBox.innerHTML = ""; weeklyBox.innerHTML = ""; monthlyBox.innerHTML = "";

    appState.challenges.forEach(quest => {
        const row = document.createElement('div');
        row.className = `challenge-item-row ${quest.completed ? 'completed' : ''}`;
        row.innerHTML = `
            <div class="challenge-main">
                <button class="chk-btn" onclick="completeQuestDirectly('${quest.id}')">
                    ${quest.completed ? '<i class="fa-solid fa-check" style="color:#03141c; font-size:0.8rem;"></i>' : ''}
                </button>
                <div class="challenge-text-block">
                    <label onclick="completeQuestDirectly('${quest.id}')">${quest.text}</label>
                    <div class="challenge-meta">
                        <span class="c-xp">+${quest.xp} XP</span>
                        <span>• Target Scope: ${quest.type}</span>
                    </div>
                </div>
            </div>
        `;
        
        if(quest.type === 'daily') dailyBox.appendChild(row);
        if(quest.type === 'weekly') weeklyBox.appendChild(row);
        if(quest.type === 'monthly') monthlyBox.appendChild(row);
    });

    // Render Badge Matrix
    const badgeGrid = document.getElementById('badges-container-grid');
    badgeGrid.innerHTML = "";
    appState.badges.forEach(badge => {
        const isUnlocked = appState.userProfile.xp >= badge.requirement;
        const div = document.createElement('div');
        div.className = `badge-node ${isUnlocked ? 'unlocked' : ''}`;
        div.innerHTML = `
            <div class="badge-icon-layer">${badge.name.split(' ')[0]}</div>
            <h5>${badge.name.substring(2)}</h5>
            <p>${badge.desc}</p>
            <small style="font-size:0.65rem; color:var(--color-aqua);">${isUnlocked ? 'Matrix Active' : 'Req: ' + badge.requirement + ' XP'}</small>
        `;
        badgeGrid.appendChild(div);
    });
}

function renderLeaderboards(filterType = 'veg') {
    const mainBody = document.getElementById('main-leaderboard-body');
    const dashMiniList = document.getElementById('dash-leaderboard-list');

    // Aggregate user profile entry into dataset matching format
    const formattedUser = {
        name: appState.userProfile.username + " (You)",
        xp: appState.userProfile.xp,
        waterSaved: appState.userProfile.waterSavedMonth,
        level: getLevelName(appState.userProfile.xp),
        isVeg: true, // Defaulting tracking filter alignment
        isUser: true
    };

    let dataset = [...appState.friends, formattedUser];
    
    // Sort array descending based on XP yields
    dataset.sort((a,b) => b.xp - a.xp);

    // Mini Dash Render (Top 3)
    if(dashMiniList) {
        dashMiniList.innerHTML = "";
        dataset.slice(0, 3).forEach(ind => {
            const row = document.createElement('div');
            row.className = "mini-l-item";
            row.innerHTML = `
                <span style="font-size:0.9rem; font-weight:600;">${ind.name}</span>
                <span style="color:var(--color-aqua); font-size:0.85rem; font-weight:700;">${ind.xp} XP</span>
            `;
            dashMiniList.appendChild(row);
        });
    }

    // Filter main view matrix configuration parameters
    if(!mainBody) return;
    mainBody.innerHTML = "";
    
    // Update active structural toggle styling buttons
    if(filterType === 'veg') {
        document.getElementById('btn-toggle-veg').classList.add('active');
        document.getElementById('btn-toggle-nonveg').classList.remove('active');
    } else {
        document.getElementById('btn-toggle-veg').classList.remove('active');
        document.getElementById('btn-toggle-nonveg').classList.add('active');
    }

    const filteredData = dataset.filter(i => filterType === 'veg' ? i.isVeg : !i.isVeg || i.isUser);

    filteredData.forEach((ind, index) => {
        const tr = document.createElement('tr');
        if(ind.isUser) tr.className = "user-row";
        tr.innerHTML = `
            <td><span class="rank-num">${index + 1}</span></td>
            <td>
                <div class="identity-cell">
                    <img class="mini-avatar-list" src="https://api.dicebear.com/7.x/bottts/svg?seed=${ind.name}" alt="av">
                    <strong>${ind.name}</strong>
                </div>
            </td>
            <td>${ind.xp}</td>
            <td style="color:var(--color-aqua); font-weight:700;">💧 ${ind.waterSaved}L</td>
            <td><span class="badge-pill">${ind.level}</span></td>
        `;
        mainBody.appendChild(tr);
    });
}

function renderProfileHeatmaps() {
    const grid = document.getElementById('heatmap-container-grid');
    if(!grid) return;
    grid.innerHTML = "";
    
    // Create static array nodes simulating dynamic git footprint logging history matrix map
    const mockContributions = [0,1,0,3,2,0,1,0,0,2,1,3,0,1,2,0,1,1,0,2,3,0,0,1,2,1,0,2];
    mockContributions.forEach(lvl => {
        const node = document.createElement('div');
        node.className = `cube level-${lvl}`;
        node.title = `Ecosystem interaction level validation state: ${lvl}`;
        grid.appendChild(node);
    });

    // Populate standard textual field arrays inside settings panels
    document.getElementById('profile-name-display').textContent = appState.userProfile.username;
    document.getElementById('profile-rank-display').textContent = getLevelName(appState.userProfile.xp);
    document.getElementById('prof-xp').textContent = appState.userProfile.xp;
    document.getElementById('prof-streak').textContent = appState.userProfile.streak;
    document.getElementById('prof-saved').textContent = (appState.userProfile.waterSavedMonth/1000).toFixed(1) + 'k';
    document.getElementById('prof-challenges').textContent = appState.userProfile.challengesCompletedCount;
    document.getElementById('prof-friends').textContent = appState.userProfile.friendsInvitedCount;
}

// User Actions Handlers
function completeQuestDirectly(id) {
    const quest = appState.challenges.find(c => c.id === id);
    if(quest && !quest.completed) {
        quest.completed = true;
        appState.userProfile.xp += quest.xp;
        appState.userProfile.challengesCompletedCount++;
        syncLocalStorage();
        updateUIRefreshes();
        alert(`Quest verified successfully! Earned +${quest.xp} operational experience points.`);
    } else if(quest && quest.completed) {
        // Toggle optimization configuration layer states
        quest.completed = false;
        appState.userProfile.xp -= quest.xp;
        appState.userProfile.challengesCompletedCount--;
        syncLocalStorage();
        updateUIRefreshes();
    }
}

function quickLog(amount, title) {
    appState.userProfile.todayWaterLogged += amount;
    appState.userProfile.xp += 10; // Fixed incentive base configuration values
    syncLocalStorage();
    updateUIRefreshes();
    alert(`Interaction matrix initialized: ${title}. Allocated +10 XP baseline standard.`);
}

function updateRangeVal(element, outputId) {
    document.getElementById(outputId).textContent = element.value;
}

function triggerMockUpload() {
    const status = document.getElementById('upload-status');
    status.textContent = "Processing network asset arrays via AI proxy...";
    setTimeout(() => {
        status.textContent = "AI Classification Match Found: [Paneer Butter Masala Matrix Combo]";
        document.getElementById('meal-select').value = "dairy";
    }, 1200);
}

// Core Analytical Calculations Logic
function calculateFootprint() {
    const mealVal = document.getElementById('meal-select').value;
    let mealLitres = 400; // default base vector value array allocation mappings
    if(mealVal === 'dairy') mealLitres = 1200;
    if(mealVal === 'poultry') mealLitres = 900;
    if(mealVal === 'meat') mealLitres = 2500;

    const showerMins = parseInt(document.getElementById('input-shower').value) || 0;
    const laundryLoads = parseInt(document.getElementById('input-laundry').value) || 0;
    const dishMins = parseInt(document.getElementById('input-dishes').value) || 0;
    const gardenMins = parseInt(document.getElementById('input-garden').value) || 0;
    const carSessions = parseInt(document.getElementById('input-car').value) || 0;
    const directDrink = parseFloat(document.getElementById('input-drink').value) || 0;

    // Direct Consumption Variable Allocation Formula Indices
    const showerRate = 9; // Litres per min baseline averages standard
    const laundryRate = 75; // Litres per machine load iteration standard
    const dishRate = 6; // Litres per operational direct cleaning duration variable
    const hoseRate = 12; // Litres per operational hose activity variable duration mapping
    const carRate = 150; // Litres per targeted manual wash sequence

    const domesticSum = (showerMins * showerRate) + (laundryLoads * laundryRate) + (dishMins * dishRate) + (gardenMins * hoseRate) + (carSessions * carRate) + directDrink;
    const totalImpactCalculated = mealLitres + Math.round(domesticSum);

    // Update UI Elements
    document.getElementById('calculated-litres').textContent = totalImpactCalculated;
    
    // Animate diagnostic fluid cylinder metric tracking bounds metrics visualization
    const fillPercent = Math.min((totalImpactCalculated / 3000) * 100, 100);
    document.getElementById('meter-fill').style.height = `${fillPercent}%`;

    // Process micro targeted optimization coaching algorithm loops text configurations
    const suggestionsBox = document.getElementById('ai-suggestions-list');
    suggestionsBox.innerHTML = "";

    const diagnosticTextNode = document.getElementById('impact-evaluation-text');
    diagnosticTextNode.textContent = `Today's Water Impact: ${totalImpactCalculated} Litres total system parameter profile tracking values loaded.`;

    // Construct constructive optimization lists safely without applying standard compliance shaming vectors
    let feedbackCards = [];
    if(showerMins > 5) {
        feedbackCards.push("You could conserve approximately 18-36 litres tomorrow by restricting structural shower durations by 2-4 minutes.");
    }
    if(mealVal === 'meat' || mealVal === 'dairy') {
        feedbackCards.push("Transitioning at least one weekly routine meal selection to direct plant-based ingredients maximizes sub-basin hydro retention levels.");
    }
    if(laundryLoads > 0) {
        feedbackCards.push("Consolidating garment cycles strictly into completely full load distributions reduces wastewater downstream processing friction.");
    }
    if(gardenMins > 0) {
        feedbackCards.push("Consider shifting automated irrigation parameters to cool evening or pre-dawn slots to bypass heavy atmospheric evaporation penalties.");
    }

    if(feedbackCards.length === 0) {
        feedbackCards.push("Operational profile exhibits excellent compliance boundaries. Continue implementing tracking loops to stabilize surrounding ecosystems.");
    }

    feedbackCards.forEach(tip => {
        const card = document.createElement('div');
        card.className = "suggestion-item";
        card.innerHTML = `
            <div class="sug-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
            <p>${tip}</p>
        `;
        suggestionsBox.appendChild(card);
    });

    // Update local variables storage states parameters maps
    appState.userProfile.todayWaterLogged = totalImpactCalculated;
    appState.userProfile.xp += 30; // Award transactional execution points
    syncLocalStorage();
    updateUIRefreshes();
}

// Modal Interaction Framework
function openInviteModal() {
    document.getElementById('invite-modal').classList.add('active');
}
function closeInviteModal() {
    document.getElementById('invite-modal').classList.remove('active');
}
function copyInviteCode() {
    const field = document.getElementById('invite-code-field');
    field.select();
    field.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(field.value);
    alert("Invite token hash array mapped to device clipboard layers: " + field.value);
    appState.userProfile.friendsInvitedCount++;
    syncLocalStorage();
    updateUIRefreshes();
    closeInviteModal();
}

function filterLeaderboard(type) {
    renderLeaderboards(type);
}

// Interactive Knowledge Hub Accordion Nodes
function toggleAccordion(element) {
    element.classList.toggle('open');
}

// Profile Sync Configurations Layer updates
function updateProfileSettings() {
    const newName = document.getElementById('settings-username').value;
    const newSeed = document.getElementById('settings-avatar-seed').value;
    
    if(newName.trim()) appState.userProfile.username = newName;
    if(newSeed.trim()) appState.userProfile.avatarSeed = newSeed;

    syncLocalStorage();
    updateUIRefreshes();
}

function toggleThemeOverride() {
    const isChecked = document.getElementById('theme-toggle-checkbox').checked;
    if(!isChecked) {
        document.body.style.background = "#051923";
    } else {
        document.body.style.background = "linear-gradient(135deg, #051923 0%, #0A4D68 50%, #002B3D 100%)";
        document.body.style.backgroundSize = "400% 400%";
    }
}

// Initialization Entry Vector
window.addEventListener('DOMContentLoaded', () => {
    updateUIRefreshes();
    
    // Set standard periodic carousel data update intervals
    const facts = [
        "1 kg of beef may require significantly more water than most vegetables—averaging around 15,000 litres!",
        "A leaky faucet expanding at exactly one drop per second sheds up to 11,000 litres of clean fluid annually.",
        "Refining a single metric ton of raw steel absorbs up to 300 metric tons of process scaling operational water assets."
    ];
    let index = 0;
    setInterval(() => {
        const carousel = document.getElementById('fact-carousel-container');
        if(carousel) {
            index = (index + 1) % facts.length;
            carousel.innerHTML = `<p class="fact-text">"${facts[index]}"</p>`;
        }
    }, 8000);
});
