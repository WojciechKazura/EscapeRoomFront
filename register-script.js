var button=document.getElementById("save");
button.addEventListener("click",use);

function use(){
    var email=document.getElementById("email").value;
    var passord=document.getElementById("password").value;
    var playerName=document.getElementById("playerName").value;

    var request={
        email : email,
        password : passord,
        playerName : playerName
    }

    var json= JSON.stringify(request);
fetch("http://localhost:8080/api/v1/auth",{
    method:"POST",
    headers:{
        "Content-Type" : "application/json"
    },
    body:json

}).then(response=>response.json())
.then(data=>{

window.location.href="/escaperoomFrondend/home.html?id="+data.id;
}).catch(error=>console.error("error:"+error));





}

