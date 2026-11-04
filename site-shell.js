/* PDFLeo shared site shell */
(async function(){
 if(location.pathname==="/"||location.pathname.endsWith("/index.html"))return;
 if(!document.querySelector('link[data-pdfleo-premium]')){
  const css=document.createElement("link");css.rel="stylesheet";css.href="/premium.css?v=20261104-shell";css.dataset.pdfleoPremium="1";document.head.appendChild(css);
 }
 try{
  const response=await fetch("/",{credentials:"same-origin",cache:"no-cache"});if(!response.ok)throw new Error("Homepage shell unavailable");
  const doc=new DOMParser().parseFromString(await response.text(),"text/html");
  const sourceHeader=doc.querySelector("header.pl-header"),sourceFooter=doc.querySelector("footer.pl-footer");
  if(!sourceHeader||!sourceFooter)throw new Error("Shared layout not found");
  document.querySelectorAll("header, footer").forEach(el=>el.remove());
  const sprite=[...doc.querySelectorAll("body > svg")].find(el=>el.querySelector("defs"));
  if(sprite&&!document.querySelector("body > svg[data-pdfleo-icons]")){const copy=sprite.cloneNode(true);copy.dataset.pdfleoIcons="1";document.body.prepend(copy);}
  const header=sourceHeader.cloneNode(true),footer=sourceFooter.cloneNode(true);
  header.querySelectorAll('a[href="#top"]').forEach(a=>a.href="/#top");
  header.querySelectorAll('a[href="#tools"]').forEach(a=>a.href="/#tools");
  header.querySelectorAll('a[href="#categories"]').forEach(a=>a.href="/#categories");
  ["guides.html","about.html","contact.html","blog.html","faq.html","pricing.html"].forEach(p=>header.querySelectorAll('a[href="'+p+'"]').forEach(a=>a.href="/"+p));
  header.querySelectorAll(".pl-links a").forEach(a=>{a.classList.remove("is-active");if(a.getAttribute("href")==="/"+location.pathname.split("/").pop())a.classList.add("is-active");});
  footer.querySelectorAll('a[href="#tools"]').forEach(a=>a.href="/#tools");
  ["guides.html","blog.html","workflows.html","faq.html","security.html","about.html","contact.html","pricing.html","privacy.html","terms.html","merge-pdf-online.html","compress-pdf-online.html","split-pdf-online.html"].forEach(p=>footer.querySelectorAll('a[href="'+p+'"]').forEach(a=>a.href="/"+p));
  document.body.prepend(header);document.body.append(footer);
  const year=footer.querySelector("#year");if(year)year.textContent=new Date().getFullYear();
  const toggle=header.querySelector("#pdfleoThemeToggle");
  const applyTheme=value=>{document.documentElement.setAttribute("data-pdfleo-theme",value);try{localStorage.setItem("pdfleo-theme-v1",value);}catch(e){}if(toggle){toggle.setAttribute("aria-pressed",String(value==="light"));const label=toggle.querySelector(".tl");if(label)label.textContent=value==="light"?"Dark":"Light";}};
  let theme="dark";try{theme=localStorage.getItem("pdfleo-theme-v1")==="light"?"light":"dark";}catch(e){}applyTheme(theme);
  if(toggle)toggle.addEventListener("click",()=>applyTheme(document.documentElement.getAttribute("data-pdfleo-theme")==="light"?"dark":"light"));
  const burger=header.querySelector("#plBurger"),menu=header.querySelector("#plMobileMenu");
  if(burger&&menu)burger.addEventListener("click",()=>{const open=burger.getAttribute("aria-expanded")!=="true";burger.setAttribute("aria-expanded",String(open));menu.hidden=!open;});
  if(menu)menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{menu.hidden=true;if(burger)burger.setAttribute("aria-expanded","false");}));
  const search=header.querySelector("[data-search-open]");if(search)search.addEventListener("click",()=>location.href="/#tools");
  header.querySelectorAll("#authOpen,#authSignup,[data-proxy]").forEach(b=>b.addEventListener("click",()=>location.href="/#account"));
 }catch(error){console.warn("PDFLeo shared shell:",error);}
})();