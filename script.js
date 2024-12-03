
var roomItems = [];
var playerItems = [];
var messageView = document.getElementById("messageView");
var itemsTable = document.getElementById("itemsTable");
var playerTable = document.getElementById("playerTable");
var urlParams = new URLSearchParams(window.location.search);
var id = urlParams.get("id");

refreshItems();

function refreshItems() {
    fetch("http://localhost:8080/api/v1/rooms?playerId=" + id, {
        method: "GET"
    }).then(response => response.json())
        .then(data => {
            roomItems = data;
            addItemsToItemsTable();
        }).catch(error => console.error("error:" + error));
}


function addItemsToItemsTable() {
    itemsTable.innerHTML = "";
    for (var item of roomItems) {
        var row = itemsTable.insertRow(-1);//-1 ozanacza to na koniec tabeli
        var cell = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell.innerHTML = item.name;
        var button = document.createElement("button");
        button.innerHTML = "Użyj";
        button.id = item.id;
        cell2.appendChild(button);
        button.addEventListener("click", use);
    }
}

function viePlayerItems() {
    playerTable.innerHTML = "";
    fetch("http://localhost:8080/api/v1/players/" + id, {
        method: "GET"
    }).then(response => response.json())
        .then(data => {
            playerItems = data.itemList;
            for (var item of playerItems) {
                var row = playerTable.insertRow(-1);
                var cell = row.insertCell(0);
                cell.innerHTML = item.name;
            }
            document.getElementById("howManyCoins").innerHTML = data.howManyCoins;
        }).catch(error => console.error("error:" + error));
}

function use(event) {
    var request = {
        itemId: event.target.id,
        playerId: id
    }
    var json = JSON.stringify(request);
    fetch("http://localhost:8080/api/v1/actions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: json

    }).then(response => response.json())
        .then(data => {
            messageView.innerHTML = data.text;
            viePlayerItems();
            refreshItems();

        }).catch(error => console.error("error:" + error));
}

