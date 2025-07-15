console.log('Lets write js');

let currentSong = new Audio();//global variable
let songs;
let currFolder;
let mode = "normal";
let play = document.getElementById("play");
let previous = document.getElementById("previous");
let next = document.getElementById("next");
let currentIndex = 0;




function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}/`)[1])

        }
    }
    // show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + ` <li>
                        <img class="invert" src="svg/music.svg" alt="" >
                        <div class="info">
                            <div> ${decodeURIComponent(song)}</div>

                            

                            <div>Song artist</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img class="invert" src="svg/play.svg" >
                        </div></li>`;
    }


    //attach an eventlistener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })

    })
    return songs
}

const playMusic = (track, pause = false) => {
    //let audio=new Audio("/songs/"+ track)
    currentSong.src = `${currFolder}/` + track;

    currentIndex = songs.indexOf(track);
    if (!pause) {
        currentSong.play();
        play.src = "svg/pause.svg"
    }


    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"


}

async function displayAlbums() {
    let a = await fetch(`songs/songs.json`);
    let folders = await a.json();
    let cardContainer = document.querySelector(".cardContainer");

    for (let folderData of folders) {
        let folder = folderData.folder;

        // Fetch info.json from inside each folder
        let infoRes = await fetch(`songs/${folder}/info.json`);
        let info = await infoRes.json();

        cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play"><img src="svg/playG.svg" alt=""></div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${info.title}</h2>
                <p>${info.description}</p>
            </div>`;
    }

    // Attach event listeners to album cards
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        });
    });


  


}

async function main() {


    //get the list of all the songs

    // await getSongs("songs/ncs")
    // console.log(songs)
    // playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()

    // attach an eventlistener to play and pause the card


    //attach an eventlistener to play, next and prev
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "svg/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "svg/play.svg"
        }
    })

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML =
                `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
            document.querySelector(".circle").style.left =
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });


    //add an event listener to seek bar\
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //add eventListener for close button
    document.querySelector(".close").addEventListener('click', () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add eventlistener to prev and next
    previous.addEventListener("click", () => {
        console.log("previous clicked")
        console.log(currentSong)
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if (mode === "loop") {
            playMusic(songs[index]);
        }

        else if (mode === "shuffle") {
            let randomIndex = Math.floor(Math.random() * songs.length);
            playMusic(songs[randomIndex]);
        }
        else {
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1])
            }
        }

    })

    next.addEventListener("click", () => {
        console.log("next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if (mode === "loop") {
            playMusic(songs[index]);
        }

        else if (mode === "shuffle") {
            let randomIndex = Math.floor(Math.random() * songs.length);
            playMusic(songs[randomIndex]);
        }
        else {

            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1])
            }
            else {
                playMusic(songs[0]);
            }
        }
    })

    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    })
    //add the event listener to mute the volume
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("svg/volume.svg")) {
            e.target.src = e.target.src.replace("svg/volume.svg", "svg/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("svg/mute.svg", "svg/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
    //add eventlistenr to loop
    let normalBtn = document.querySelector(".normal");

    normalBtn.addEventListener("click", () => {
        if (normalBtn.src.includes("svg/normal.svg")) {
            normalBtn.src = "svg/loop.svg"
            mode = "loop";

        }
        else if (normalBtn.src.includes("svg/loop.svg")) {
            normalBtn.src = "svg/shuffle.svg"
            mode = "shuffle";

        }
        else {

            normalBtn.src = "svg/normal.svg"
            mode = "normal";

        }

        normalBtn.classList.remove("mode-active"); // always reset
        if (mode !== "normal") {
            normalBtn.classList.add("mode-active");
        }
    })

    //autoplay nextsong when current song ends
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if (mode === "loop") {
            playMusic(songs[index]);
        }

        else if (mode === "shuffle") {
            let randomIndex = Math.floor(Math.random() * songs.length);
            playMusic(songs[randomIndex]);
        }

        else {
            if (index + 1 < songs.length) {
                playMusic(songs[index + 1]);
            }
            else {
                playMusic(songs[0]);
            }
        }
    })
  



}
main()

