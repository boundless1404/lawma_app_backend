import{Q as I}from"./QPage.7a078e42.js";import{ch as S,d as w,cL as x,cn as U,c as P,o as C,aQ as s,ac as D,bj as T,ae as a,aW as v,F as f,U as j,af as r,X as t,aT as L,aR as R}from"./index.5f74dede.js";import{u as V}from"./billing-store.704ab9c9.js";import"./storeforage.21ccbd50.js";const b=d=>(L("data-v-c12a0066"),d=d(),R(),d),E={class:"card-content"},Q=b(()=>r("div",{class:"header-section"},null,-1)),F={class:"billing-details"},$={key:0,class:"flex row justify-between"},z={class:"date"},G={key:1,class:"date"},M={class:"billing-header"},W={class:"billing-info"},X=b(()=>r("p",{class:"section-title"},"Billing Details",-1)),q=w({__name:"PrintPage2",setup(d){const N=x(),k=V(),{billingDetails:i}=U(k),A=P(()=>{var l;if(i!=null&&i.value){const _=i.value.length,m=[];for(let o=0;o<_;){let n=o;const c=o+4>_?_:o+4,e=[];for(let u=0;u<c;){const p=n+2>c?c:n+2,h=(l=i.value)==null?void 0:l.slice(n,p);u=n=p,e.push(h)}o=c,m.push(e)}return m}else return[]}),g=P(()=>{var l;return(l=N.params)==null?void 0:l.datestring});return console.log("this is the billing details: ",i),C(()=>{}),(l,_)=>(s(),D(I,{class:"print-page"},{default:T(()=>[(s(!0),a(f,null,v(A.value,(m,o)=>(s(),a("div",{key:o,class:"print-page-container"},[(s(!0),a(f,null,v(m,(n,c)=>(s(),a("div",{key:c,class:j(`billing-row ${c%2>0?"even-row":""} ${n.length>1?"justify-around":"justify-start"}`)},[(s(!0),a(f,null,v(n,e=>{var u,p,h;return s(),a("div",{key:e.propertySubscriptionId,class:"billing-card"},[r("div",E,[Q,r("div",F,[((u=e.subscriberVirtualAccountDetails)==null?void 0:u.length)>0?(s(),a("div",$,[r("p",z,t(g.value),1),r("p",null,t((p=e.subscriberVirtualAccountDetails)==null?void 0:p[0].account_name)+" | "+t((h=e.subscriberVirtualAccountDetails)==null?void 0:h[0].account_number),1)])):(s(),a("p",G,t(g.value),1)),r("p",M," GRS-"+t(e.propertySubscriptionId)+" | "+t(e.propertyName)+" of "+t(e.streetNumber)+" "+t(e.streetName),1),r("div",W,[X,(s(!0),a(f,null,v(e.propertyUnits,(y,B)=>(s(),a("p",{key:B}," Property: "+t(y.propertyType)+" | Units: "+t(y.propertyUnits)+" | Amount: N "+t(Number(y.propertyTypeUnitPrice)*Number(y.propertyUnits)),1))),128)),r("p",null,"Arrears: N"+t(e.arrears||0),1),r("p",null,"Last Payment: N"+t(e.lastPayment||0),1),r("p",null,"Total: N"+t(e.totalBilling||0),1)])])])])}),128))],2))),128))]))),128))]),_:1}))}});var Y=S(q,[["__scopeId","data-v-c12a0066"]]);export{Y as default};
