 const tokenProvider = new Chatkit.TokenProvider({
  url: "https://us1.pusherplatform.io/services/chatkit_token_provider/v1/81941ebe-9108-491a-9404-a72023fce067/token"
});
 
 const chatManager = new Chatkit.ChatManager({
  instanceLocator: "v1:us1:81941ebe-9108-491a-9404-a72023fce067",
  userId: "a@a.com",
  tokenProvider: tokenProvider
});

 chatManager
 .connect()
 .then(currentUser => {
  currentUser.subscribeToRoom({
    roomId: 7736048,
    hooks: {
      onNewMessage: message => {
        const ul = document.getElementById("message-list");
        const li = document.createElement("li");
        li.appendChild(
          document.createTextNode(`${message.sender.name}: ${message.text}`)
          );
        ul.appendChild(li);
      }
    }
  });

  const form = document.getElementById("message-form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const input = document.getElementById("message-text");
    currentUser.sendMessage({
      text: input.value,
      roomId: 7736048
    });
    input.value = "";
  });
})
 .catch(error => {
  console.error("error:", error);
});