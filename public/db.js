let db;
const request =  window.indexedBD.open("budget", 1);
// create a new db request for a "budget" database.

request.onupgradeneeded = function(event) {
  // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;

  // Creates an object store with a listID keypath that can be used to query on.
  const toDoListStore = db.createObjectStore("toDoList", {
    keyPath: "listID", autoIncrement = true  // Create schema

  });
  // Creates a statusIndex that we can query on.
  toDoListStore.createIndex("statusIndex", "status");
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  // log error here
  console.log(target.result.errorCode + "error");
};

function saveRecord(record) {
  const db = request.result
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const pendingStore = transaction.ObjectStore("pending");
  // add record to your store with add method.
  pendingStore.add({ pending: "record"});
}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const pendingStore = transaction.ObjectStore("pending");
  // get all records from store and set to a variable
  const getAll =  pendingStore.getAll()

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(["pending", "readqrite"])
          // access your pending object store
          const pendingStore = transaction.ObjectStore("pending")
          // clear all items in your store
          pendingStore.clear()
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);