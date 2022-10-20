//initiate server connection
const socket = io();

//search the url params and get the name of the player
const urlSearchParams = new URLSearchParams(window.location.search);
const playerName = urlSearchParams.get('playerName');

const room = urlSearchParams.get('room');

const mainHeadingTemplate = document.querySelector('#main-heading-template')
  .innerHTML;
const welcomeHeadingHTML = Handlebars.compile(mainHeadingTemplate);
document.querySelector('main').insertAdjacentHTML(
  'afterBegin',
  welcomeHeadingHTML({
    playerName,
  })
);

//inform the server that a user joined
socket.emit('join', { playerName, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
}
});

//client i.e browser listens for messages(events) and responds appropriately
socket.on("message", ({ playerName, text, createdAt }) => {
  
    const chatMessages = document.querySelector(".chat__messages");
  
    const messageTemplate = document.querySelector("#message-template").innerHTML;
  
    const template = Handlebars.compile(messageTemplate);
  
    const html = template({
      playerName,
      text,
      createdAt: moment(createdAt).format("h:mm a"),
    });
  
    chatMessages.insertAdjacentHTML("afterBegin", html);
});


//listen for room event from server which informs all clients of room events
socket.on("room", ({ room, players }) => {
  // target the container where we'll attach the info to
  const gameInfo = document.querySelector(".game-info");

  // target the Handlebars template we'll use to format the game info
  const sidebarTemplate = document.querySelector(
    "#game-info-template"
  ).innerHTML;

  // Compile the template into HTML by calling Handlebars.compile(), which returns a function
  const template = Handlebars.compile(sidebarTemplate);

  const html = template({
    room,
    players,
  });

  // set gameInfo container's html content to the new html
  gameInfo.innerHTML = html;
});