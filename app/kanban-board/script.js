// DOM Elements
const addBtns = document.querySelectorAll(".add-btn:not(.solid)");
const saveItemBtns = document.querySelectorAll(".solid");
const addItemContainers = document.querySelectorAll(".add-container");
const addItems = document.querySelectorAll(".add-item");
const exportBtn = document.getElementById("export-btn");
const importFile = document.getElementById("import-file");

// Item Lists
const listColumns = document.querySelectorAll(".drag-item-list");
const backlogListEl = document.getElementById("to-do-list");
const progressListEl = document.getElementById("doing-list");
const completeListEl = document.getElementById("done-list");
const onHoldListEl = document.getElementById("on-hold-list");

// Column Headers
const columnHeaders = document.querySelectorAll(".header h1");

// Items
let updatedOnLoad = false;

// Initialize Arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [];

// Initialize Column Names
let columnNames = ["To Do", "Doing", "Done", "On Hold"];

// Drag Functionality
let draggedItem;
let dragging = false;
let currentColumn;

// Get saved data from localStorage
function getSavedColumns() {
    // Get items
    if (localStorage.getItem("backlogItems")) {
        backlogListArray = JSON.parse(localStorage.backlogItems);
        progressListArray = JSON.parse(localStorage.progressItems);
        completeListArray = JSON.parse(localStorage.completeItems);
        onHoldListArray = JSON.parse(localStorage.onHoldItems);
    } else {
        // Default items
        backlogListArray = ["Create a new task", "Plan the project"];
        progressListArray = ["Work in progress"];
        completeListArray = ["Completed task"];
        onHoldListArray = ["Waiting for review"];
    }
    
    // Get column names
    if (localStorage.getItem("columnNames")) {
        columnNames = JSON.parse(localStorage.columnNames);
    }
    
    // Update column headers
    columnHeaders.forEach((header, index) => {
        header.textContent = columnNames[index];
    });
}

// Save data to localStorage
function updateSavedColumns() {
    // Save items
    listArrays = [
        backlogListArray,
        progressListArray,
        completeListArray,
        onHoldListArray
    ];
    
    const arrayNames = ["backlog", "progress", "complete", "onHold"];
    arrayNames.forEach((arrayName, index) => {
        localStorage.setItem(`${arrayName}Items`, JSON.stringify(listArrays[index]));
    });
    
    // Save column names
    columnNames = Array.from(columnHeaders).map(header => header.textContent);
    localStorage.setItem("columnNames", JSON.stringify(columnNames));
}

// Filter array to remove empty values
function filterArray(array) {
    return array.filter(item => item !== null && item.trim() !== "");
}

// Create DOM elements for each list item
function createItemEl(columnEl, column, item, index) {
    const listEl = document.createElement("li");
    listEl.textContent = item;
    listEl.id = index;
    listEl.classList.add("drag-item");
    listEl.draggable = true;
    listEl.setAttribute("onfocusout", `updateItem(${index}, ${column})`);
    listEl.setAttribute("ondragstart", "drag(event)");
    listEl.contentEditable = true;
    columnEl.appendChild(listEl);
}

// Update the DOM
function updateDOM() {
    // Check localStorage once
    if (!updatedOnLoad) {
        getSavedColumns();
    }
    
    // Update columns
    updateColumn(backlogListEl, 0, backlogListArray);
    updateColumn(progressListEl, 1, progressListArray);
    updateColumn(completeListEl, 2, completeListArray);
    updateColumn(onHoldListEl, 3, onHoldListArray);
    
    // Set updatedOnLoad to true and update localStorage
    updatedOnLoad = true;
    updateSavedColumns();
}

// Helper function to update a single column
function updateColumn(columnEl, columnIndex, columnArray) {
    columnEl.textContent = "";
    columnArray.forEach((item, index) => {
        createItemEl(columnEl, columnIndex, item, index);
    });
    columnArray = filterArray(columnArray);
}

// Update item - delete if empty, or update array value
function updateItem(id, column) {
    const selectedArray = listArrays[column];
    const selectedColumn = listColumns[column].children;
    
    if (!dragging) {
        if (!selectedColumn[id].textContent.trim()) {
            delete selectedArray[id];
        } else {
            selectedArray[id] = selectedColumn[id].textContent;
        }
        updateDOM();
    }
}

// Add to column list and reset textbox
function addToColumn(column) {
    const itemText = addItems[column].textContent.trim();
    if (itemText) {
        const selectedArray = listArrays[column];
        selectedArray.push(itemText);
        addItems[column].textContent = "";
        updateDOM();
    }
}

// Show add item input box
function showInputBox(column) {
    addBtns[column].style.visibility = "hidden";
    saveItemBtns[column].style.display = "flex";
    addItemContainers[column].style.display = "flex";
    addItems[column].focus();
}

// Hide item input box
function hideInputBox(column) {
    addBtns[column].style.visibility = "visible";
    saveItemBtns[column].style.display = "none";
    addItemContainers[column].style.display = "none";
    addToColumn(column);
}

// Rebuild arrays to reflect drag and drop items
function rebuildArrays() {
    backlogListArray = Array.from(backlogListEl.children).map(item => item.textContent);
    progressListArray = Array.from(progressListEl.children).map(item => item.textContent);
    completeListArray = Array.from(completeListEl.children).map(item => item.textContent);
    onHoldListArray = Array.from(onHoldListEl.children).map(item => item.textContent);
    updateDOM();
}

// Export data to JSON file
function exportData() {
    const data = {
        columnNames: Array.from(columnHeaders).map(header => header.textContent),
        backlogItems: backlogListArray,
        progressItems: progressListArray,
        completeItems: completeListArray,
        onHoldItems: onHoldListArray
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import data from JSON file
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.columnNames && data.backlogItems && data.progressItems && data.completeItems && data.onHoldItems) {
                // Update column headers
                columnHeaders.forEach((header, index) => {
                    if (data.columnNames[index]) {
                        header.textContent = data.columnNames[index];
                    }
                });
                
                // Update arrays
                backlogListArray = data.backlogItems;
                progressListArray = data.progressItems;
                completeListArray = data.completeItems;
                onHoldListArray = data.onHoldItems;
                
                updateDOM();
                alert("Data imported successfully!");
            } else {
                alert("Invalid file format. Please import a valid Kanban Board export file.");
            }
        } catch (error) {
            console.error("Error parsing JSON:", error);
            alert("Error parsing the file. Please make sure it's a valid JSON file.");
        }
    };
    reader.readAsText(file);
}

// Drag and drop functions
function dragEnter(column) {
    listColumns[column].classList.add("over");
    currentColumn = column;
}

function drag(e) {
    draggedItem = e.target;
    dragging = true;
}

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const parent = listColumns[currentColumn];
    
    // Remove background color/padding
    listColumns.forEach(column => {
        column.classList.remove("over");
    });
    
    // Add item to column
    parent.appendChild(draggedItem);
    
    // Dragging complete
    dragging = false;
    rebuildArrays();
}

// Event Listeners
exportBtn.addEventListener("click", exportData);

importFile.addEventListener("change", (e) => {
    if (e.target.files.length) {
        importData(e.target.files[0]);
        e.target.value = ""; // Reset input
    }
});

// Make column headers editable and save on blur
columnHeaders.forEach((header, index) => {
    header.addEventListener("blur", () => {
        updateSavedColumns();
    });
});

// On Load
updateDOM();