function sleep(t) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, t)
    })
}
class Alert {
    constructor() {
        this.elem = document.createElement("div")
        this.elem.id = "alert"
    }
    async show(node) {
        this.elem.innerHTML = ""
        this.elem.appendChild(node)
        document.body.appendChild(this.elem)
        await sleep(0)
        this.elem.style.opacity = "1"
    }
    async close() {
        this.elem.style.opacity = "0"
        await sleep(500)
        this.elem.remove()
    }
}
class TTT {
    size = 300
    data = []
    newTile = null
    gameover = false
    constructor(container, board, reset, display) {
        this.container = container
        this.board = board
        this.reset = reset
        this.display = display
        this.currentToken = "x"
        this.init()
    }
    createToken(type, animate) {
        let token = document.createElement("span")
        token.className = "token"
        if (animate) token.style.animation = "bounce 500ms"
        if (type == "x") {
            token.classList.add("x")
            token.innerHTML = `<svg width="64" height="64" viewbox="0 0 64 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M15.002 1.147 32 18.145 48.998 1.147a3 3 0 0 1 4.243 0l9.612 9.612a3 3 0 0 1 0 4.243L45.855 32l16.998 16.998a3 3 0 0 1 0 4.243l-9.612 9.612a3 3 0 0 1-4.243 0L32 45.855 15.002 62.853a3 3 0 0 1-4.243 0L1.147 53.24a3 3 0 0 1 0-4.243L18.145 32 1.147 15.002a3 3 0 0 1 0-4.243l9.612-9.612a3 3 0 0 1 4.243 0Z" fill="#31C3BD" fillRule="evenodd"/></svg>`
        }
        else if (type == "o") {
            token.classList.add("o")
            token.innerHTML = `<svg width="64" height="64" viewbox="0 0 64 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M32 0c17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32C14.327 64 0 49.673 0 32 0 14.327 14.327 0 32 0Zm0 18.963c-7.2 0-13.037 5.837-13.037 13.037 0 7.2 5.837 13.037 13.037 13.037 7.2 0 13.037-5.837 13.037-13.037 0-7.2-5.837-13.037-13.037-13.037Z" fill="#F2B137"/></svg>`
        }
        else {
            return ""
        }
        return token
    }
    roundRestart() {
        this.data = Array.from({length: 9}, () => null)
        this.newTile = null
        this.gameover = false
        this.drawBoard()
    }
    restart() {
        this.score = {
            "you": 0,
            "tied": 0,
            "bot": 0
        }
        this.roundRestart()
    }
    init() {
        reset.addEventListener("click", () => {
            this.restart()
        })
        this.restart()
    }
    isGameOver() {
        // check rows
        let winner;
        let axis;
        let njData = nj.array(this.data.map(el => el == null ? undefined : el)).reshape(3, 3)
        if (this.newTile !== null) {
            let i = Math.floor(this.newTile / 3), j = this.newTile % 3
            let e = {
                "row": [],
                "col": [],
                "diag1": [],
                "diag2": []
            }
            // GETTING ROW
            njData.iteraxis(0, (x, id) => {if(id == i) e.row = x.tolist()})
            // GETTING COLUMN
            njData.iteraxis(1, (x, id) => {if(id == j) e.col = x.tolist()})
            // IF ON PRINCIPAL DIAGONAL
            if (i == j) {
                e.diag1 = njData.diag().tolist()
            }
            //IF ON ANTIDIAGONAL
            if (i + j == 2) {
                e.diag2 = njData.slice(null, [null, null, -1]).diag().tolist()
            }
            console.log(e)
            Object.entries(e).forEach(([type, arr]) => {
                if (arr.length > 0) {
                    // console.log(arr.every(tile => tile == this.switchTurn(this.currentToken)))
                    if (arr.every(tile => tile == this.switchTurn(this.currentToken))) {
                        winner = this.switchTurn(this.currentToken)
                        let a, b;
                        if (type == "col") {
                            a = (0 * 3) + j
                            b = (2 * 3) + j
                        }
                        else if (type == "row") {
                            a = (i * 3) + 0
                            b = (i * 3) + 2
                        }
                        else if (type == "diag1") {
                            a = 0
                            b = 8
                        }
                        else if (type == "diag2") {
                            a = 2
                            b = 6
                        }
                        axis = nj.arange(a, b+1, (b-a)/2).tolist()
                    }
                }
            })
            if (winner) {
                return {
                    winner,
                    axis
                }
            }
            if (this.data.every(t => (t != null))) {
                // TIE
                return {
                    winner: null,
                    axis
                }
            }
            return false
            
        }
        return false
    }
    switchTurn(x) {
        return x == "x" ? "o" : "x"
    }
    setScore() {
        Object.values(this.score).forEach((score, id) => {
            this.container.querySelectorAll("#score .btn")[id].querySelectorAll('span')[1].textContent = score.toString()
        })
    }
    drawBoard() {
        this.setScore()

        this.board.innerHTML = ""
        this.board.style.width = `${this.size}px`;
        this.data.forEach((el, id) => {
            let span = document.createElement("span")
            span.style.width = `${0.3*this.size}px`;
            if (el) {span.appendChild(this.createToken(el, this.newTile ==  null || this.newTile == id))}
            else {
                span.addEventListener("click", () => {
                    console.log(this.gameover)
                    if (!this.gameover) {
                        this.data[id] = this.currentToken
                        this.newTile = id
                        this.currentToken = this.switchTurn(this.currentToken)
                        this.drawBoard()
                    }
                })
            }
            board.append(span)
        })

        this.display.innerHTML = `${this.currentToken == 'x' ? `<svg width="64" height="64" viewbox="0 0 64 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M15.002 1.147 32 18.145 48.998 1.147a3 3 0 0 1 4.243 0l9.612 9.612a3 3 0 0 1 0 4.243L45.855 32l16.998 16.998a3 3 0 0 1 0 4.243l-9.612 9.612a3 3 0 0 1-4.243 0L32 45.855 15.002 62.853a3 3 0 0 1-4.243 0L1.147 53.24a3 3 0 0 1 0-4.243L18.145 32 1.147 15.002a3 3 0 0 1 0-4.243l9.612-9.612a3 3 0 0 1 4.243 0Z" fill="#a8bec9" fillRule="evenodd"/></svg>` : `<svg width="64" height="64" viewbox="0 0 64 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M32 0c17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32C14.327 64 0 49.673 0 32 0 14.327 14.327 0 32 0Zm0 18.963c-7.2 0-13.037 5.837-13.037 13.037 0 7.2 5.837 13.037 13.037 13.037 7.2 0 13.037-5.837 13.037-13.037 0-7.2-5.837-13.037-13.037-13.037Z" fill="#a8bec9"/></svg>`} TURN`
        this.gameOver()
    }
    async gameOver() {
        let e = this.isGameOver()
        if (!e) return
        this.gameover = true
        if (e.winner) {
            await sleep(1000)
            if (e.winner == "x") this.score.you++
            else if (e.winner == "o") this.score.bot++
            await this.animateEndGame(e, 1500)
        }
        else this.score.tied++
        myAlert.show(this.gameOverUI(e.winner))
        console.log("done")
    }
    gameOverUI(winner) {
        let div = document.createElement("div")
        div.id = "gameOver"
        div.className = winner
        let text1 = document.createElement("span")
        text1.textContent = winner ? "YOU WON!" : "IT'S A TIE"
        div.appendChild(text1)
        if (winner) {
            let span1 = document.createElement("span")
            span1.className = "winner"
            span1.innerHTML = (winner == "x" ? `<svg width="28" height="28" viewbox="0 0 64 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M15.002 1.147 32 18.145 48.998 1.147a3 3 0 0 1 4.243 0l9.612 9.612a3 3 0 0 1 0 4.243L45.855 32l16.998 16.998a3 3 0 0 1 0 4.243l-9.612 9.612a3 3 0 0 1-4.243 0L32 45.855 15.002 62.853a3 3 0 0 1-4.243 0L1.147 53.24a3 3 0 0 1 0-4.243L18.145 32 1.147 15.002a3 3 0 0 1 0-4.243l9.612-9.612a3 3 0 0 1 4.243 0Z" fill="#31C3BD" fillRule="evenodd"/></svg>` : `<svg width="28" height="28" viewbox="0 0 64 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M32 0c17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32C14.327 64 0 49.673 0 32 0 14.327 14.327 0 32 0Zm0 18.963c-7.2 0-13.037 5.837-13.037 13.037 0 7.2 5.837 13.037 13.037 13.037 7.2 0 13.037-5.837 13.037-13.037 0-7.2-5.837-13.037-13.037-13.037Z" fill="#F2B137"/></svg>`) + `TAKES THE ROUND`
            div.appendChild(span1)
        }
        let span2 = document.createElement("span")
        span2.className = "buttons"
        let quit = document.createElement("span")
        quit.textContent = "QUIT"
        quit.className = "btn"
        quit.addEventListener("click", e => {
            myAlert.close()
            this.restart()
        })
        span2.appendChild(quit)

        let next = document.createElement("span")
        next.textContent = "NEXT ROUND"
        next.className = "btn"
        next.addEventListener("click", e => {
            myAlert.close()
            this.roundRestart()
        })
        span2.appendChild(next)

        div.appendChild(span2)
        return div
    }
    animateEndGame(e, t) {
        let duration = t/3
        e.axis.forEach((el, id) => {
            this.board.children[el].querySelector(".token").style.transitionDelay = `${id * duration}ms`
            this.board.children[el].querySelector(".token").style.transitionDuration = `${duration}ms`
            this.board.children[el].querySelector(".token").classList.add("focus")
        })
        let timeline = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, t)
        })
        return timeline
    }
}

let myAlert = new Alert()

let container = document.getElementById("ttt")
let board = container.querySelector("#board")
let reset = document.getElementById("restart")
let turn_display = document.getElementById("turn_display")
const tictactoe = new TTT(container, board, reset, turn_display)