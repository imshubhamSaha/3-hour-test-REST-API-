"use strict";
const $ = (query) => document.querySelector(query);

const form = $("#addForm");
const message = $("#displayAlert");
const productList = $("#prodL");
const productAmt = $("#prodamt");
const productName = $("#prodName");
const productCategory = $("#productCategory");
const productListingDate = $("#productdate");
const productContainer = $("#prodCard");
const total = $("#totalP");
const formContainer = $("#mainCard");
const filterByPrice = $("#filterprice");
const filterByCategory = $("#filterCategory");
const filterCatform = $("#filCategory");
const filterPriceform = $("#filType");
const msgDiv = $("#containerAlert");
const totalDiv = $("#totalValue");
const key = "totalprice";
const URL = `https://crudcrud.com/api/52ea1efdab0842618da25ffa3c489524/sellerData`;
/////////////////////////////////////////Functions////////////////////////////////////////////////
///////////////////////////Utility functions//////////////////////////////

//Get request
const getRequest = () => axios.get(`${URL}`);
//POST request
const postRequest = (load) => axios.post(`${URL}`, load);
//Delete request
const deleteRequest = (id) => axios.delete(`${URL}/${id}`);
//Create LocalStore
const Memo = function (totalVal) {
  localStorage.setItem(key, JSON.stringify(totalVal));
};

// Message
const displayMessage = function (msg, clremove, cladd) {
  message.innerHTML = `${msg}`;
  message.classList.remove(clremove);
  message.classList.add(cladd);
  setTimeout(() => {
    message.classList.add(clremove);
    message.classList.remove(cladd);
  }, 2000);
};

//expenseContainer Hide and unhide
const displayContainer = function (task, element = productContainer) {
  if (task === "remove") element.classList.remove("d-none");
  else if (task === "add") element.classList.add("d-none");
};

//Div Filter Message display
const filterMessage = function (msg, clremove, cladd) {
  msgDiv.innerHTML = `${msg}`;
  msgDiv.classList.remove(clremove);
  msgDiv.classList.add(cladd);
};

//check Child
const check = function (msg) {
  if (productList.childElementCount === 0) {
    displayContainer("add");
  } else if (productList.childElementCount > 0) {
    displayContainer("remove");
  }
  displayMessage(msg, "d-none", "alert-success");
};

// div filter message remove
const removefilterMessage = function (add) {
  msgDiv.classList.add(add);
};

//Check for field errors
const util = function (formData) {
  return new Promise((resolve, reject) => {
    if (formData.money <= 0) reject("Please enter amount greater than 0");
    else if (formData.productname === "") reject("Please enter Product Name");
    else if (formData.productdate === "") reject("Please select Date");
    else resolve();
  });
};

// default form data
const defaultFormData = function () {
  productAmt.value = "";
  productName.value = "";
  productCategory.value = "Electronics";
  productListingDate.value = "";
};

//ShowonUi
const ShowOnUi = function (userData) {
  const li = document.createElement("li");
  li.className = "list-group-item";
  li.classList.add("mb-2");
  li.classList.add("border-1");
  li.classList.add("border-dark-subtle");
  li.classList.add("rounded");
  li._id = userData._id;
  const [year, month, day] = userData.productdate.split("-");
  const dateStr = new Date(year, `${month - 1}`, day);

  const html = `
    <div><strong>Product Listing Date : </strong>${dateStr.toDateString()}</div>
    <div><strong>Product Amount : </strong>Rs.${userData.money}</div>
    <div><strong>Product Category : </strong>${userData.productcategory}</div>
    <div><strong>Product Name : </strong>${userData.productname}</div>
    <div id="btnGrp" class="d-grid gap-2 mt-2 d-md-flex justify-content-md-end">
      <button class="btn btn-outline-danger delete btn-sm" type="button">Delete</button>
    </div>
  `;

  li.insertAdjacentHTML("afterbegin", html);
  productList.appendChild(li);
  defaultFormData();
};

//totalPrice placeholder
const totalPriceData = function (num) {
  total.innerHTML = `Rs.${num}`;
};

//Adding all product price
const totalPrice = function (data, task = "get") {
  return new Promise((resolve) => {
    let totalValue = 0;
    let localStore = localStorage.getItem(key);

    if (localStore) {
      const local = JSON.parse(localStore);
      if (task == "get") totalValue = local;
      else if (task == "delete") totalValue = local - data;
      else if (task == "add") totalValue = local + data;
    } else if (data) {
      totalValue = data.reduce((acc, curr) => {
        return acc + curr.money;
      }, 0);
    }
    Memo(totalValue);
    resolve(totalValue);
  });
};

// Promise to print all data
const displayAllData = function (data) {
  return new Promise((resolve) => {
    data.forEach((item) => ShowOnUi(item));
    resolve("Database Data are displayed in UI");
  });
};

/// Initial for every loading
const init = async function () {
  try {
    const dataBase = await getRequest();
    if (dataBase.data.length === 0) {
      Memo(0);
      throw new Error("you don't have any save data");
    } else {
      const [displayRes, priceRes] = await Promise.all([
        displayAllData(dataBase.data),
        totalPrice(dataBase.data),
      ]);
      totalPriceData(priceRes);
      check(displayRes);
    }
  } catch (error) {
    displayMessage(error, "d-none", "alert-danger");
  }
};

//to update UI
const updateUI = function (arr, set) {
  if (!set) {
    arr.forEach((item) => item.classList.remove("d-none"));
  } else {
    arr.forEach((item) => {
      if (!set.has(item._id)) item.classList.add("d-none");
      else item.classList.remove("d-none");
    });
  }
  displayContainer("remove", productList);
  removefilterMessage("d-none");
};

//FilteredData
const filterData = function (val, id, totalData) {
  if (id === "filterCategory") {
    const data = totalData
      .filter((item) => [...item.children][2].childNodes[1].textContent === val)
      .map((item) => item._id);
    return new Set(data);
  } else if (id === "filterprice") {
    const [starting, upto] = val.split("-");
    const data = totalData
      .filter((item) => {
        let priceBrack = +[
          ...item.children,
        ][1].childNodes[1].textContent.replaceAll("Rs.", "");
        return priceBrack >= starting && priceBrack <= upto;
      })
      .map((item) => item._id);
    return new Set(data);
  }
};

//////////////////////////CallBack Functions for event callback function ///////////////////////////
// Adding new data
const addNewData = async function (userData) {
  try {
    await util(userData);
    const response = await postRequest(userData);
    const totalMoney = await totalPrice(response.data.money, "add");
    ShowOnUi(response.data);
    totalPriceData(totalMoney);
    check("Data added in Data-Base");
  } catch (error) {
    displayMessage(error, "d-none", "alert-danger");
  }
};

// Removing Existing Data
const removeData = async function (li) {
  if (confirm("Are you Sure?")) {
    try {
      const [, amt] = [...li.children];
      const money = +amt.childNodes[1].textContent.replaceAll("Rs.", "");
      await deleteRequest(li._id);
      const afterDelPrice = await totalPrice(money, "delete");
      productList.removeChild(li);
      totalPriceData(afterDelPrice);
      check("Data Deleted From Database");
    } catch (error) {
      displayMessage("Error: Data not deleted", "d-none", "alert-primary");
    }
  }
};

//FilterFunction
const filterFun = function (val, id) {
  const allData = [...productList.children];
  if (val === "NoChoice" || val === "All") {
    updateUI(allData);
    totalDiv.classList.remove("d-none");
    return;
  }
  const data = filterData(val, id, allData);
  if (!data.size) {
    displayContainer("add", productList);
    filterMessage(`No Data Found`, "d-none", "alert-danger");
  } else {
    updateUI(allData, data);
  }
  totalDiv.classList.add("d-none");
};

////////////////////////////////Event CallBack Function/////////////////////////
// Data adding event Callback
const formSubmit = function (e) {
  e.preventDefault();
  const userData = {
    money: Number(productAmt.value),
    productname: productName.value,
    productcategory: productCategory.value,
    productdate: productListingDate.value,
  };
  addNewData(userData);
};

//Data(filterPrice) matches
const filterPrice = function (e) {
  filterByCategory.value = "NoChoice";
  const id = e.target.id;
  const priceVal = e.target.value;
  filterFun(priceVal, id);
};

//Data(filterCategory) matches
const filterCategory = function (e) {
  filterByPrice.value = "All";
  const id = e.target.id;
  const categoryVal = e.target.value;
  filterFun(categoryVal, id);
};

//Data removing event Callback
const removeBtn = function (e) {
  const li = e.target.parentElement.parentElement;
  if (e.target.classList.contains("delete")) removeData(li);
};

//eventListener
form.addEventListener("submit", formSubmit);
productList.addEventListener("click", removeBtn);
window.addEventListener("DOMContentLoaded", init);
filterByPrice.addEventListener("change", filterPrice);
filterByCategory.addEventListener("change", filterCategory);
