const form = document.querySelector("#addForm");
const message = document.querySelector("#displayAlert");
const productList = document.querySelector("#prodL");
const productAmt = document.querySelector("#prodamt");
const productName = document.querySelector("#prodName");
const productContainer = document.querySelector("#prodCard");
const formContainer = document.querySelector("#mainCard");
const total = document.querySelector("#totalP");

//Functions
////Helper functions
// Message
const errormsg = function (msg, clremove, cladd) {
  message.innerHTML = `${msg}`;
  message.classList.remove(clremove);
  message.classList.add(cladd);
  setTimeout(() => {
    message.classList.add(clremove);
    message.classList.remove(cladd);
  }, 2000);
};

//Utility
const util = function (obj) {
  if (obj.money <= 0) {
    errormsg("Please enter amount greater than 0", "d-none", "alert-danger");
    return true;
  } else if (obj.productName === "") {
    errormsg("Please enter Product Name", "d-none", "alert-danger");
    return true;
  }
};

//ShowonUi
const ShowOnUi = function (obj) {
  const li = document.createElement("li");
  li.id = obj._id;
  // Add class
  li.className = "list-group-item";
  li.appendChild(document.createTextNode("Rs." + obj.money));
  li.appendChild(document.createTextNode(" " + "- "));
  li.appendChild(document.createTextNode(obj.productName));
  //delbutton element
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-outline-danger btn-sm float-end delete";
  deleteBtn.appendChild(document.createTextNode("Delete"));
  li.appendChild(deleteBtn);
  // Append li to list
  productList.appendChild(li);
};

//GET database data
const initialised = function () {
  axios
    .get("https://crudcrud.com/api/6118f920eb444682b2798ef94a4a58bc/sellerData")
    .then((response) => {
      if (!response.data.length) return;
      response.data.forEach((item) => {
        ShowOnUi(item);
        total.innerHTML = item.total;
      });

      productContainer.classList.remove("d-none");

      errormsg("Your Data displayed in UI", "d-none", "alert-primary");
    })
    .catch((err) => {
      console.error(err);
      errormsg("Something Went wrong", "d-none", "alert-danger");
    });
};

//Delete from dataBase and UI
const deleteData = function (id, el) {
  axios
    .delete(
      `https://crudcrud.com/api/6118f920eb444682b2798ef94a4a58bc/sellerData/${id}`
    )
    .then((response) => {
      const cost = el.childNodes[0].data.replace("Rs.", "").trim();
      total.innerHTML = +total.innerHTML - +cost;
      productList.removeChild(el);

      if (productList.childElementCount === 0) {
        productContainer.classList.add("d-none");
      }
    })
    .catch((err) => {
      console.error(err);
      errormsg("Something Went wrong", "d-none", "alert-danger");
    });
};

// Adding new Data
const newData = function (obj) {
  if (util(obj)) return;
  axios
    .post(
      "https://crudcrud.com/api/6118f920eb444682b2798ef94a4a58bc/sellerData",
      obj
    )
    .then((response) => {
      ShowOnUi(response.data);
      total.innerHTML = +total.innerHTML + +response.data.money;
      if (productList.childElementCount === 1)
        productContainer.classList.remove("d-none");

      productAmt.value = "";
      productName.value = "";

      //Alert
      errormsg("Your Product added successfully", "d-none", "alert-success");
    })
    .catch((err) => {
      console.error(err);
      errormsg("Something Went wrong", "d-none", "alert-danger");
    });
};

///Callback Functions
//Add Expense
const onSubmit = function (e) {
  e.preventDefault();

  const userData = {
    money: productAmt.value,
    productName: productName.value,
    total: +total.innerHTML + +productAmt.value,
  };

  newData(userData);
};

// Remove Expense
const removeItem = function (e) {
  if (e.target.classList.contains("delete")) {
    if (confirm("Are You Sure?")) {
      const li = e.target.parentElement;
      //Deleting data from database and UI
      deleteData(li.id, li);
    }
  }
};

//event Handlers
form.addEventListener("submit", onSubmit);
productList.addEventListener("click", removeItem);
window.addEventListener("DOMContentLoaded", initialised);
