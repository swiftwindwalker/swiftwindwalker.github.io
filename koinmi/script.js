'use strict';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reducedMotion) {
 document.documentElement.classList.add('js');
 const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);} }), {threshold: .08});
 document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
}
const stage = document.querySelector('.hero-stage');
let scheduled=false;
function updateScroll(){
 const total=document.documentElement.scrollHeight-innerHeight;
 document.documentElement.style.setProperty('--scroll',total>0?Math.min(1,scrollY/total):0);
 if(!reducedMotion && stage) stage.style.setProperty('--hero-progress',Math.max(0,Math.min(1,scrollY/900)));
 scheduled=false;
}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll);}},{passive:true});
addEventListener('resize',updateScroll);updateScroll();
const screens = {
 overview: {src:'assets/screenshots/overview-light.webp', alt:'Koinmi Overview in light grey with unified balances and account page controls', title:'Overview'},
 activity: {src:'assets/screenshots/activity-light.webp', alt:'Koinmi Activity transaction calendar and matching daily transactions', title:'Activity'},
 plan: {src:'assets/screenshots/plan-light.webp', alt:'Koinmi Plan with daily budget perspective, monthly budget and category limits', title:'Plan'},
 insights: {src:'assets/screenshots/insights-light.webp', alt:'Koinmi Insights donut chart and spending categories', title:'Insights'},
 settings: {src:'assets/screenshots/settings-light.webp', alt:'Koinmi Settings with organised collapsible categories', title:'Settings'}
};
const appearances = {
 light: {src:'assets/screenshots/overview-light.webp', title:'Light Grey'},
 grey: {src:'assets/screenshots/overview-dark-grey.webp', title:'Dark Grey'},
 lilac: {src:'assets/screenshots/overview-dark-lilac.webp', title:'Dark Lilac'}
};
const tabs=[...document.querySelectorAll('.feature-list [role="tab"]')];
const appearanceButtons=[...document.querySelectorAll('[data-appearance]')];
let selectedAppearance='light';
let selectedScreen='overview';
function renderScreen(){
 const image=document.getElementById('feature-screen');
 const screen=screens[selectedScreen];
 if(!image || !screen) return;
 const overview=selectedScreen==='overview';
 const appearance=appearances[selectedAppearance];
 image.src=overview ? appearance.src : screen.src;
 image.alt=overview ? `Koinmi Overview in ${appearance.title}, showing account balances, income, transfers and expenses` : screen.alt;
 document.querySelector('.appearance-modes').hidden=!overview;
 document.getElementById('feature-caption').textContent=`${screen.title} · ${overview ? appearance.title : 'Light Mode'}`;
 appearanceButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.appearance===selectedAppearance)));
 if(!reducedMotion && image.animate) image.animate([{opacity:0.4,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'ease-out'});
}
function activate(tab){
 tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});
 selectedScreen=tab.dataset.screen;
 renderScreen();
 document.getElementById('feature-panel').setAttribute('aria-labelledby',tab.id);
}
appearanceButtons.forEach(button=>button.addEventListener('click',()=>{selectedAppearance=button.dataset.appearance;renderScreen();}));
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();activate(tabs[next]);tabs[next].focus();}});});
document.getElementById('year').textContent=new Date().getFullYear();

const copyEmail = document.getElementById('copy-email');
copyEmail.addEventListener('click', async () => {
 try { await navigator.clipboard.writeText('ravzzyytube+koinmi@gmail.com'); document.getElementById('copy-status').textContent = 'Email address copied.'; }
 catch { document.getElementById('copy-status').textContent = 'Please copy the email address shown above.'; }
});

// LAUNCH CONFIGURATION: paste your public App Store URL between the quotes.
const APP_STORE_URL = "";
if (APP_STORE_URL) {
 try {
  const storeURL = new URL(APP_STORE_URL);
  if (storeURL.protocol === 'https:' && storeURL.hostname === 'apps.apple.com') {
   document.querySelectorAll('[data-store-link]').forEach(link => {
    link.href = storeURL.href;
    link.removeAttribute('aria-disabled');
    link.setAttribute('aria-label', 'View Koinmi on the App Store');
    link.querySelector('[data-store-caption]').textContent = 'Available on';
   });
   const status = document.querySelector('.launch-status');
   if (status) status.innerHTML = '<span class="status-dot"></span> Available for iPhone';
   const availabilityNote = document.querySelector('#availability > .fine-print');
   if (availabilityNote) availabilityNote.textContent = 'Discover Koinmi on the App Store.';
  }
 } catch { /* Keep the honest coming-soon state if the URL is invalid. */ }
}
const policyExpand = document.getElementById('policy-expand');
policyExpand.addEventListener('click', () => {
 const topics = [...document.querySelectorAll('.policy-topic')];
 const expand = !topics.every(topic => topic.open);
 topics.forEach(topic => topic.open = expand);
 policyExpand.setAttribute('aria-expanded', String(expand));
 policyExpand.innerHTML = expand ? 'Collapse All Sections <span aria-hidden="true">−</span>' : 'Expand All Sections <span aria-hidden="true">+</span>';
});
// Open a linked policy topic if a visitor uses a deep link to a disclosure.
function openPolicyAnchor() {
 const target = document.getElementById(location.hash.slice(1));
 if (target && target.classList.contains('policy-topic')) target.open = true;
}
addEventListener('hashchange', openPolicyAnchor);openPolicyAnchor();
