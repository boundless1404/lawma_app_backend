import{P as C,Q as _,b as $,c as E,d as k}from"./PropertyType.model.4b88e62c.js";import{u as U,P as v,Q as B}from"./PropertySubscription.handler.79f48c50.js";import{Q as O,a as f}from"./QCard.85cc34e3.js";import{d as q,E as b,Q as M,e as P}from"./index.46a5a464.js";import{d as R,r as d,i as j,C as F,c as I,w as N,aI as Y,o as x,aQ as H,ac as W,bj as i,af as r,f as a,W as y,O as z,bH as g,bS as A}from"./index.42545eb5.js";import{Q as D}from"./QPage.2ea6b3ec.js";import{c as T,i as G}from"./utils.01331f21.js";import"./QResizeObserver.88741781.js";import"./QMenu.0c4ccb5f.js";import"./use-timeout.49462ff4.js";import"./use-dark.56ed68ad.js";import"./focus-manager.02955f48.js";import"./touch.3df10340.js";import"./format.317bde1e.js";import"./urlPaths.enum.6eeee43a.js";import"./axios.d19dfa92.js";import"./storeforage.51a9cd86.js";import"./default.request.d96bee32.js";const J={class:"row justify-between items-center"},K={class:"q-mt-xl",style:{"margin-top":"15vh"}},L={class:"q-mt-lg",style:{height:"70vh"}},X={class:"q-gutter-md"},Z={class:"flex row justify-center"},ge=R({__name:"SettingsPage",setup(ee){const s=d("Property Types"),u=d([]),h=d(),m=d(),p=j("eventBus"),n=U();let c;const o=F(new C),Q=I(()=>u.value.map(t=>({label:`${t.name} - ${t.unitPrice}`,value:t.id})));q(async()=>{await o.validate()});function V(){var t;G(o)||(t=h.value)==null||t.validate(),n.loading.show({message:"Submitting ..."}),p.emit(b.POST_PROPERTY_TYPE,o),c=setTimeout(()=>{n.loading.hide()},2e3)}function w(){o.clearValues(),T({loader:n.loading,timer:c})}function S(){T({loader:n.loading,timer:c})}return N(m,t=>{if(t){const e=u.value.find(l=>l.id===t);e&&(o.id=e.id,o.name=e.name,o.unitPrice=e.unitPrice)}else o.id=void 0,o.name="",o.unitPrice=0}),Y(()=>{p.off(b.POST_PROPERTY_TYPE)}),x(async()=>{u.value=await v.getPropertyTypes(),v.handlePostPropertyType(p,{onSuccess:w,onError:S})}),(t,e)=>(H(),W(D,null,{default:i(()=>[r("div",{style:y({backgroundColor:`${t.$getColor("light-page")}`,height:"100vh",padding:"0 1rem",width:"100%"})},[r("div",J,[r("div",K,[a($,{modelValue:s.value,"onUpdate:modelValue":e[0]||(e[0]=l=>s.value=l),dense:"","active-color":"dark","active-bg-color":"secondary"},{default:i(()=>[a(_,{name:"Property Types",icon:"home",label:"Property Types",style:{width:"15rem"}},null,8,["name","label"])]),_:1},8,["modelValue"])])]),r("div",L,[a(k,{modelValue:s.value,"onUpdate:modelValue":e[5]||(e[5]=l=>s.value=l),style:{"background-color":"inherit",height:"100%"}},{default:i(()=>[a(E,{name:"Property Types"},{default:i(()=>[r("div",null,[r("div",{style:y({width:"15rem",backgroundColor:`${t.$getColor("accent")}`,padding:"1rem",borderRadius:"0.4rem",boxShadow:""})},[r("div",{style:y({borderColor:`${t.$getColor("primary")}`,borderWidth:"0.1rem",borderStyle:"solid"})},[a(B,{class:"bg-secondary",label:"Property Type",modelValue:m.value,"onUpdate:modelValue":e[1]||(e[1]=l=>m.value=l),options:Q.value,"emit-value":"","map-options":"",clearable:""},null,8,["modelValue","options"])],4)],4),a(O,{rounded:"",class:"bg-accent q-mt-lg"},{default:i(()=>[a(f),r("div",null,[r("div",null,[a(f,null,{default:i(()=>[a(z(M),{onSubmit:e[4]||(e[4]=g(()=>{},["prevent"])),style:{width:"50vh",margin:"auto"}},{default:i(()=>[r("div",X,[a(P,{label:"Name",type:"text",modelValue:o.name,"onUpdate:modelValue":e[2]||(e[2]=l=>o.name=l),filled:"",outlined:"",color:"secondary","label-color":"dark",rules:[()=>t.$validateField(o,"name")]},null,8,["modelValue","rules"]),a(P,{label:"Unit Price",type:"number",modelValue:o.unitPrice,"onUpdate:modelValue":e[3]||(e[3]=l=>o.unitPrice=l),filled:"",outlined:"",color:"secondary","label-color":"dark",rules:[()=>t.$validateField(o,"unitPrice")]},null,8,["modelValue","rules"])]),r("div",Z,[a(A,{style:{width:"40%"},label:"submit",type:"submit",color:"primary",rounded:"",onClick:g(V,["prevent"])})])]),_:1})]),_:1})])])]),_:1})])]),_:1},8,["name"])]),_:1},8,["modelValue"])])],4)]),_:1}))}});export{ge as default};
