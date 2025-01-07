import{E as N,B as P,I as R,d as q,f as k,Q as E,e as S}from"./index.78f34a68.js";import{Q as T}from"./QCheckbox.1d3f000e.js";import{cs as c,d as U,cm as j,cn as A,r as f,C as B,w as F,o as O,aI as z,aQ as M,ae as $,af as u,f as i,bj as p,W as D,al as G,bS as H}from"./index.5f74dede.js";import{Q as W}from"./QCardSection.8ec3183b.js";import{Q as J}from"./QCard.fd4889e8.js";import{u as h,_ as K}from"./auth-store.1ee9e3e1.js";import{api as L}from"./axios.06e6e18e.js";import{U as X}from"./urlPaths.enum.4e223ac0.js";import{I as Y}from"./IsEmail.362df045.js";import"./use-dark.8b3d0d40.js";import"./focus-manager.02955f48.js";import"./QBadge.e39c7e1a.js";import"./storeforage.21ccbd50.js";async function b(d){const e=await L.post(X.SIGNIN,d,{headers:{Authorization:void 0}});if([200,201].includes(e.status))return e.data.token;throw new Error("Signin failed",{cause:e.data})}class Z{static async handle(e){e==null||e.on(N.SIGN_IN,async o=>{try{const a=h();delete o.errors;const t=await b(o);await a.handleAuthToken(t),c.create({message:"Signin successful",color:"positive"})}catch(a){console.log(a),c.create({message:"Signin failed",color:"negative",icon:"warning",timeout:5e3})}})}static async signin(e,{onSuccess:o,onError:a}={}){try{const t=h();delete e.errors;const s=await b(e);await t.handleAuthToken(s),await(o==null?void 0:o()),c.create({message:"Signin successful",color:"positive"})}catch(t){a==null||a(t),c.create({message:"Signin failed",color:"negative",icon:"warning",timeout:5e3})}}}var ee=Object.defineProperty,te=Object.getOwnPropertyDescriptor,x=(d,e,o,a)=>{for(var t=a>1?void 0:a?te(e,o):e,s=d.length-1,m;s>=0;s--)(m=d[s])&&(t=(a?m(e,o,t):m(t))||t);return a&&t&&ee(e,o,t),t};class w extends P{email;password}x([Y({},{message:"Please enter a valid email"})],w.prototype,"email",2);x([R({message:"Password is invalid"})],w.prototype,"password",2);const se={class:"q-pt-sm q-pl-sm",style:{height:"4rem"}},ae={class:"flex flex-center",style:{height:"100vh"}},oe={class:"text-center q-mx-auto"},re={class:"text-center",style:{width:"100%"}},ve=U({__name:"SigninPage",setup(d){const e=j(),o=h(),{token:a}=A(o),t=f(!1),s=B(new w),m=f(),Q=f();q(async()=>{var r;return await s.validate(),!!((r=s.errors)!=null&&r.length)});function g(r){var v,_;const l=(v=s.errors)==null?void 0:v.find(I=>I.property===r),n=((_=Object.values((l==null?void 0:l.constraints)||{}))==null?void 0:_.join(" & "))||"";return n===""?!0:n}async function V(){var r;(r=s.errors)!=null&&r.length||await Z.signin(s,{onSuccess:async()=>{await e.replace("/dashboard")}})}function C(){y()}function y(){s.email="",s.password=""}return F(a,r=>{r&&e.push("/")}),O(()=>{y()}),z(()=>{}),(r,l)=>(M(),$("div",null,[u("div",se,[i(K,{color:"light-page"})]),u("div",ae,[i(J,{style:D([{width:"30rem",height:"40rem"},{borderColor:`2rem solid ${r.$getColor("accent")}`}]),rounded:""},{default:p(()=>[i(W,null,{default:p(()=>[u("div",oe,[i(k,null,{default:p(()=>[G(" Sign in ")]),_:1})]),i(E,{style:{height:"100%",width:"100%"},ref_key:"signinFormRef",ref:m,onSubmit:V,onReset:C,class:"q-gutter-xl q-pt-xl q-px-l"},{default:p(()=>[i(S,{style:{width:"100%"},filled:"",modelValue:s.email,"onUpdate:modelValue":l[0]||(l[0]=n=>s.email=n),label:"Email",hint:"email","lazy-rules":"",rules:[()=>g("email")]},null,8,["modelValue","rules"]),i(S,{style:{width:"100%"},filled:"",type:t.value?"text":"password",modelValue:s.password,"onUpdate:modelValue":l[1]||(l[1]=n=>s.password=n),label:"Password","lazy-rules":"",rules:[()=>g("password")],ref_key:"emailRef",ref:Q},null,8,["type","modelValue","rules"]),i(T,{style:{"margin-top":"-2rem"},modelValue:t.value,"onUpdate:modelValue":l[2]||(l[2]=n=>t.value=n),label:"Show password"},null,8,["modelValue"]),u("div",re,[i(H,{style:{width:"100%"},label:"Submit",type:"submit",color:"primary",rounded:""})])]),_:1},512)]),_:1})]),_:1},8,["style"])])]))}});export{ve as default};
