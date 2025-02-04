let gameId=0;
let activeRoom=0;
let source;
let links;
let nodes;
let isGame=false;

const buttonOne = document.getElementById("create");
buttonOne.addEventListener("click", use);

function use() {
  if(!isGame){
    isGame=true;
    createGame();
  }
}
var request = {
    name: "jeden",
    howManyRooms: 3
}

function createGame() {
    var json = JSON.stringify(request);
    fetch("http://localhost:8080/games", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: json
    }).then(response => response.json())
    .then(data => {
        links=data.connections;
        nodes=data.rooms;
        for(const link of links){
           link.source=link.from;
           link.target=link.to;
          }
        gameId=data.id;
        activeRoom=data.activeRoom;
        draw3dMap();
        console.log("create game with id: "+ gameId)
      }).catch(error => console.error(error.stack));
}

// Utworzenie kontenera SVG
const svg = d3.select('svg');

function nextActiveRoom(newActiveRoom){
const oldActiveRoomNode = document.getElementById(+activeRoom);
oldActiveRoomNode.classList.remove('active');
oldActiveRoomNode.classList.add('passive');
const newActiveRoomNode = document.getElementById(newActiveRoom);
newActiveRoomNode.classList.add('active');
newActiveRoomNode.classList.remove('passive');
activeRoom=newActiveRoom;
}

function changeActiveRoom(newActiveRoom){
  const url = new URL('http://localhost:8080/games/'+gameId+'/moves');
  url.searchParams.append('nextRoomId',newActiveRoom);
  fetch(url, {
      method: "POST"
  }).then(data => {
      if(!data.ok){
          throw new Error(`HTTP error! Status: ${data.status}`);
      }
          nextActiveRoom(newActiveRoom); //i tak to robi nawet jesli jest błąd 400
      }).catch(error => console.error("error:" + error.stack));  

}

function clickRoom(event){
  console.log("move to room of id: " + event.target.getAttribute("id") + " from room of id: " + activeRoom);
  changeActiveRoom(event.target.getAttribute("id"));
  }

function draw3dMap(){
startSymulation();
createRooms();
nextActiveRoom(activeRoom);
}

let simulation; 

// Utworzenie symulacji z dostosowanymi siłami
function startSymulation(){
  console.log(nodes)
  console.log(links)
  simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links)
    .id(d => d.id)
    .distance(50) // Zwiększenie odległości między połączonymi węzłami
    .strength(1))
  .force('charge', d3.forceManyBody()
    .strength(-50)) // Zwiększenie siły odpychania
  .force('center', d3.forceCenter(svg.attr('width') / 2, svg.attr('height') / 2))
  .force('collision', d3.forceCollide()
    .radius(30)) // Dodanie siły kolizji, aby zapobiec nakładaniu się węzłów
  .stop();
  // Uruchomienie symulacji przez określoną liczbę iteracji, aby uzyskać stabilny układ
  for (let i = 0; i < 300; ++i) simulation.tick();
}

function createRooms(){
// Dodanie krawędzi
const link = svg.append('g')
  .attr('class', 'links')
  .selectAll('line')
  .data(links)
  .enter().append('line')
  .attr('class', 'link')
  .attr('x1', d => d.source.x)
  .attr('y1', d => d.source.y)
  .attr('x2', d => d.target.x)
  .attr('y2', d => d.target.y);

// Dodanie węzłów
const node = svg.append('g')
  .attr('class', 'passive')
  .selectAll('circle')
  .data(nodes)
  .enter().append('circle')
  .attr('class', 'passive')
  .attr('r', 15)
  .attr('cx', d => d.x)
  .attr('cy', d => d.y)
  .attr('id', d => d.id)
  .on('click', clickRoom)
  .call(drag(simulation));
  


// Dodanie etykiet
const label = svg.append('g')
  .attr('class', 'labels')
  .selectAll('text')
  .data(nodes)
  .enter().append('text')
  .attr('x', d => d.x)
  .attr('y', d => d.y - 20)
  .attr('text-anchor', 'middle')
  .text(d => d.id);//ustawiamy treść w kółku

  // Aktualizacja pozycji przy każdym kroku symulacji
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
  
    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  
    label
      .attr('x', d => d.x)
      .attr('y', d => d.y-20);
  });
}

// Funkcje obsługi przeciągania
function drag(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}