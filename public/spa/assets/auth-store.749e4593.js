import{Q as n}from"./QBadge.99cf8690.js";import{d as r,aQ as i,ac as l,bj as u,W as m,al as p,S as s,cr as d}from"./index.42545eb5.js";import{forageGetItem as c,forageSetItem as g}from"./storeforage.51a9cd86.js";const S=r({__name:"LawmaAppBadge",props:{color:{type:String,default:"dark"}},setup(e){return r({name:"LawmaAppBadge"}),(t,a)=>(i(),l(n,{class:"text-body1 text-bold",style:m({border:`0.1rem solid  ${t.$getColor(e.color)}`,backgroundColor:"transparent",padding:"1rem 0.5rem",color:t.$getColor(e.color),cursor:"pointer"}),onClick:a[0]||(a[0]=h=>t.$router.push({path:"/auth/signin"}))},{default:u(()=>[p("Waste Pro")]),_:1},8,["style"]))}}),o=c(s.AUTH_USER_DATA)||{};o.token="this is the token";const T=d("auth",{state:()=>({token:o.token,userData:o.userData,profile:o.profile}),getters:{getToken(){return this.token}},actions:{async handleAuthToken(e){this.token=e,await g(s.AUTH_USER_DATA,{...this.$state},t=>{})}}});export{S as _,T as u};
