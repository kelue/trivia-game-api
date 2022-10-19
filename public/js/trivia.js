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