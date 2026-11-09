const containerMessages = document.getElementById("categories-messages")
const containerImages = document.getElementById("categories-images")
const containerFiles = document.getElementById("categories-files")

let messages = {}
let images = {}
let files = {}

/* FAVORITOS */
const FAVORITES_KEY = "wa_sales_favorites_v1"
let favorites = new Set()

function favoriteId(category, subcategory, index){
  return `${category}\u0000${subcategory}\u0000${index}`
}

function loadFavorites(){
  try{
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]")
    if(Array.isArray(saved)) favorites = new Set(saved)
  }catch(error){
    console.warn("Não foi possível carregar os favoritos.", error)
    favorites = new Set()
  }
}

function saveFavorites(){
  try{
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]))
  }catch(error){
    console.warn("Não foi possível salvar os favoritos.", error)
  }
}

function toggleFavorite(category, subcategory, index){
  const id = favoriteId(category, subcategory, index)
  if(favorites.has(id)) favorites.delete(id)
  else favorites.add(id)
  saveFavorites()
  renderMessages()
}

function renderFavorites(){
  let section = document.getElementById("favorites-section")
  if(!section){
    section = document.createElement("div")
    section.id = "favorites-section"
    containerMessages.parentNode.insertBefore(section, containerMessages)
  }

  const items=[]
  for(const [category, subs] of Object.entries(messages)){
    for(const [subcategory, list] of Object.entries(subs)){
      list.forEach((msg,index)=>{
        if(favorites.has(favoriteId(category,subcategory,index))) items.push({category,subcategory,msg,index})
      })
    }
  }

  section.innerHTML=""
  const header=document.createElement("div")
  header.className="favorites-header"
  header.innerHTML=`<div class="favorites-title"><span class="favorite-star">★</span><span>FAVORITOS</span></div><span class="favorites-count">${items.length}</span>`
  section.appendChild(header)

  const content=document.createElement("div")
  content.className="favorites-content"
  content.style.display = "none"

  const arrow=document.createElement("span")
  arrow.className="favorites-arrow"
  header.appendChild(arrow)

  header.addEventListener("click",()=>{
    const open = content.style.display === "block"
    content.style.display = open ? "none" : "block"
    arrow.textContent = open ? "›" : "⌄"
  })

  if(!items.length){
    const empty=document.createElement("div")
    empty.className="favorites-empty"
    empty.textContent="Favorite uma mensagem usando a estrela para vê-la aqui."
    content.appendChild(empty)
  }else{
    items.forEach(item=>{
      const card=document.createElement("div")
      card.className="favorite-card"

      const top=document.createElement("div")
      top.className="favorite-card-top"
      top.innerHTML=`<span class="favorite-meta">${item.category} · ${item.subcategory}</span>`

      const star=document.createElement("button")
      star.className="favorite-remove"
      star.type="button"
      star.title="Remover dos favoritos"
      star.textContent="★"
      star.addEventListener("click",(event)=>{
        event.stopPropagation()
        toggleFavorite(item.category,item.subcategory,item.index)
      })
      top.appendChild(star)

      const text=document.createElement("div")
      text.className="favorite-card-text"
      text.textContent=item.msg

      card.appendChild(top)
      card.appendChild(text)
      card.addEventListener("click",()=>copyMessage(item.msg))
      content.appendChild(card)
    })
  }

  section.appendChild(content)
}

/* ABAS */

const tabButtons = document.querySelectorAll(".tab-btn")
const tabPanels = document.querySelectorAll(".tab-panel")

tabButtons.forEach(btn=>{

btn.addEventListener("click",()=>{

const targetTab = btn.dataset.tab

tabButtons.forEach(b=>b.classList.toggle("active", b===btn))
tabPanels.forEach(p=>p.classList.toggle("active", p.id==="panel-"+targetTab))

})

})

/* ESTADOS DE CARREGAMENTO / VAZIO / ERRO */

function renderSkeleton(container){

container.innerHTML=""

for(let i=0;i<3;i++){

let skeleton=document.createElement("div")
skeleton.className="skeleton-card"

container.appendChild(skeleton)

}

}

function renderEmptyState(container, text){

container.innerHTML=""

let empty=document.createElement("div")
empty.className="empty-state"
empty.textContent=text

container.appendChild(empty)

}

function renderErrorState(container, text, onRetry){

container.innerHTML=""

let errorBox=document.createElement("div")
errorBox.className="error-state"

let msg=document.createElement("p")
msg.textContent=text

let retryBtn=document.createElement("button")
retryBtn.className="secondary-btn"
retryBtn.type="button"
retryBtn.textContent="Tentar novamente"
retryBtn.addEventListener("click",onRetry)

errorBox.appendChild(msg)
errorBox.appendChild(retryBtn)

container.appendChild(errorBox)

}

/* PREVIEW GLOBAL */

const preview = document.createElement("div")
preview.className = "image-preview"

const previewImg = document.createElement("img")
previewImg.draggable = false

preview.appendChild(previewImg)
document.body.appendChild(preview)

/* POSIÇÃO DO PREVIEW */

document.addEventListener("mousemove",(e)=>{

if(preview.style.display==="block"){

preview.style.left = e.clientX + 24 + "px"
preview.style.top = e.clientY + 24 + "px"

}

})

/* SVG ICONES */

function getCategoryIcon(name){

name=name.toLowerCase()

/* ATENDIMENTO — headset de suporte */
if(name.includes("atendimento")){
return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
<path d="M3 13a9 9 0 0118 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
<rect x="2" y="13" width="5" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
<rect x="17" y="13" width="5" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
</svg>`
}

/* ABORDAGENS — megafone */
if(name.includes("abordagem")){
return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
<path d="M3 10v4a1 1 0 001 1h2l10 4V5L6 9H4a1 1 0 00-1 1z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
<path d="M19 9a3 3 0 010 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`
}

/* SOLICITAÇÕES — prancheta com lista */
if(name.includes("solicita")){
return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
<rect x="6" y="4" width="12" height="17" rx="2" stroke="currentColor" stroke-width="2"/>
<path d="M9 3h6v3H9z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
<path d="M9 11h6M9 15h6M9 19h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`
}

/* FOLLOW-UP — seta de retorno/acompanhamento */
if(name.includes("follow")){
return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
<path d="M3 12a9 9 0 1 0 3-6.7" stroke="currentColor" stroke-width="2"/>
<path d="M3 3v6h6" stroke="currentColor" stroke-width="2"/>
</svg>`
}

/* INDICAÇÃO — pessoas / indicar contato */
if(name.includes("indic")){
return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
<path d="M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="2"/>
<path d="M2 21a7 7 0 0114 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
<path d="M19 8v6M22 11h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`
}

/* CREDIBILIDADE — escudo de confiança */
if(name.includes("credib")){
return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
<path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
}

/* PADRÃO — balão de mensagem genérico */
return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
<path d="M21 12c0 4.418-4.03 8-9 8-1.07 0-2.1-.17-3.05-.48L3 21l1.6-4.6C3.6 15.2 3 13.66 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

}

function getSubIcon(){

return `<svg width="14" height="14" viewBox="0 0 24 24">
<circle cx="12" cy="12" r="3" fill="currentColor"/>
</svg>`

}

/* FEEDBACK */

function showFeedback(text){

let feedback=document.createElement("div")
feedback.className="copy-feedback"
feedback.innerText=text

document.body.appendChild(feedback)

setTimeout(()=>feedback.classList.add("show"),10)

setTimeout(()=>{

feedback.classList.remove("show")

setTimeout(()=>feedback.remove(),300)

},1500)

}

/* RECOLHER SIDEBAR APÓS COPIAR */

function closeSidebarSoon(){

setTimeout(()=>{

window.parent.postMessage("closeSidebar","*")

},700)

}

/* COPIAR TEXTO */

function copyMessage(text){

const textarea=document.createElement("textarea")

textarea.value=text

textarea.style.position="fixed"
textarea.style.left="-9999px"
textarea.style.top="-9999px"
textarea.style.opacity="0"

document.body.appendChild(textarea)

textarea.select()

document.execCommand("copy")

document.body.removeChild(textarea)

showFeedback("Mensagem copiada")

closeSidebarSoon()

}

/* COPIAR IMAGEM */

/* A cópia da imagem precisa ser feita pelo content.js (frame do próprio
web.whatsapp.com), porque o Permissions-Policy do WhatsApp restringe
clipboard-write a "self" — um iframe de outra origem (como esta sidebar)
nunca recebe essa permissão, mesmo com allow="clipboard-write". Por isso
só pedimos a cópia via postMessage e esperamos a resposta. */

function copyImage(url){

window.parent.postMessage({ tipo:"COPIAR_IMAGEM", url }, "*")

}

window.addEventListener("message",(event)=>{

if(event.data?.tipo==="STATUS_COPIA_IMAGEM"){

if(event.data.status==="sucesso"){

showFeedback("Imagem copiada")
closeSidebarSoon()

}else{

showFeedback("Não foi possível copiar a imagem")

}

}

})

/* CARREGAR MENSAGENS */

async function loadMessages(){

renderSkeleton(containerMessages)

const url=chrome.runtime.getURL("messages.json")

try{

const response=await fetch(url)

messages=await response.json()

if(!messages || Object.keys(messages).length===0){

renderEmptyState(containerMessages,"Nenhuma mensagem disponível no momento.")

}else{

containerMessages.innerHTML=""
renderMessages()

}

}catch(error){

console.error("Erro ao carregar mensagens:",error)

renderErrorState(containerMessages,"Não foi possível carregar as mensagens.",loadMessages)

}

}

/* CARREGAR IMAGENS */

async function loadImages(){

renderSkeleton(containerImages)

const url=chrome.runtime.getURL("images.json")

try{

const response=await fetch(url)

images=await response.json()

if(!images || Object.keys(images).length===0){

renderEmptyState(containerImages,"Nenhuma imagem disponível no momento.")

}else{

containerImages.innerHTML=""
renderImages()

}

}catch(error){

console.error("Erro ao carregar imagens:",error)

renderErrorState(containerImages,"Não foi possível carregar as imagens.",loadImages)

}

}

/* CARREGAR ARQUIVOS */
async function loadFiles(){
renderSkeleton(containerFiles)
try{const response=await fetch(chrome.runtime.getURL("files.json")); files=await response.json(); if(!files||!Object.keys(files).length) renderEmptyState(containerFiles,"Nenhum arquivo disponível no momento."); else {containerFiles.innerHTML="";renderFiles()}}catch(error){console.error("Erro ao carregar arquivos:",error);renderErrorState(containerFiles,"Não foi possível carregar os arquivos.",loadFiles)}
}

/* RENDER MENSAGENS */

function renderMessages(){

containerMessages.innerHTML=""
renderFavorites()

const allCategoryContents=[]

for(let category in messages){

let categoryDiv=document.createElement("div")
categoryDiv.className="category"

let header=document.createElement("div")
header.className="category-header"

header.innerHTML=`
<div class="category-left">
${getCategoryIcon(category)}
<span>${category}</span>
</div>
<div class="category-arrow">›</div>
`

categoryDiv.appendChild(header)

let categoryContent=document.createElement("div")
categoryContent.className="category-content"
categoryContent.style.display="none"

const allSubContents=[]

for(let sub in messages[category]){

let subHeader=document.createElement("div")
subHeader.className="image-subheader"

subHeader.innerHTML=`
<div class="image-subheader-left">
${getSubIcon()}
<span>${sub}</span>
</div>
<div class="image-subheader-arrow">›</div>
`

categoryContent.appendChild(subHeader)

let subContent=document.createElement("div")
subContent.className="sub-content"
subContent.style.display="none"

messages[category][sub].forEach((msg,index)=>{

let wrap=document.createElement("div")
wrap.className="msg-row"

let el=document.createElement("div")
el.className="msg"
el.textContent=msg
el.addEventListener("click",()=>copyMessage(msg))

let star=document.createElement("button")
star.className="msg-favorite"
star.type="button"
star.title=favorites.has(favoriteId(category,sub,index)) ? "Remover dos favoritos" : "Adicionar aos favoritos"
star.textContent=favorites.has(favoriteId(category,sub,index)) ? "★" : "☆"
star.addEventListener("click",(event)=>{
  event.stopPropagation()
  toggleFavorite(category,sub,index)
})

wrap.appendChild(el)
wrap.appendChild(star)
subContent.appendChild(wrap)

})

allSubContents.push(subContent)

subHeader.addEventListener("click",()=>{

const isOpen = subContent.style.display==="block"

allSubContents.forEach(sc=>sc.style.display="none")

subContent.style.display = isOpen ? "none" : "block"

})

categoryContent.appendChild(subContent)

}

allCategoryContents.push(categoryContent)

header.addEventListener("click",()=>{

const isOpen = categoryContent.style.display==="block"

allCategoryContents.forEach(cc=>cc.style.display="none")

categoryContent.style.display = isOpen ? "none" : "block"

})

categoryDiv.appendChild(categoryContent)

containerMessages.appendChild(categoryDiv)

}

}

/* RENDER ARQUIVOS */
function renderFiles(){
const allCategoryContents=[]
for(let category in files){
let categoryDiv=document.createElement("div"); categoryDiv.className="category"
let header=document.createElement("div"); header.className="category-header"; header.innerHTML=`<div class="category-left"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><span>${category}</span></div><div class="category-arrow">›</div>`; categoryDiv.appendChild(header)
let categoryContent=document.createElement("div"); categoryContent.className="category-content"; categoryContent.style.display="none"; const allLists=[]
for(let sub in files[category]){
let subHeader=document.createElement("div"); subHeader.className="sub-header"; subHeader.innerHTML=`${getSubIcon()}<span>${sub}</span>`; categoryContent.appendChild(subHeader)
let list=document.createElement("div"); list.className="file-list"; list.style.display="none"
files[category][sub].forEach(file=>{let card=document.createElement("div");card.className="file-card";let icon=document.createElement("div");icon.className="file-icon";icon.innerHTML=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 2h8l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 2v5h5M8 12h8M8 16h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;let info=document.createElement("div");info.className="file-info";let name=document.createElement("div");name.className="file-name";name.textContent=file.nome;let type=document.createElement("div");type.className="file-type";type.textContent=file.tipo||"Arquivo";info.append(name,type);let dl=document.createElement("a");dl.className="file-download";dl.href=chrome.runtime.getURL(file.arquivo);dl.download=file.nome+".pdf";dl.title="Baixar arquivo";dl.innerHTML=`<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;card.append(icon,info,dl);list.appendChild(card)})
allLists.push(list); subHeader.addEventListener("click",()=>{let open=list.style.display==="block";allLists.forEach(x=>x.style.display="none");list.style.display=open?"none":"block"});categoryContent.appendChild(list)
}
allCategoryContents.push(categoryContent);header.addEventListener("click",()=>{let open=categoryContent.style.display==="block";allCategoryContents.forEach(x=>x.style.display="none");categoryContent.style.display=open?"none":"block"});categoryDiv.appendChild(categoryContent);containerFiles.appendChild(categoryDiv)
}
}

/* RENDER IMAGENS (CORRIGIDO) */

function renderImages(){

const allCategoryContents=[]

for(let category in images){

let categoryDiv=document.createElement("div")
categoryDiv.className="category"

let header=document.createElement("div")
header.className="category-header"

header.innerHTML=`
<div class="category-left">
<svg width="16" height="16" viewBox="0 0 24 24">
<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
<circle cx="8" cy="10" r="2" fill="currentColor"/>
</svg>
<span>${category}</span>
</div>
<div class="category-arrow">›</div>
`

categoryDiv.appendChild(header)

let categoryContent=document.createElement("div")
categoryContent.className="category-content"
categoryContent.style.display="none"

const allGrids=[]

for(let sub in images[category]){

let subHeader=document.createElement("div")
subHeader.className="sub-header"

subHeader.innerHTML=`
<div class="image-subheader-left">
${getSubIcon()}
<span>${sub}</span>
</div>
<div class="image-subheader-arrow">›</div>
`

categoryContent.appendChild(subHeader)

let grid=document.createElement("div")
grid.className="image-grid"
grid.style.display="none"

images[category][sub].forEach(img=>{

let thumbWrap=document.createElement("div")
thumbWrap.className = "image-thumb-wrap"

let thumb=document.createElement("img")
thumb.src = img.url
thumb.className = "image-thumb"
thumb.title = (img.nome ? img.nome + " — " : "") + "clique para copiar"
thumb.draggable = false

let copyBadge=document.createElement("div")
copyBadge.className = "image-copy-badge"
copyBadge.innerHTML = `
<svg width="13" height="13" viewBox="0 0 24 24" fill="none">
<rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
</svg>
`

thumbWrap.appendChild(thumb)
thumbWrap.appendChild(copyBadge)

thumbWrap.addEventListener("mouseenter",()=>{

previewImg.src = img.url
preview.style.display = "flex"

})

thumbWrap.addEventListener("mouseleave",()=>{

preview.style.display = "none"

})

thumbWrap.addEventListener("click",()=>{

copyImage(img.url)

})

grid.appendChild(thumbWrap)

})

allGrids.push(grid)

subHeader.addEventListener("click",()=>{

const isOpen = grid.style.display==="grid"

allGrids.forEach(g=>g.style.display="none")

document.querySelectorAll(".image-subheader-arrow").forEach(a=>a.textContent="›")

grid.style.display = isOpen ? "none" : "grid"
subHeader.querySelector(".image-subheader-arrow").textContent = isOpen ? "›" : "⌄"

})

categoryContent.appendChild(grid)

}

allCategoryContents.push(categoryContent)

header.addEventListener("click",()=>{

const isOpen = categoryContent.style.display==="block"

allCategoryContents.forEach(cc=>cc.style.display="none")

categoryContent.style.display = isOpen ? "none" : "block"

if(isOpen){
  categoryContent.querySelectorAll(".image-subheader-arrow").forEach(a=>a.textContent="›")
  categoryContent.querySelectorAll(".image-grid").forEach(g=>g.style.display="none")
}

})

categoryDiv.appendChild(categoryContent)

containerImages.appendChild(categoryDiv)

}

}

/* BOTÃO FECHAR SIDEBAR */

const toggleButton = document.getElementById("toggleSidebar")

if(toggleButton){

toggleButton.addEventListener("click",()=>{

window.parent.postMessage("closeSidebar","*")

})

}

/* RECEBER STATUS */

window.addEventListener("message",(event)=>{

if(event.data==="collapsed"){

const expanded=document.getElementById("expanded")
const collapsed=document.getElementById("collapsed")

if(expanded) expanded.style.display="none"
if(collapsed) collapsed.style.display="flex"

}

if(event.data==="expanded"){

const expanded=document.getElementById("expanded")
const collapsed=document.getElementById("collapsed")

if(expanded) expanded.style.display="block"
if(collapsed) collapsed.style.display="none"

}

})

/* INICIAR */

loadFavorites()
loadMessages()
loadImages()
loadFiles()

document.getElementById("btn-audio").addEventListener("click", () => {

  const input = document.createElement("input")
  input.type = "file"
  input.accept = "audio/*"

  input.onchange = (e) => {

    const file = e.target.files[0]

    const reader = new FileReader()

    reader.onload = function() {

      const arrayBuffer = reader.result

      window.parent.postMessage({
        tipo: "ENVIAR_AUDIO",
        dadosAudio: arrayBuffer,
        tipoMime: file.type,
        duracao: 5
      }, "*")

    }

    reader.readAsArrayBuffer(file)

  }

  input.click()
})