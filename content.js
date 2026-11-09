// INJETAR O SCRIPT NA PÁGINA (OBRIGATÓRIO)

const script = document.createElement("script")
script.src = chrome.runtime.getURL("injetor_pagina.js")

script.onload = () => {
  if (script.parentNode) {
    script.parentNode.removeChild(script)
  }
}

(document.head || document.documentElement).appendChild(script)


// CRIAR SIDEBAR + BOTÃO PROFISSIONAL

function createSidebar(){

  if(document.getElementById("wa-sales-sidebar")) return

  /* SIDEBAR */

  const iframe = document.createElement("iframe")

  iframe.src = chrome.runtime.getURL("sidebar.html")
  iframe.id = "wa-sales-sidebar"
  iframe.allow = "clipboard-write"

  iframe.style.position = "fixed"
  iframe.style.right = "-320px"
  iframe.style.top = "0"
  iframe.style.width = "320px"
  iframe.style.height = "100%"
  iframe.style.border = "none"
  iframe.style.zIndex = "999999"
  iframe.style.transition = "right 0.3s ease"


  /* BOTÃO PROFISSIONAL */

  const button = document.createElement("div")

  button.id = "wa-open-button"

  button.style.position = "fixed"
  button.style.right = "20px"
  button.style.bottom = "20px"
  button.style.width = "60px"
  button.style.height = "60px"
  button.style.background = "#0b1220"
  button.style.borderRadius = "50%"
  button.style.display = "flex"
  button.style.alignItems = "center"
  button.style.justifyContent = "center"
  button.style.cursor = "grab"
  button.style.zIndex = "999999"
  button.style.boxShadow = "0 10px 30px rgba(0,0,0,0.30), inset 0 0 0 1px rgba(59,130,246,0.35)"
  button.style.transition = "all 0.2s ease"

  /* ÍCONE SVG */

  button.innerHTML = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M21 12c0 4.418-4.03 8-9 8-1.07 0-2.1-.17-3.05-.48L3 21l1.6-4.6C3.6 15.2 3 13.66 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          stroke="#60a5fa"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"/>
  </svg>
  `

  /* HOVER */

  button.onmouseenter = () => {
    button.style.transform = "scale(1.08)"
    button.style.boxShadow = "0 14px 34px rgba(0,0,0,0.38), inset 0 0 0 1px rgba(59,130,246,0.55)"
  }

  button.onmouseleave = () => {
    button.style.transform = "scale(1)"
    button.style.boxShadow = "0 10px 30px rgba(0,0,0,0.30), inset 0 0 0 1px rgba(59,130,246,0.35)"
  }


  /* ARRASTAR */

  let isDragging = false
  let offsetX = 0, offsetY = 0
  let startX = 0, startY = 0
  let moved = false

  button.addEventListener("mousedown",(e)=>{
    // Só considerar arraste quando o ponteiro realmente sair do lugar.
    isDragging = true
    moved = false
    startX = e.clientX
    startY = e.clientY
    offsetX = e.clientX - button.getBoundingClientRect().left
    offsetY = e.clientY - button.getBoundingClientRect().top
    button.style.cursor = "grabbing"
  })

  document.addEventListener("mousemove",(e)=>{
    if(!isDragging) return

    const distance = Math.hypot(e.clientX - startX, e.clientY - startY)
    if(distance > 5) moved = true
    if(!moved) return

    button.style.left = (e.clientX - offsetX) + "px"
    button.style.top = (e.clientY - offsetY) + "px"
    button.style.right = "auto"
    button.style.bottom = "auto"
  })

  document.addEventListener("mouseup",()=>{
    if(!isDragging) return

    isDragging = false
    button.style.cursor = "grab"

    // Se foi clique, não reposicionar o botão; o evento click abrirá a extensão.
    if(!moved) return

    // Efeito ímã lateral após arraste.
    const screenWidth = window.innerWidth
    const rect = button.getBoundingClientRect()
    if(rect.left < screenWidth / 2){
      button.style.left = "10px"
    } else {
      button.style.left = (screenWidth - 70) + "px"
    }
  })

  /* CLICK: abrir painel se não houve arraste real */
  button.addEventListener("click",()=>{
    if(moved) {
      moved = false
      return
    }

    iframe.style.right = "0px"
    button.style.display = "none"
  })


  document.body.appendChild(iframe)
  document.body.appendChild(button)
}


// FECHAR SIDEBAR

window.addEventListener("message",(event)=>{

  const iframe = document.getElementById("wa-sales-sidebar")
  const button = document.getElementById("wa-open-button")

  if(event.data === "closeSidebar"){
    iframe.style.right="-320px"
    button.style.display="flex"
  }

})


// ESPERAR WHATSAPP CARREGAR

function waitForWhatsApp(){

  const interval = setInterval(()=>{

    if(document.body){

      createSidebar()
      clearInterval(interval)

    }

  },1000)

}

waitForWhatsApp()


// COPIAR IMAGEM (precisa rodar aqui, no frame de web.whatsapp.com, porque o
// Permissions-Policy do próprio WhatsApp restringe "clipboard-write" a "self" —
// um iframe de outra origem, como o da sidebar da extensão, nunca tem permissão
// para usar navigator.clipboard.write, mesmo com o atributo allow="clipboard-write")

function carregarImagemComoBitmap(objectUrl){

  return new Promise((resolve, reject) => {

    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Falha ao carregar a imagem"))

    img.src = objectUrl

  })

}

async function baixarImagemComoPng(url){

  const response = await fetch(url)

  if(!response.ok) throw new Error("Falha ao baixar a imagem")

  const originalBlob = await response.blob()

  const objectUrl = URL.createObjectURL(originalBlob)

  try{

    const img = await carregarImagemComoBitmap(objectUrl)

    const canvas = document.createElement("canvas")
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    const ctx = canvas.getContext("2d")
    ctx.drawImage(img, 0, 0)

    const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"))

    if(!pngBlob) throw new Error("Falha ao converter a imagem")

    return pngBlob

  } finally {

    URL.revokeObjectURL(objectUrl)

  }

}

window.addEventListener("message", (event) => {

  if(event.data?.tipo === "COPIAR_IMAGEM"){

    const iframe = document.getElementById("wa-sales-sidebar")

    /* O ClipboardItem recebe a Promise diretamente (em vez de aguardar antes)
    para preservar o gesto do usuário exigido pela Clipboard API assíncrona. */

    navigator.clipboard.write([
      new ClipboardItem({ "image/png": baixarImagemComoPng(event.data.url) })
    ]).then(() => {

      iframe?.contentWindow.postMessage({ tipo: "STATUS_COPIA_IMAGEM", status: "sucesso" }, "*")

    }).catch((error) => {

      console.error("Erro ao copiar imagem:", error)
      iframe?.contentWindow.postMessage({ tipo: "STATUS_COPIA_IMAGEM", status: "erro" }, "*")

    })

  }

})


// RECEBER ÁUDIO DA EXTENSÃO

window.addEventListener("message", async (event) => {

  if (event.data?.tipo === "ENVIAR_AUDIO") {

    console.log("🔥 AUDIO RECEBIDO NO CONTENT", event.data)

    window.postMessage({
      tipo: "EXTENSAO_WPP_AUDIO",
      acao: "injetar_audio",
      dadosAudio: event.data.dadosAudio,
      tipoMime: event.data.tipoMime,
      duracao: event.data.duracao || 5
    }, "*")

  }

})