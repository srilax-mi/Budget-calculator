// Register new user
function register(e) {
  e.preventDefault();
  let username = document.getElementById("username").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  if (localStorage.getItem(email)) {
    alert("Email already registered!");
    return;
  }

  let user = { username, email, password, income: [], expense: [] };
  localStorage.setItem(email, JSON.stringify(user));
  alert("Account created!");
  window.location = "index.html";
}

// Login
function login(e) {
  e.preventDefault();
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  let user = JSON.parse(localStorage.getItem(email));
  if (!user || user.password !== password) {
    alert("Invalid credentials!");
    return;
  }

  localStorage.setItem("loggedUser", email);
  window.location = "home.html";
}

// Dashboard logic
if (window.location.pathname.includes("home.html")) {
  let loggedEmail = localStorage.getItem("loggedUser");
  if (!loggedEmail) window.location = "index.html";
  let user = JSON.parse(localStorage.getItem(loggedEmail));
  document.getElementById("welcome").innerText = "Welcome " + user.username;

  updateDashboard();

  function updateDashboard() {
    let incomeTotal = user.income.reduce((a, b) => a + b.amount, 0);
    let expenseTotal = user.expense.reduce((a, b) => a + b.amount, 0);

    document.getElementById("balance").innerText = incomeTotal - expenseTotal;
    document.getElementById("expense").innerText = expenseTotal;

    // Update history
    let incomeTable = document.getElementById("incomeHistory");
    let expenseTable = document.getElementById("expenseHistory");
    incomeTable.innerHTML = "";
    expenseTable.innerHTML = "";

    user.income.forEach(i => {
      incomeTable.innerHTML += `<tr><td>${i.type}</td><td>+${i.amount}</td></tr>`;
    });

    user.expense.forEach(e => {
      expenseTable.innerHTML += `<tr><td>${e.type}</td><td>- ${e.amount}</td></tr>`;
    });

    showCharts(incomeTotal, expenseTotal);
  }

  function addIncome(e) {
    e.preventDefault();
    let type = document.getElementById("incomeType").value;
    let amt = +document.getElementById("incomeAmt").value;
    user.income.push({ type, amount: amt });
    localStorage.setItem(loggedEmail, JSON.stringify(user));
    updateDashboard();
    e.target.reset();
  }

  function addExpense(e) {
    e.preventDefault();
    let type = document.getElementById("expenseType").value;
    let amt = +document.getElementById("expenseAmt").value;
    user.expense.push({ type, amount: amt });
    localStorage.setItem(loggedEmail, JSON.stringify(user));
    updateDashboard();
    e.target.reset();
  }

  function clearAll() {
    if (confirm("Clear all budget data?")) {
      user.income = [];
      user.expense = [];
      localStorage.setItem(loggedEmail, JSON.stringify(user));
      updateDashboard();
    }
  }

  let pieChart, barChart;
  function showCharts(incomeTotal, expenseTotal) {
    // Destroy old charts if they exist
    if (pieChart) pieChart.destroy();
    if (barChart) barChart.destroy();

    // Pie chart (expenses)
    let ctx1 = document.getElementById("expensePie").getContext("2d");
    let categories = user.expense.map(e => e.type);
    let amounts = user.expense.map(e => e.amount);
    pieChart = new Chart(ctx1, {
      type: "pie",
      data: {
        labels: categories.length ? categories : ["No Expenses"],
        datasets: [{
          data: amounts.length ? amounts : [1],
          backgroundColor: ["#e74c3c","#3498db","#2ecc71","#f39c12","#9b59b6"]
        }]
      }
    });

    // Bar chart (income vs expense)
    let ctx2 = document.getElementById("barChart").getContext("2d");
    barChart = new Chart(ctx2, {
      type: "bar",
      data: {
        labels: ["Income", "Expense"],
        datasets: [{
          label: "Amount",
          data: [incomeTotal, expenseTotal],
          backgroundColor: ["#2ecc71", "#e74c3c"]
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // expose functions
  window.addIncome = addIncome;
  window.addExpense = addExpense;
  window.clearAll = clearAll;
}

// Logout
function logout() {
  localStorage.removeItem("loggedUser");
  window.location = "index.html";
}
