console.log("Lets write JS");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all songs in the Playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let displaySongName = decodeURIComponent(song);
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${displaySongName.replaceAll(".mp3", "")}</div>
                                <div>Osama</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>  </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", element => {
            playMusic(songs[index]);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play().catch(e => console.log("Playback error:", e));
        document.getElementById("play").src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track).replaceAll(".mp3", "");
    document.querySelector(".songtime").innerHTML = "0:00 / 0:00";
}

async function displayAlbums(){
    try {
        let a = await fetch(`/songs/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        
        Array.from(anchors).forEach(e => {
            if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
                let folder = e.href.split("/").slice(-2)[0];
                console.log("Found album folder:", folder);
            }
        });
    } catch (error) {
        console.log("Error displaying albums:", error);
    }
}

async function main() {
    // Get list of all songs initially
    await getSongs("songs/ncs");
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    // Display all the albums on the page
    await displayAlbums();

    let playBtn = document.getElementById("play");
    let previousBtn = document.getElementById("previous");
    let nextBtn = document.getElementById("next");

    // Attach event listeners to the play, next and previous buttons
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            playBtn.src = "img/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    // Add event listener for seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        const rect = e.target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (!isNaN(currentSong.duration)) {
            currentSong.currentTime = percent * currentSong.duration;
            document.querySelector(".circle").style.left = percent * 100 + "%";
        }
    });

    // Add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    
    // Add event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Add event listener for previous button
    previousBtn.addEventListener("click", () => {
        console.log("Previous button clicked");
        let currentFileName = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentFileName);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Add event listener for next button
    nextBtn.addEventListener("click", () => {
        console.log("Next button clicked");
        let currentFileName = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentFileName);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Add an event for volume change
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
           songs = await getSongs(item.currentTarget.dataset.folder);
           if (songs.length > 0) {
               playMusic(songs[0]);
           }
        });
    });
}

main();