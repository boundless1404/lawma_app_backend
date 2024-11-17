import{bK as Q,w as P,o as M,aI as W,cd as A,ca as B,g as E,c2 as I,ce as K,cf as N,r as m,bO as U,c8 as C,c as s,C as z,aS as V,a as j,bP as D,h as v,bQ as k}from"./index.e12bd1bb.js";import{Q as R}from"./QResizeObserver.11f8e167.js";const{passive:$}=I,G=["both","horizontal","vertical"];var J=Q({name:"QScrollObserver",props:{axis:{type:String,validator:t=>G.includes(t),default:"vertical"},debounce:[String,Number],scrollTarget:{default:void 0}},emits:["scroll"],setup(t,{emit:T}){const o={position:{top:0,left:0},direction:"down",directionChanged:!1,delta:{top:0,left:0},inflectionPoint:{top:0,left:0}};let n=null,r,u;P(()=>t.scrollTarget,()=>{d(),b()});function c(){n!==null&&n();const h=Math.max(0,K(r)),g=N(r),a={top:h-o.position.top,left:g-o.position.left};if(t.axis==="vertical"&&a.top===0||t.axis==="horizontal"&&a.left===0)return;const w=Math.abs(a.top)>=Math.abs(a.left)?a.top<0?"up":"down":a.left<0?"left":"right";o.position={top:h,left:g},o.directionChanged=o.direction!==w,o.delta=a,o.directionChanged===!0&&(o.direction=w,o.inflectionPoint=o.position),T("scroll",{...o})}function b(){r=B(u,t.scrollTarget),r.addEventListener("scroll",i,$),i(!0)}function d(){r!==void 0&&(r.removeEventListener("scroll",i,$),r=void 0)}function i(h){if(h===!0||t.debounce===0||t.debounce==="0")c();else if(n===null){const[g,a]=t.debounce?[setTimeout(c,t.debounce),clearTimeout]:[requestAnimationFrame(c),cancelAnimationFrame];n=()=>{a(g),n=null}}}const{proxy:S}=E();return P(()=>S.$q.lang.rtl,c),M(()=>{u=S.$el.parentNode,b()}),W(()=>{n!==null&&n(),d()}),Object.assign(S,{trigger:i,getPosition:()=>o}),A}}),Z=Q({name:"QLayout",props:{container:Boolean,view:{type:String,default:"hhh lpr fff",validator:t=>/^(h|l)h(h|r) lpr (f|l)f(f|r)$/.test(t.toLowerCase())},onScroll:Function,onScrollHeight:Function,onResize:Function},setup(t,{slots:T,emit:o}){const{proxy:{$q:n}}=E(),r=m(null),u=m(n.screen.height),c=m(t.container===!0?0:n.screen.width),b=m({position:0,direction:"down",inflectionPoint:0}),d=m(0),i=m(U.value===!0?0:C()),S=s(()=>"q-layout q-layout--"+(t.container===!0?"containerized":"standard")),h=s(()=>t.container===!1?{minHeight:n.screen.height+"px"}:null),g=s(()=>i.value!==0?{[n.lang.rtl===!0?"left":"right"]:`${i.value}px`}:null),a=s(()=>i.value!==0?{[n.lang.rtl===!0?"right":"left"]:0,[n.lang.rtl===!0?"left":"right"]:`-${i.value}px`,width:`calc(100% + ${i.value}px)`}:null);function w(e){if(t.container===!0||document.qScrollPrevented!==!0){const l={position:e.position.top,direction:e.direction,directionChanged:e.directionChanged,inflectionPoint:e.inflectionPoint.top,delta:e.delta.top};b.value=l,t.onScroll!==void 0&&o("scroll",l)}}function O(e){const{height:l,width:f}=e;let y=!1;u.value!==l&&(y=!0,u.value=l,t.onScrollHeight!==void 0&&o("scrollHeight",l),L()),c.value!==f&&(y=!0,c.value=f),y===!0&&t.onResize!==void 0&&o("resize",e)}function F({height:e}){d.value!==e&&(d.value=e,L())}function L(){if(t.container===!0){const e=u.value>d.value?C():0;i.value!==e&&(i.value=e)}}let p=null;const q={instances:{},view:s(()=>t.view),isContainer:s(()=>t.container),rootRef:r,height:u,containerHeight:d,scrollbarWidth:i,totalWidth:s(()=>c.value+i.value),rows:s(()=>{const e=t.view.toLowerCase().split(" ");return{top:e[0].split(""),middle:e[1].split(""),bottom:e[2].split("")}}),header:z({size:0,offset:0,space:!1}),right:z({size:300,offset:0,space:!1}),footer:z({size:0,offset:0,space:!1}),left:z({size:300,offset:0,space:!1}),scroll:b,animate(){p!==null?clearTimeout(p):document.body.classList.add("q-body--layout-animate"),p=setTimeout(()=>{p=null,document.body.classList.remove("q-body--layout-animate")},155)},update(e,l,f){q[e][l]=f}};if(V(k,q),C()>0){let f=function(){e=null,l.classList.remove("hide-scrollbar")},y=function(){if(e===null){if(l.scrollHeight>n.screen.height)return;l.classList.add("hide-scrollbar")}else clearTimeout(e);e=setTimeout(f,300)},x=function(H){e!==null&&H==="remove"&&(clearTimeout(e),f()),window[`${H}EventListener`]("resize",y)},e=null;const l=document.body;P(()=>t.container!==!0?"add":"remove",x),t.container!==!0&&x("add"),j(()=>{x("remove")})}return()=>{const e=D(T.default,[v(J,{onScroll:w}),v(R,{onResize:O})]),l=v("div",{class:S.value,style:h.value,ref:t.container===!0?void 0:r,tabindex:-1},e);return t.container===!0?v("div",{class:"q-layout-container overflow-hidden",ref:r},[v(R,{onResize:F}),v("div",{class:"absolute-full",style:g.value},[v("div",{class:"scroll",style:a.value},[l])])]):l}}});export{Z as Q};
