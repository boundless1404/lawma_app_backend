import{bK as s,i,bN as a,aS as p,c,h as u,bL as d,bQ as g,cc as l,g as f}from"./index.e12bd1bb.js";var $=s({name:"QPageContainer",setup(h,{slots:n}){const{proxy:{$q:r}}=f(),e=i(g,a);if(e===a)return console.error("QPageContainer needs to be child of QLayout"),a;p(l,!0);const o=c(()=>{const t={};return e.header.space===!0&&(t.paddingTop=`${e.header.size}px`),e.right.space===!0&&(t[`padding${r.lang.rtl===!0?"Left":"Right"}`]=`${e.right.size}px`),e.footer.space===!0&&(t.paddingBottom=`${e.footer.size}px`),e.left.space===!0&&(t[`padding${r.lang.rtl===!0?"Right":"Left"}`]=`${e.left.size}px`),t});return()=>u("div",{class:"q-page-container",style:o.value},d(n.default))}});export{$ as Q};
