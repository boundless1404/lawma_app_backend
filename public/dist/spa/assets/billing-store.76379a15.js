import{forageGetItem as s}from"./storeforage.b816bd1a.js";import{S as a,cr as n}from"./index.e12bd1bb.js";const o=await s(a.LGA_WARD_STREET)||{},m=n("billingStore",{state:()=>({billingDetails:o.billingDetails}),getters:{},actions:{async updateBilling({type:e,data:l}){var t;const i={billingDetail:()=>{this.billingDetails=l}};(t=i[e])==null||t.call(i)}}});export{m as u};