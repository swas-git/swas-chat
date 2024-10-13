// chatgenius_web.js

// Declare a namespace for ChatGenius
const ChatGenius = (function() {
    let config = {};  // Store configuration
  
    // Initialize method for ChatGenius module
  async function init(options) {
    if (!options.ChatGeniusID || !options.ChatGeniusHost) {
      console.error("ChatGeniusID and ChatGeniusHost are required.");
      return;
    }

    // Save configuration
    config.ChatGeniusID = options.ChatGeniusID;
    config.ChatGeniusHost = options.ChatGeniusHost;
    config.CurrentDomain = window.location.origin;


    if(options.title === ''){
        config.header = 'ChatGenius';
    }
    config.header = options.title;
    config.subhead = options.subhead;
    
    // Validate the credentials via the backend
    const isValid = await validateCredentials(config.ChatGeniusID, config.ChatGeniusHost, config.CurrentDomain);

    if (isValid) {
      // If validation succeeds, proceed with setting up the widget
      setupWidget();
    } else {
      console.error("Invalid ChatGeniusID or ChatGeniusHost.");
    }
  }

    // Validate ChatGeniusID and ChatGeniusHost with the backend
    async function validateCredentials(ChatGeniusID, ChatGeniusHost, CurrentDomain) {
        try {
        const response = await fetch('http://72.167.151.51/chat-genious/api/v1/project/validate-connection', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            ChatGeniusID: ChatGeniusID,
            ChatGeniusHost: ChatGeniusHost,
            CurrentDomain: CurrentDomain
            })
        });

        const data = await response.json();

        if (data.isValid) {
            return true;
        } else {
            return false;
        }       
        } catch (error) {
          console.error("Error validating credentials:", error);
        return false;
        }
    }

  
    // Function to create and append the chatbot widget to the page
    function setupWidget() {
       console.log("Initializing widget with", config.ChatGeniusID, config.ChatGeniusHost);
      const ChatContainer = document.createElement("chat_genius_section");
      const style = document.createElement("style");
      style.textContent = `
      /* Import Google font - Poppins */
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
      chat_genius_section * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
      }
      chat_genius_section .chatbot-toggler {
          position: fixed;
          bottom: 30px;
          right: 35px;
          outline: none;
          border: none;
          height: 50px;
          width: 50px;
          display: flex;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #724ae8;
          transition: all 0.2s ease;
          z-index:999;
      }
      chat_genius_section.show-chatbot .chatbot-toggler {
          transform: rotate(90deg);
      }
      chat_genius_section .chatbot-toggler span {
          color: #fff;
          position: absolute;
          top:10px;
      }
      chat_genius_section .chatbot-toggler span:last-child,
      chat_genius_section.show-chatbot .chatbot-toggler span:first-child {
          opacity: 0;
      }
      chat_genius_section.show-chatbot .chatbot-toggler span:last-child {
          opacity: 1;
      }
      chat_genius_section .subhead {
    font-size: 10px;
    text-align: center;
    line-height: 14px;
    margin-top: 5px;
}
      chat_genius_section .chatbot {
          position: fixed;
          right: 35px;
          bottom: 90px;
          width: 420px;
          background: #fff;
          border-radius: 15px;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          transform: scale(0.5);
          transform-origin: bottom right;
          box-shadow: 0 0 128px 0 rgba(0,0,0,0.1),
                      0 32px 64px -48px rgba(0,0,0,0.5);
          transition: all 0.1s ease;
          font-family: "Poppins", sans-serif;
      }
      chat_genius_section.show-chatbot .chatbot {
          opacity: 1;
          pointer-events: auto;
          transform: scale(1);
          z-index:999;
      }
      chat_genius_section .chatbot header {
          padding: 10px;
          position: relative;
          text-align: center;
          color: #fff;
          background: #724ae8;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      chat_genius_section .chatbot header span {
          position: absolute;
          right: 15px;
          top: 50%;
          display: none;
          cursor: pointer;
          transform: translateY(-50%);
      }
      chat_genius_section header h2 {
            font-size: 1.5rem;
            margin: 0px !important;
            color: #fff;
            font-weight: bold;
            line-height: 20px;
        }
      chat_genius_section .chatbot .chatbox {
          overflow-y: auto;
          height: 500px;
          padding: 10px 10px 100px;
      }
      chat_genius_section .chatbot :where(.chatbox, textarea)::-webkit-scrollbar {
          width: 6px;
      }
      chat_genius_section .chatbot :where(.chatbox, textarea)::-webkit-scrollbar-track {
          background: #fff;
          border-radius: 25px;
      }
      chat_genius_section .chatbot :where(.chatbox, textarea)::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 25px;
      }
      chat_genius_section .chatbox .chat {
          display: flex;
          list-style: none;
      }
      chat_genius_section .chatbox .outgoing {
          margin: 5px 0;
          justify-content: flex-end;
          
      }
   
      chat_genius_section .chatbox .chat p {
          padding: 8px 12px;
          border-radius: 10px 10px 0 10px;
          max-width: 80%;
          color: #fff;
          font-size: 0.80rem;
          background: #724ae8;
          min-width:20%;
      }
      chat_genius_section .chatbox .incoming p {
          border-radius: 10px 10px 10px 0;
      }
      chat_genius_section .chatbox .chat p.error {
          color: #721c24;
          background: #f8d7da;
      }
      chat_genius_section .chatbox .incoming p {
          color: #000;
          background: #f2f2f2;
          font-size:13px;
          line-height:18px;
      }
      chat_genius_section .chatbot .chat-input {
          display: flex;
          gap: 5px;
          position: absolute;
          bottom: 20px;
          width: 100%;
          background: #fff;
          padding: 3px 20px;
          border-top: 1px solid #ddd;
      }
      chat_genius_section .chatbot .chat-footer {
          display: flex;
          position: absolute;
          bottom: 0;
          width: 100%;
          background: #fff;
          padding: 3px 20px;
      }
      chat_genius_section .chatbot .chat-footer p {
          font-size: 12px;
          color: #ccc;
          text-align: center;
          width: 100%;
      }
      chat_genius_section .chatbot .chat-footer p a{color: #ccc;}
      chat_genius_section .chat-input textarea {
          height: 55px;
          width: 100%;
          border: none;
          outline: none;
          resize: none;
          max-height: 180px;
          padding: 10px;
          font-size: 0.85rem;
      }
      chat_genius_section .chat-input span {
          align-self: flex-end;
          color: #724ae8;
          cursor: pointer;
          height: 55px;
          display: flex;
          align-items: center;
          visibility: hidden;
          font-size: 1.35rem;
      }
      chat_genius_section .chat-input textarea:valid ~ span {
          visibility: visible;
      }
      @media (max-width: 490px) {
          chat_genius_section .chatbot-toggler {
              right: 20px;
              bottom: 20px;
          }
          chat_genius_section .chatbot {
              right: 0;
              bottom: 0;
              height: 100%;
              border-radius: 0;
              width: 100%;
          }
          chat_genius_section .chatbot .chatbox {
              height: 90%;
              padding: 25px 15px 100px;
          }
          chat_genius_section .chatbot .chat-input {
              padding: 5px 15px;
          }
          chat_genius_section .chatbot header span {
              display: block;
          }
      }

      .typing-indicator {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 13px;


}
     .typing-indicator .agentType{
      background: unset !important;
    color: #000 !important;

     }

.typing-indicator .dots {
  font-weight: bold;
  font-size: 16px;
  animation: blink 1s infinite;
  margin-left: 2px;

}

.typing-indicator .dots:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator .dots:nth-child(3) {
  animation-delay: 0.4s;
}

.typing-indicator .dots:nth-child(4) {
  animation-delay: 0.6s;
}
.typing-indicator .dots:nth-child(5) {
  animation-delay: 0.8s;
}


@keyframes blink {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.chat_response{
  margin-top: 10px;
  text-align: center;
}
.chat_response svg {
  margin-right: 10px;
  font-size: 16px;
  cursor: pointer;
}
.chat_response svg:hover{
color:#5A5EB9;
}

      `;
  
      const chatbotHTML = `
          <button class="chatbot-toggler">
              <span class="open-chat">
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-chat-fill" viewBox="0 0 16 16">
                      <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9 9 0 0 0 8 15"/>
                  </svg>
              </span>
              <span class="close-chat">
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                  </svg>
              </span>
          </button>
          <div class="chatbot">
              <header>
                  <h2>`+config.header+`</h2>
                  <p class="subhead">`+config.subhead+`</p>
                  <span class="close-btn">close</span>
              </header>
              <ul class="chatbox">
                  <li class="chat incoming">
                      <p>Hi there ðŸ‘‹<br>How can I help you today?</p>
                  </li>
              </ul>
              <div class="chat-input">
                  <textarea placeholder="Enter a message..." spellcheck="false" required></textarea>
                  <span id="send-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
                          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                      </svg>
                  </span>
              </div>
              <div class="chat-footer">
                  <p>Powered by <a href="https://www.chatgeniusai.com/" target="_blank">www.chatgeniusai.com</a></p>
              </div>
          </div>
      `;
  
      ChatContainer.innerHTML = chatbotHTML;
  
      // Append the styles inside chat_genius_section
      ChatContainer.appendChild(style);
  
      // Append the whole chat_genius_section to the body
      document.body.appendChild(ChatContainer);
    

      // 5. Attach event listeners after the DOM elements have been appended
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    // Set up initial variables
    let userMessage = null;
    const inputInitHeight = chatInput.scrollHeight;

    // 6. Function to create a new chat message in the chatbox
    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        chatLi.innerHTML = `<p>${message}</p>`;
        return chatLi;
    };

    // 7. Function to generate chatbot response (mock)
    const generateResponse = (chatElement, userMsg) => {

        const chatTextId = `${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;
        const messageElement = chatElement.querySelector("p");
        messageElement.id = chatTextId;
        const data = { message: userMsg, chatID: config.ChatGeniusID, };   

        fetch('https://chatgeniusai.com/dev/chatweb/chat_genius_web_chat.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        })
        .then(response => response.json())  // Parse the JSON response
        .then(responseData => {
            messageElement.innerHTML = responseData.response;  
            const links = document.querySelectorAll(`p#${chatTextId} a`);
            links.forEach(link => {
                link.setAttribute('target', '_blank');
            });

           messageElement.innerHTML += '<div class="chat_response" id="'+chatTextId+'"><svg chatrowID="'+chatTextId+'"  rowID='+responseData.row_ID+' id="good_response" title="Good Response" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16"><path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/></svg><svg chatrowID="'+chatTextId+'" rowID='+responseData.row_ID+' id="bad_response" title="Bad Response" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-down" viewBox="0 0 16 16"><path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1"/></svg></div>'
            chatInput.removeAttribute("disabled");
            chatbox.scrollTop = chatbox.scrollHeight;
        })
        .catch(error => {
            messageElement.textContent = "System is currently down for maintanaince. Please try after sometime and sorry for the inconvinience";
            console.error('Error:', error);
        });
    };

    // 8. Handle sending a chat message
    const handleChat = () => {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Clear the input textarea and reset its height
        chatInput.value = "";
        chatInput.style.height = `${inputInitHeight}px`;

        // Add the user's message to the chatbox
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        const incomingChatLi = createChatLi("<span class='typing-indicator'> <span class='agentType'>Agent is typing  </span> <span class='dots'>.</span> <span class='dots'>.</span> <span class='dots'>.</span><span class='dots'>.</span> </span>", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        chatInput.setAttribute("disabled", "true");

        generateResponse(incomingChatLi, userMessage);
    };

    // 9. Event listeners for interactions
    chatInput.addEventListener("input", () => {
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });

    sendChatBtn.addEventListener("click", handleChat);

    closeBtn.addEventListener("click", () => document.querySelector("chat_genius_section").classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", () => document.querySelector("chat_genius_section").classList.toggle("show-chatbot"));


    document.addEventListener("click", function(event) {
        if (event.target.matches(".chat_response svg#good_response")) {
            // Get the chatrowID attribute from the clicked element
            const chatrowID = event.target.getAttribute("chatrowid");
            const rowID = event.target.getAttribute("rowid");

            // Find the good_response element in the specific row and update its classes
            const resposnseElement = document.querySelector(`div#${chatrowID}`);
            const goodResponseElement = document.querySelector(`div#${chatrowID} #good_response`);
            if (goodResponseElement) {
                goodResponseElement.remove();
                resposnseElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16"><path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/></svg>';
            }
    
            // Remove the bad_response element in the specific row
            const badResponseElement = document.querySelector(`div#${chatrowID} #bad_response`);
            if (badResponseElement) {
                badResponseElement.remove();
            }
    
            // Get the rowID attribute from the clicked element
            const data_up = { rowID: rowID, chat_response: "thumbs_up" };   
            // Send an AJAX request using fetch
            fetch('https://chatgeniusai.com/dev/chatweb/chat_genius_web_response.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data_up),
            })
            .then(response => {
                if (response.ok) {
                    console.log("updated");
                } else {
                    console.log("Failed to update");
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }

        if (event.target.matches(".chat_response svg#bad_response")) {
            // Get the chatrowID attribute from the clicked element
            const chatrowID = event.target.getAttribute("chatrowid");
            const rowID = event.target.getAttribute("rowid");

            // Find the good_response element in the specific row and update its classes
            const resposnseElement = document.querySelector(`div#${chatrowID}`);
            const badResponseElement = document.querySelector(`div#${chatrowID} #bad_response`);
            if (badResponseElement) {
                badResponseElement.remove();
                resposnseElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-down-fill" viewBox="0 0 16 16"><path d="M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.38 1.38 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51q.205.03.443.051c.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.9 1.9 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2 2 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.2 3.2 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.8 4.8 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591"/></svg>';
            }
    
            // Remove the bad_response element in the specific row
            const goodResponseElement = document.querySelector(`div#${chatrowID} #good_response`);
            if (goodResponseElement) {
                goodResponseElement.remove();
            }
    
            // Get the rowID attribute from the clicked element
            const data_down = { rowID: rowID, chat_response: "thumbs_down" };   
            // Send an AJAX request using fetch
            fetch('chat_genius_web_response.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data_down),
            })
            .then(response => {
                if (response.ok) {
                    console.log("updated");
                } else {
                    console.log("Failed to update");
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }

    });

    
  
    // Log message to confirm setup
    console.log("ChatGenius widget initialized.");
    }
  
    // Public API to expose the init method
    return {
      init: init
    };
  })();
  export default ChatGenius;
