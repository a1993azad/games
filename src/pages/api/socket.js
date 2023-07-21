import { Server } from "socket.io";
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
let data = {};
let interval;
const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
    });
    res.socket.server.io = io;
    const shuffleWords = (name) => {
      let arrayOfWords = [];
      for (const key in data) {
        if (key !== name) {
          const element = data[key].ownWords;
          arrayOfWords = [
            ...arrayOfWords,
            ...element.filter((w) => {
              let reserved=false
              for (const key2 in data) {
                if (key2 !== name) {
                  if (data[key2].shuffledWords?.includes(w)) {
                    reserved= true;
                  }
                }
              }
              return !reserved;
            }),
          ];
        }
      }
      console.log(arrayOfWords)
      const shuffles = shuffle(arrayOfWords);
      data[name].shuffledWords = shuffles.slice(0, 5);
    };
    io.on("connection", (socket) => {
      // socket.on("addWord", (msg) => {
      //   console.log(msg)
      //   words.push(msg)
      //   socket.emit("update-input", msg);
      // });
      // socket.on("deleteWord", (msg) => {
      //   console.log(msg)
      //   words.splice(words.indexOf(msg),1)
      //   socket.emit("update-input", msg);
      // });
      socket.on("submit", (d) => {
        data[d.name] = { ownWords: d.words };
      });
      socket.on("getMyWords", (name) => {
        if (!data[name]) return;
        data[name].ready = true;
        
        let allReady = true;
        for (const key in data) {
          if (!data[key]["ready"] ) {
            allReady = false;
          }
        }
        console.log("allReady:", allReady);
        if (allReady) {
          setTimeout(()=>{

            for (const key in data) {
              shuffleWords(key);
              console.log(key, data[key]);
              socket.broadcast.emit("myWords_" + key, data[key].shuffledWords);
              socket.emit("myWords_" + key, data[key].shuffledWords);
            }
            data={}
          },2000)
        }
      });
    });
  }
  res.end();
};

export default SocketHandler;
