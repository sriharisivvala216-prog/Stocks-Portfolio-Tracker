document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const inputForm = document.getElementById("stockInputForm");
  const transactionBody = document.getElementById("transactionBody");
  const tableBody = document.getElementById("tableBody");
  const totalValueElem = document.getElementById("totalValue");
  const totalGainLossElem = document.getElementById("totalGainLoss");

  let pieChartInstance, barChartInstance, lineChartInstance;

  // Compute dynamic API base URL so it works seamlessly on Render, localhost, or live server
  const API_BASE = (window.location.protocol === "http:" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port !== "5000")
    ? "http://localhost:5000"
    : "";

  // ---------------- LOGIN ----------------
  if (loginForm) {
    loginForm.addEventListener("submit", async e => {
      e.preventDefault();
      const email = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      if (!email || !password) return alert("Please enter email and password");

      const submitBtn = loginForm.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";
      }

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("token", data.token);
          if (data.user && data.user.name) {
            localStorage.setItem("username", data.user.name);
          }
          window.location.href = "input.html"; 
        } else {
          alert(data.message || "Login failed");
        }
      } catch (err) {
        console.error("Login fetch error:", err);
        alert("Cannot connect to server. Please try again.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Log in";
        }
      }
    });
  }

  // ---------------- REGISTER ----------------
  if (registerForm) {
    registerForm.addEventListener("submit", async e => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      if (!name || !email || !password) return alert("All fields are required");

      const submitBtn = registerForm.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating account...";
      }

      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok) {
          alert("Registered successfully! Please login.");
          window.location.href = "index.html";
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (err) {
        console.error("Register fetch error:", err);
        alert("Cannot connect to server. Please try again.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Sign up";
        }
      }
    });
  }

  // ---------------- ADD TRANSACTION ----------------
  if (inputForm) {
    inputForm.addEventListener("submit", async e => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      if (!token) return alert("Please login first");

      const company_symbol = document.getElementById("symbol").value.trim();
      const company_name = document.getElementById("company").value.trim();
      const transaction_type = document.getElementById("transactionType").value;
      const quantity = parseFloat(document.getElementById("quantity").value);
      const price = parseFloat(document.getElementById("price").value);

      if (!company_symbol || !company_name || !transaction_type || !quantity || !price)
        return alert("All fields are required");

      try {
        const res = await fetch(`${API_BASE}/portfolio`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ company_symbol, company_name, transaction_type, quantity, price })
        });
        const data = await res.json();
        if (res.ok) {
          inputForm.reset();
          loadPortfolio();
        } else alert(data.message);
      } catch {
        alert("Server error");
      }
    });
  }

  // ---------------- LOAD PORTFOLIO ----------------
  async function loadPortfolio() {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    try {
      const res = await fetch(`${API_BASE}/portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const portfolio = await res.json();

      if (!portfolio || portfolio.length === 0) {
        if (transactionBody) transactionBody.innerHTML = `<tr><td colspan="9">No transactions yet</td></tr>`;
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="7">No summary yet</td></tr>`;
        if (totalValueElem) totalValueElem.textContent = "₹0.00";
        if (totalGainLossElem) totalGainLossElem.textContent = "₹0.00";
        return;
      }

      // Transaction Table
      if (transactionBody) {
        transactionBody.innerHTML = "";
        portfolio.forEach(item => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${new Date(item.date).toLocaleDateString()}</td>
            <td>${item.company_name}</td>
            <td>${item.company_symbol}</td>
            <td>${item.transaction_type}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>${item.current_price.toFixed(2)}</td>
            <td class="${item.profitLoss >= 0 ? 'positive' : 'negative'}">${item.profitLoss.toFixed(2)}</td>
            <td><button class="deleteBtn" data-id="${item.id}">Delete</button></td>
          `;
          transactionBody.appendChild(row);
        });

        document.querySelectorAll(".deleteBtn").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (confirm("Are you sure to delete this transaction?")) {
              await fetch(`${API_BASE}/portfolio/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
              });
              loadPortfolio();
            }
          });
        });
      }

      // Portfolio Summary & Charts
      const summary = {};
      let totalValue = 0, totalPL = 0;
      const pieLabels = [], pieData = [];
      const barLabels = [], barData = [];
      const monthlyPL = {};

      portfolio.forEach(item => {
        const name = item.company_name;
        if (!summary[name]) summary[name] = { quantity: 0, invested: 0, current: 0 };
        summary[name].quantity += item.quantity;
        summary[name].invested += item.price * item.quantity;
        summary[name].current += item.current_price * item.quantity;

        // Pie
        const idx = pieLabels.indexOf(name);
        if (idx === -1) { pieLabels.push(name); pieData.push(item.current_price * item.quantity); }
        else pieData[idx] += item.current_price * item.quantity;

        // Bar
        const idx2 = barLabels.indexOf(name);
        if (idx2 === -1) { barLabels.push(name); barData.push(item.profitLoss); }
        else barData[idx2] += item.profitLoss;

        // Monthly
        const month = `${new Date(item.date).getFullYear()}-${("0"+(new Date(item.date).getMonth()+1)).slice(-2)}`;
        monthlyPL[month] = (monthlyPL[month] || 0) + item.profitLoss;
      });

      // Summary Table
      if (tableBody) {
        tableBody.innerHTML = "";
        Object.entries(summary).forEach(([name, s]) => {
          const profitLoss = s.current - s.invested;
          totalValue += s.current;
          totalPL += profitLoss;
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${name}</td>
            <td>${s.quantity}</td>
            <td>${s.invested.toFixed(2)}</td>
            <td>${s.current.toFixed(2)}</td>
            <td>${(s.current/s.quantity).toFixed(2)}</td>
            <td class="${profitLoss >= 0 ? 'positive' : 'negative'}">${profitLoss.toFixed(2)}</td>
          `;
          tableBody.appendChild(row);
        });
        totalValueElem.textContent = `₹${totalValue.toFixed(2)}`;
        totalGainLossElem.textContent = `₹${totalPL.toFixed(2)}`;
      }

      // Pie Chart
      const pieChartEl = document.getElementById("pieChart");
      if (pieChartEl) {
        if (pieChartInstance) pieChartInstance.destroy();
        pieChartInstance = new Chart(pieChartEl, {
          type: "pie",
          data: { labels: pieLabels, datasets: [{ data: pieData, backgroundColor: pieLabels.map((_,i)=>`hsl(${i*60},70%,50%)`) }] },
          options: { responsive: true, maintainAspectRatio: true }
        });
      }

      // Bar Chart
      const barChartEl = document.getElementById("barGraph");
      if (barChartEl) {
        if (barChartInstance) barChartInstance.destroy();
        barChartInstance = new Chart(barChartEl, {
          type: "bar",
          data: { labels: barLabels, datasets: [{ label: "Profit/Loss", data: barData, backgroundColor: barData.map(v=>v>=0?"#2e7d32":"#c62828") }] },
          options: { plugins: { legend: { display: false } } }
        });
      }

      // Line Chart
      const lineChartEl = document.getElementById("lineGraph");
      if (lineChartEl) {
        const months = Object.keys(monthlyPL).sort();
        const labels = months.map(m => {
          const [y, mm] = m.split("-");
          const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          return `${monthNames[parseInt(mm)-1]} ${y}`;
        });
        const dataPoints = months.map(m=>monthlyPL[m]);
        if (lineChartInstance) lineChartInstance.destroy();
        lineChartInstance = new Chart(lineChartEl, {
          type: "line",
          data: { labels, datasets: [{ label: "Monthly P/L", data: dataPoints, borderColor: "#4f6ef7", backgroundColor:"rgba(79,110,247,0.2)", fill:true, tension:0.3 }] },
          options: { scales: { x:{ title:{display:true,text:"Month"} }, y:{ title:{display:true,text:"Profit/Loss (₹)"}, beginAtZero:true } } }
        });
      }

    } catch(err) {
      console.error(err);
      if (transactionBody) transactionBody.innerHTML = `<tr><td colspan="9">Error loading transactions</td></tr>`;
      if (tableBody) tableBody.innerHTML = `<tr><td colspan="7">Error loading summary</td></tr>`;
    }
  }

  if (transactionBody || tableBody) {
    window.addEventListener("pageshow", loadPortfolio);
    const refreshBtn = document.getElementById("refreshPortfolio");
    if (refreshBtn) refreshBtn.addEventListener("click", loadPortfolio);
    loadPortfolio();
  }
});
